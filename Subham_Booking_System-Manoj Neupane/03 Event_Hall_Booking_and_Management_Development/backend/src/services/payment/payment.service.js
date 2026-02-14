import axios from "axios";
import mongoose from "mongoose";
import Payment from "../../models/Payment.js";
import Booking from "../../models/Booking.js";
import ENV from "../../config/env.config.js";
import { httpError } from "../../utils/http.utils.js";

const KHALTI_INIT_URL = "https://a.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL = "https://a.khalti.com/api/v2/epayment/lookup/";

export function calculateBookingTotal(booking) {
  return Number(booking?.totalAmount || 0);
}

export async function initiatePayment({ bookingId, gateway, userId }) {
  if (gateway !== "KHALTI") throw httpError(400, "Unsupported gateway");

  const booking = await Booking.findById(bookingId);
  if (!booking) throw httpError(404, "Booking not found");
  if (String(booking.userId) !== String(userId)) throw httpError(403, "Not your booking");
  if (booking.status === "CANCELLED") throw httpError(400, "Booking is cancelled");

  const amount = calculateBookingTotal(booking);
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
    gateway,
    status: "INITIATED",
    gatewayResponse: { pidx },
  });

  return { paymentUrl, paymentId: payment._id, pidx };
}

export async function completePayment({ paymentId }) {
  const target = paymentId;

  // Prefer lookup by pidx; fallback to ObjectId when valid
  let payment = await Payment.findOne({ "gatewayResponse.pidx": target });
  if (!payment && mongoose.Types.ObjectId.isValid(target)) {
    payment = await Payment.findById(target);
  }

  if (!payment) throw httpError(404, "Payment not found");
  if (payment.status === "COMPLETED") return payment;

  if (payment.gateway !== "KHALTI") throw httpError(400, "Unsupported gateway for verification");

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
  payment.gatewayResponse = lookupRes.data || {};

  if (status !== "Completed") {
    payment.status = "FAILED";
    await payment.save();
    throw httpError(400, errorKey ? `${detail || "Payment not completed"} (${errorKey})` : detail || "Payment not completed");
  }

  payment.status = "COMPLETED";
  payment.transactionId = transactionId || paymentId;
  payment.paidAt = new Date();
  await payment.save();

  await Booking.findByIdAndUpdate(payment.bookingId, {
    // keep status unchanged; admin will approve/reject manually even after payment
    reservedUntil: null,
    paymentId: payment._id,
    cancelledAt: null,
    cancellationReason: null,
  });

  return payment;
}
