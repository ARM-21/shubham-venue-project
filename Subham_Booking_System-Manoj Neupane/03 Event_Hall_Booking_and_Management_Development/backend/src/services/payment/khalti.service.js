import Payment from "../../models/Payment.js";
import Booking from "../../models/Booking.js";
import { initiateKhaltiPayment, verifyKhaltiPayment } from "./khalti.service.js";
import { httpError } from "../../utils/http.utils.js";

export async function createPayment({ bookingId, userId, gateway }) {
  const booking = await Booking.findById(bookingId).populate("hallId");
  if (!booking) throw httpError(404, "Booking not found");
  
  // only allow payment if admin approved
  if (booking.status !== "approved") throw httpError(400, "Booking not approved yet");
  if (booking.paymentStatus === "paid") throw httpError(400, "Already paid");

  const amount = calculateBookingTotal(booking); 

  const payment = await Payment.create({
    bookingId,
    userId,
    amount,
    gateway,
    status: "initiated",
  });

  if (gateway === "khalti") {
    const { paymentUrl, pidx } = await initiateKhaltiPayment({
      amount,
      bookingId,
      userId,
      returnUrl: `${process.env.FRONTEND_URL}/payment/verify?pidx=${pidx}`,
    });

    payment.gatewayResponse = { pidx };
    await payment.save();

    return { paymentUrl, paymentId: payment._id };
  }

  // similar for esewa
  throw httpError(400, "Unsupported gateway");
}

export async function verifyPayment(pidx) {
  const payment = await Payment.findOne({ "gatewayResponse.pidx": pidx });
  if (!payment) throw httpError(404, "Payment not found");

  const verification = await verifyKhaltiPayment(pidx);

  if (verification.status === "Completed") {
    payment.status = "completed";
    payment.transactionId = verification.transactionId;
    payment.paidAt = new Date();
    await payment.save();

    // update booking
    await Booking.findByIdAndUpdate(payment.bookingId, {
      paymentStatus: "paid",
      paymentId: payment._id,
    });

    // TODO: generate invoice, send email

    return { success: true, payment };
  }

  throw httpError(400, "Payment not completed");
}
