import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import Payment from "../../models/Payment.js";
import Booking from "../../models/Booking.js";
import ENV from "../../config/env.config.js";
import { httpError } from "../../utils/http.utils.js";
import { buildEsewaPayload, getEsewaInitUrl, verifyEsewaTransaction, verifyEsewaData } from "./esewa.service.js";

const KHALTI_INIT_URL = "https://a.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL = "https://a.khalti.com/api/v2/epayment/lookup/";
const SUCCESS_STATUSES = new Set(["COMPLETE", "COMPLETED", "SUCCESS"]);

function buildTransactionUuid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return crypto.randomBytes(16).toString("hex");
}

function isSuccessStatus(value) {
  const status = String(value || "").toUpperCase();
  return SUCCESS_STATUSES.has(status);
}

function normalizePaymentTarget(value) {
  const target = String(value || "").trim();
  if (!target) return null;

  const dataMarker = target.indexOf("?data=");
  if (dataMarker !== -1) return target.slice(0, dataMarker);

  return target;
}

function extractEsewaDataFromTarget(value) {
  const target = String(value || "").trim();
  const dataMarker = target.indexOf("?data=");
  if (dataMarker === -1) return null;
  return target.slice(dataMarker + "?data=".length);
}

async function markBookingPaidAwaitingApproval(payment, session) {
  let query = Booking.findById(payment.bookingId);
  if (session) query = query.session(session);
  const booking = await query;

  if (!booking) {
    throw httpError(409, "Payment verified but booking record was not found");
  }
  if (booking.status === "CANCELLED") {
    throw httpError(409, "Payment verified but booking is cancelled");
  }

  booking.paymentId = payment._id;
  booking.reservedUntil = null;
  if (!["CONFIRMED", "COMPLETED"].includes(booking.status)) {
    booking.status = "PENDING";
    booking.confirmedAt = null;
  }

  await booking.save(session ? { session } : undefined);
  return booking;
}

export function calculateBookingTotal(booking) {
  return Number(booking?.totalAmount || 0);
}

