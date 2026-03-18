import axios from "axios";
import crypto from "crypto";
import OrganizerEvent from "../../models/OrganizerEvent.js";
import TicketType from "../../models/TicketType.js";
import Ticket from "../../models/Ticket.js";
import TicketPayment from "../../models/TicketPayment.js";
import { httpError } from "../../utils/http.utils.js";
import { buildEsewaPayload, getEsewaInitUrl, verifyEsewaTransaction } from "./esewa.service.js";
import ENV from "../../config/env.config.js";

const SUCCESS_STATUSES = new Set(["COMPLETE", "COMPLETED", "SUCCESS"]);
const KHALTI_INIT_URL = "https://a.khalti.com/api/v2/epayment/initiate/";
const KHALTI_LOOKUP_URL = "https://a.khalti.com/api/v2/epayment/lookup/";

function ensureAbsoluteUrl(value, fallbackOrigin) {
  try {
    return new URL(value, fallbackOrigin).toString();
  } catch {
    const origin = fallbackOrigin || "http://localhost:3000";
    return new URL("/", origin).toString();
  }
}

const FRONTEND_ORIGIN = ensureAbsoluteUrl(ENV.FRONTEND_ORIGIN || "http://localhost:3000", "http://localhost:3000");

async function generateUniqueQrCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = crypto.randomBytes(16).toString("hex");
    const exists = await Ticket.exists({ qrCodeValue: candidate });
    if (!exists) return candidate;
  }
  return null;
}

function buildTransactionUuid() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return crypto.randomBytes(16).toString("hex");
}

function isSuccessStatus(value) {
  const status = String(value || "").toUpperCase();
  return SUCCESS_STATUSES.has(status);
}

function isEventExpired(event) {
  if (!event?.endDateTime) return false;
  return new Date(event.endDateTime).getTime() < Date.now();
}

async function issueTicket({ eventId, ticketTypeId, userId, paymentId }) {
  const ticketType = await TicketType.findOneAndUpdate(
    {
      _id: ticketTypeId,
      eventId,
      isActive: true,
      $expr: { $lt: ["$quantitySold", "$quantityTotal"] },
    },
    { $inc: { quantitySold: 1 } },
    { new: true }
  );

  if (!ticketType) throw httpError(409, "Ticket type is sold out or unavailable");

  const qrCodeValue = await generateUniqueQrCode();
  if (!qrCodeValue) throw httpError(500, "Failed to generate ticket code");

  return Ticket.create({
    eventId,
    ticketTypeId: ticketType._id,
    ownerUserId: userId,
    paymentId: paymentId || null,
    qrCodeValue,
    status: "ACTIVE",
  });
}

