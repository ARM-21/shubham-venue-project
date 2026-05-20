import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import axios from "axios";
import Booking from "../../models/Booking.js";
import Payment from "../../models/Payment.js";
import SystemConfig from "../../models/SystemConfig.js";
import ENV from "../../config/env.config.js";
import { httpError } from "../../utils/http.utils.js";

function isAdmin(user) {
  return String(user?.role || "").toLowerCase() === "admin";
}

function amount(num) {
  return Number(num || 0);
}

function formatCurrency(num) {
  return `NPR ${amount(num).toFixed(2)}`;
}

async function fetchLogoBuffer(url) {
  if (!url) return null;
  try {
    const res = await axios.get(url, { responseType: "arraybuffer" });
    return Buffer.from(res.data);
  } catch (err) {
    console.warn("Branding logo fetch failed", err?.message);
    return null;
  }
}

async function buildQrBuffer(data) {
  const qrDataUrl = await QRCode.toDataURL(data, { errorCorrectionLevel: "M", margin: 1, width: 240 });
  const base64 = qrDataUrl.split(",")[1];
  return Buffer.from(base64, "base64");
}

function computeTotals(booking, config) {
  const addonsTotal = Array.isArray(booking.addons)
    ? booking.addons.reduce((sum, a) => sum + amount(a.price), 0)
    : 0;

  const subtotal = amount(booking.hallPrice) + amount(booking.menuTotal) + amount(booking.decorationTotal) + addonsTotal;
  const serviceCharge = subtotal * (amount(config.serviceChargePercent) / 100);
  const taxable = subtotal + serviceCharge;
  const tax = taxable * (amount(config.taxPercent) / 100);
  const grandTotal = taxable + tax;

  return { addonsTotal, subtotal, serviceCharge, taxable, tax, grandTotal };
}

function buildBookingsPageUrl({ bookingId, paymentId }) {
  const url = new URL("/bookings", ENV.FRONTEND_ORIGIN || "http://localhost:3000");
  if (bookingId) url.searchParams.set("bookingId", String(bookingId));
  if (paymentId) url.searchParams.set("invoice", String(paymentId));
  return url.toString();
}

export async function streamBookingInvoice({ bookingId, currentUser, res }) {
  const booking = await Booking.findById(bookingId)
    .populate({ path: "hallId", select: "name location" })
    .lean();

  if (!booking) throw httpError(404, "Booking not found");
  if (!isAdmin(currentUser) && String(booking.userId) !== String(currentUser?._id)) {
    throw httpError(403, "Not authorized to view this invoice");
  }
  if (!["CONFIRMED", "COMPLETED"].includes(booking.status)) {
    throw httpError(400, "Invoice available only after admin approval");
  }

  const payment = await Payment.findOne({ bookingId: booking._id }).sort({ paidAt: -1, createdAt: -1 }).lean();
  // Invoice only available if payment is COMPLETED (for all payment gateways including CASH)
  if (!payment || payment.status !== "COMPLETED") {
    throw httpError(400, "Invoice available only after payment is confirmed");
  }

  const config = (await SystemConfig.findOne({ key: "default" }).lean()) || {};
  const totals = computeTotals(booking, config);

  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const filename = `invoice-${booking._id}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
  doc.pipe(res);

  // Header
  const logoBuffer = await fetchLogoBuffer(config.brandingLogoUrl);
  if (logoBuffer) {
    try {
      doc.image(logoBuffer, 40, 40, { fit: [80, 80] });
    } catch {
      // ignore logo errors
    }
  }

  doc
    .fontSize(18)
    .text(config.invoiceOrgName || "Event Manager", logoBuffer ? 140 : 40, 40)
    .fontSize(10)
    .fillColor("#444")
    .text(config.invoiceOrgAddress || "", logoBuffer ? 140 : 40, 64)
    .text(config.invoiceTaxId ? `Tax ID: ${config.invoiceTaxId}` : "", logoBuffer ? 140 : 40, 78)
    .moveDown(2)
    .fillColor("#000")
    .fontSize(16)
    .text("Invoice", { align: "right" })
    .fontSize(10)
    .text(`Invoice ID: ${payment._id}`, { align: "right" })
    .text(`Booking ID: ${booking._id}`, { align: "right" })
    .text(`Date: ${new Date().toISOString().slice(0, 10)}`, { align: "right" })
    .moveDown();

  // Customer + booking info
  doc
    .fontSize(12)
    .text("Billed To", 40)
    .fontSize(10)
    .text(`User ID: ${booking.userId}`, 40)
    .text(`Event: ${booking.eventName || "-"}`, 40)
    .text(`Hall: ${booking.hallId?.name || "-"}`, 40)
    .text(`Date: ${booking.date ? new Date(booking.date).toISOString().slice(0, 10) : "-"}`, 40)
    .text(`Slot: ${booking.slot}`, 40)
    .moveDown();

  // Line items
  doc.fontSize(12).text("Charges", 40).moveDown(0.5);
  doc.fontSize(10);

  const line = (label, value) => {
    doc.text(label, 40, doc.y, { continued: true }).text(formatCurrency(value), { align: "right" });
  };

  line("Hall", booking.hallPrice || 0);
  line("Menu", booking.menuTotal || 0);
  line("Decoration", booking.decorationTotal || 0);
  if (totals.addonsTotal > 0) line("Add-ons", totals.addonsTotal);
  doc.moveDown(0.5);
  line("Subtotal", totals.subtotal);
  if (amount(config.serviceChargePercent) > 0) {
    line(`Service Charge (${amount(config.serviceChargePercent)}%)`, totals.serviceCharge);
  }
  line(`Tax (${amount(config.taxPercent)}%)`, totals.tax);
  doc.moveDown(0.5);
  line("Grand Total", totals.grandTotal);

  // Payment info
  doc.moveDown(1);
  doc.fontSize(12).text("Payment", 40).moveDown(0.5);
  doc.fontSize(10)
    .text(`Gateway: ${payment.gateway}`)
    .text(`Status: ${payment.status}`)
    .text(`Paid At: ${payment.paidAt ? new Date(payment.paidAt).toISOString() : "-"}`)
    .text(payment.transactionId ? `Transaction ID: ${payment.transactionId}` : "");

  // QR code
  doc.moveDown(1);
  const qrData = buildBookingsPageUrl({ bookingId: booking._id, paymentId: payment._id });
  const qrBuffer = await buildQrBuffer(qrData);
  doc.text("Scan to verify", 40);
  doc.image(qrBuffer, 40, doc.y + 10, { fit: [120, 120] });

  doc.end();
}