export async function initiatePayment({ bookingId, gateway, userId }) {
  const normalizedGateway = String(gateway || "").toUpperCase();
  if (!["KHALTI", "ESEWA"].includes(normalizedGateway)) {
    throw httpError(400, "Unsupported gateway");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) throw httpError(404, "Booking not found");
  if (String(booking.userId) !== String(userId)) throw httpError(403, "Not your booking");
  if (booking.status === "CANCELLED") throw httpError(400, "Booking is cancelled");

  const amount = calculateBookingTotal(booking);

  if (normalizedGateway === "KHALTI") {
    if (!ENV.KHALTI_SECRET_KEY) throw httpError(500, "KHALTI_SECRET_KEY not configured");

    // Khalti expects amount in paisa
    const amountPaisa = Math.round(Number(amount) * 100);

    const initPayload = {
      return_url: ENV.KHALTI_RETURN_URL || `${ENV.FRONTEND_ORIGIN}/payment/verify`,
      website_url: ENV.KHALTI_WEBSITE_URL || ENV.FRONTEND_ORIGIN,
      amount: amountPaisa,
      purchase_order_id: String(bookingId),
      purchase_order_name: booking?.eventName || booking?.hallName || "Hall Booking",
    };

    let khaltiRes;
    try {
      khaltiRes = await axios.post(KHALTI_INIT_URL, initPayload, {
        headers: {
          Authorization: `Key ${ENV.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      const detail = err?.response?.data?.detail || err?.response?.data?.message;
      const errorKey = err?.response?.data?.error_key;
      const message = detail || "Payment initiation failed";
      const code = err?.response?.status || 500;
      throw httpError(code, errorKey ? `${message} (${errorKey})` : message);
    }

    const { pidx, payment_url: paymentUrl } = khaltiRes.data || {};
    if (!pidx || !paymentUrl) throw httpError(500, "Invalid response from Khalti");

    const payment = await Payment.create({
      bookingId,
      userId,
      amount,
      gateway: normalizedGateway,
      status: "INITIATED",
      gatewayResponse: { pidx },
    });

    return { paymentUrl, paymentId: payment._id, pidx };
  }

  const transactionUuid = buildTransactionUuid();
  const successUrl = ENV.ESEWA_BOOKING_SUCCESS_URL || `${ENV.FRONTEND_ORIGIN}/payment/verify`;
  const failureUrl = ENV.ESEWA_BOOKING_FAILURE_URL || `${ENV.FRONTEND_ORIGIN}/bookings`;

  const payload = buildEsewaPayload({
    amount,
    transactionUuid,
    successUrl,
    failureUrl,
  });

  const payment = await Payment.create({
    bookingId,
    userId,
    amount,
    gateway: normalizedGateway,
    status: "INITIATED",
    gatewayResponse: { transactionUuid, payload },
  });

  return {
    paymentUrl: getEsewaInitUrl(),
    payload,
    paymentId: payment._id,
    transactionUuid,
  };
}

export async function completePayment({ paymentId, bookingId, esewaData }) {
  const target = normalizePaymentTarget(paymentId);
  const targetBookingId = normalizePaymentTarget(bookingId);
  const effectiveEsewaData = esewaData || extractEsewaDataFromTarget(paymentId);

  // Prefer lookup by pidx; fallback to transaction UUID/ObjectId when present.
  let payment = null;
  if (target) {
    payment = await Payment.findOne({ "gatewayResponse.pidx": target });
    if (!payment) {
      payment = await Payment.findOne({ "gatewayResponse.transactionUuid": target });
    }
  }
  // If eSewa data provided, try to extract transaction_uuid from it and look up
  if (!payment && effectiveEsewaData) {
    try {
      const decoded = JSON.parse(Buffer.from(effectiveEsewaData, "base64").toString("utf-8"));
      const uuid = decoded.transaction_uuid;
      if (uuid) {
        payment = await Payment.findOne({ "gatewayResponse.transactionUuid": uuid });
      }
    } catch { /* fall through */ }
  }
  if (!payment && target && mongoose.Types.ObjectId.isValid(target)) {
    payment = await Payment.findById(target);
  }
  if (!payment && targetBookingId && mongoose.Types.ObjectId.isValid(targetBookingId)) {
    payment = await Payment.findOne({ bookingId: targetBookingId });
  }

  if (!payment) throw httpError(404, "Payment not found");
  if (payment.status === "COMPLETED") {
    await markBookingPaidAwaitingApproval(payment);
    return payment;
  }

  // Start transaction for atomic payment verification and booking update
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Re-fetch payment within transaction to get fresh state
    payment = await Payment.findById(payment._id).session(session);
    if (!payment) throw httpError(404, "Payment not found");
    if (payment.status === "COMPLETED") {
      await markBookingPaidAwaitingApproval(payment, session);
      await session.commitTransaction();
      return payment;
    }

    if (payment.gateway === "KHALTI") {
      if (!ENV.KHALTI_SECRET_KEY) throw httpError(500, "KHALTI_SECRET_KEY not configured");

      const pidx = payment.gatewayResponse?.pidx || (!mongoose.Types.ObjectId.isValid(target) ? target : null);
      if (!pidx) throw httpError(400, "Missing pidx for verification");

      const lookupRes = await axios.post(
        KHALTI_LOOKUP_URL,
        { pidx },
        {
          headers: {
            Authorization: `Key ${ENV.KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { status, transaction_id: transactionId, detail, error_key: errorKey } = lookupRes.data || {};
      payment.gatewayResponse = { ...payment.gatewayResponse, verification: lookupRes.data || {} };

      if (!isSuccessStatus(status)) {
        payment.status = "FAILED";
        await payment.save({ session });
        await session.commitTransaction();
        throw httpError(400, errorKey ? `${detail || "Payment not completed"} (${errorKey})` : detail || "Payment not completed");
      }

      payment.status = "COMPLETED";
      payment.transactionId = transactionId || paymentId;
      payment.paidAt = new Date();
      await payment.save({ session });
    } else if (payment.gateway === "ESEWA") {
      const transactionUuid = payment.gatewayResponse?.transactionUuid || (!mongoose.Types.ObjectId.isValid(target) ? target : null);

      let verification;

      // Primary: verify eSewa v2 `data` signature (no extra network call)
      if (effectiveEsewaData) {
        verification = verifyEsewaData(effectiveEsewaData); // throws 400 on bad signature
      } else {
        // Fallback: hit eSewa status API
        if (!transactionUuid) throw httpError(400, "Missing transaction_uuid for verification");
        verification = await verifyEsewaTransaction({
          transactionUuid,
          totalAmount: payment.amount,
        });
      }

      payment.gatewayResponse = { ...payment.gatewayResponse, verification };

      if (!isSuccessStatus(verification?.status)) {
        payment.status = "FAILED";
        await payment.save({ session });
        await session.commitTransaction();
        throw httpError(400, "Payment not completed");
      }

      payment.status = "COMPLETED";
      payment.transactionId =
        verification?.transaction_code ||
        verification?.reference_id ||
        verification?.ref_id ||
        verification?.transaction_id ||
        transactionUuid;
      payment.paidAt = new Date();
      await payment.save({ session });
    } else {
      throw httpError(400, "Unsupported gateway for verification");
    }

    // Link completed payment and keep booking pending until admin approval.
    await markBookingPaidAwaitingApproval(payment, session);

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }

  return payment;
}