export async function initiateTicketPayment({ eventId, ticketTypeId, userId, accessCode, gateway }) {
  const event = await OrganizerEvent.findById(eventId).lean();
  if (!event) throw httpError(404, "Event not found");
  if (event.status !== "PUBLISHED") throw httpError(400, "Event is not available");
  if (isEventExpired(event)) throw httpError(400, "Event has ended");

  if (!event.isPublic) {
    const code = String(accessCode || "").trim();
    if (!code || code !== String(event.accessCode || "")) {
      throw httpError(403, "Access denied");
    }
  }

  const ticketType = await TicketType.findOne({ _id: ticketTypeId, eventId: event._id, isActive: true }).lean();
  if (!ticketType) throw httpError(404, "Ticket type not found");

  const amount = Number(ticketType.price || 0);
  const transactionUuid = buildTransactionUuid();

  if (amount <= 0) {
    const paymentDoc = await TicketPayment.create({
      eventId: event._id,
      ticketTypeId,
      userId,
      amount: 0,
      currency: "NPR",
      gateway: "FREE",
      status: "COMPLETED",
      transactionUuid,
      paidAt: new Date(),
      gatewayResponse: { mode: "free" },
    });
    const ticket = await issueTicket({ eventId: event._id, ticketTypeId, userId, paymentId: paymentDoc._id });
    paymentDoc.ticketId = ticket._id;
    await paymentDoc.save();
    return { mode: "free", ticket };
  }

  const normalizedGateway = String(gateway || "ESEWA").trim().toUpperCase();
  if (!["ESEWA", "KHALTI"].includes(normalizedGateway)) {
    throw httpError(400, "Unsupported gateway");
  }

  if (normalizedGateway === "KHALTI") {
    if (!ENV.KHALTI_SECRET_KEY) throw httpError(500, "KHALTI_SECRET_KEY not configured");

    const amountPaisa = Math.round(Number(amount) * 100);
    const returnUrl = ensureAbsoluteUrl(ENV.KHALTI_TICKET_RETURN_URL || "/tickets/verify", FRONTEND_ORIGIN);

    const initPayload = {
      return_url: returnUrl,
      website_url: ensureAbsoluteUrl(ENV.KHALTI_WEBSITE_URL || FRONTEND_ORIGIN, FRONTEND_ORIGIN),
      amount: amountPaisa,
      purchase_order_id: transactionUuid,
      purchase_order_name: event?.name || "Event Ticket",
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

    const payment = await TicketPayment.create({
      eventId: event._id,
      ticketTypeId,
      userId,
      amount,
      currency: "NPR",
      gateway: "KHALTI",
      status: "INITIATED",
      transactionUuid,
      gatewayResponse: { pidx },
    });

    return {
      mode: "khalti",
      paymentUrl,
      paymentId: payment._id,
      pidx,
      transactionUuid,
    };
  }

  const successUrl = ensureAbsoluteUrl(ENV.ESEWA_TICKET_SUCCESS_URL || "/tickets/verify", FRONTEND_ORIGIN);
  const failureUrl = ensureAbsoluteUrl(ENV.ESEWA_TICKET_FAILURE_URL || `/events/${event._id}`, FRONTEND_ORIGIN);

  const payload = buildEsewaPayload({
    amount,
    transactionUuid,
    successUrl,
    failureUrl,
  });

  const payment = await TicketPayment.create({
    eventId: event._id,
    ticketTypeId,
    userId,
    amount,
    currency: "NPR",
    gateway: "ESEWA",
    status: "INITIATED",
    transactionUuid,
    gatewayResponse: { payload },
  });

  return {
    mode: "esewa",
    paymentUrl: getEsewaInitUrl(),
    payload,
    paymentId: payment._id,
    transactionUuid,
  };
}

export async function verifyTicketPayment({ transactionUuid, pidx, userId }) {
  let payment = null;
  if (pidx) {
    payment = await TicketPayment.findOne({ "gatewayResponse.pidx": pidx });
  }
  if (!payment && transactionUuid) {
    payment = await TicketPayment.findOne({ transactionUuid });
  }
  if (!payment) throw httpError(404, "Payment not found");

  if (userId && String(payment.userId) !== String(userId)) {
    throw httpError(403, "Not your payment");
  }

  if (payment.status === "COMPLETED" && payment.ticketId) {
    const ticket = await Ticket.findById(payment.ticketId);
    return { payment, ticket };
  }

  if (payment.gateway === "ESEWA") {
    const verification = await verifyEsewaTransaction({
      transactionUuid: payment.transactionUuid,
      totalAmount: payment.amount,
    });

    payment.gatewayResponse = verification;

    if (!isSuccessStatus(verification?.status)) {
      payment.status = "FAILED";
      await payment.save();
      throw httpError(400, "Payment not completed");
    }

    const ticket = await issueTicket({
      eventId: payment.eventId,
      ticketTypeId: payment.ticketTypeId,
      userId: payment.userId,
      paymentId: payment._id,
    });

    payment.status = "COMPLETED";
    payment.ticketId = ticket._id;
    payment.transactionId =
      verification?.reference_id || verification?.ref_id || verification?.transaction_id || payment.transactionUuid;
    payment.paidAt = new Date();
    await payment.save();

    return { payment, ticket };
  }

  if (payment.gateway === "KHALTI") {
    if (!ENV.KHALTI_SECRET_KEY) throw httpError(500, "KHALTI_SECRET_KEY not configured");
    const khaltiPidx = payment.gatewayResponse?.pidx || pidx;
    if (!khaltiPidx) throw httpError(400, "Missing pidx for verification");

    const lookupRes = await axios.post(
      KHALTI_LOOKUP_URL,
      { pidx: khaltiPidx },
      {
        headers: {
          Authorization: `Key ${ENV.KHALTI_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { status, transaction_id: transactionId, detail, error_key: errorKey } = lookupRes.data || {};
    payment.gatewayResponse = { ...payment.gatewayResponse, verification: lookupRes.data || {} };

    if (status !== "Completed") {
      payment.status = "FAILED";
      await payment.save();
      throw httpError(400, errorKey ? `${detail || "Payment not completed"} (${errorKey})` : detail || "Payment not completed");
    }

    const ticket = await issueTicket({
      eventId: payment.eventId,
      ticketTypeId: payment.ticketTypeId,
      userId: payment.userId,
      paymentId: payment._id,
    });

    payment.status = "COMPLETED";
    payment.ticketId = ticket._id;
    payment.transactionId = transactionId || payment.transactionUuid;
    payment.paidAt = new Date();
    await payment.save();

    return { payment, ticket };
  }

  throw httpError(400, "Unsupported gateway");
}
