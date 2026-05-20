import express from "express";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { initiatePayment, completePayment } from "../../services/payment/payment.service.js";
import { createAuditLog } from "../../middleware/audit.middleware.js";

const router = express.Router();

router.post("/initiate", isAuthenticated, async (req, res, next) => {
  try {
    const { bookingId, gateway = "KHALTI" } = req.body || {};
    if (!bookingId) return res.status(400).json({ message: "bookingId is required" });

    const result = await initiatePayment({ bookingId, gateway, userId: req.currentUser._id });
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
});

router.post("/verify", isAuthenticated, async (req, res, next) => {
  try {
    const {
      pidx,
      paymentId,
      bookingId,
      purchase_order_id: purchaseOrderId,
      transactionUuid,
      transaction_uuid: transactionUuidLegacy,
      data: esewaData,
    } = req.body || {};
    const target = pidx || transactionUuid || transactionUuidLegacy || paymentId;
    const targetBookingId = bookingId || purchaseOrderId;
    if (!target && !targetBookingId && !esewaData) {
      return res.status(400).json({ message: "pidx, bookingId, transactionUuid, or eSewa data is required" });
    }

    const payment = await completePayment({ paymentId: target, bookingId: targetBookingId, esewaData });
    
    // Audit log for successful payment
    if (payment && payment.status === "COMPLETED") {
      await createAuditLog({
        entityType: "payment",
        entityId: payment._id,
        action: "completed",
        performedBy: req.currentUser._id,
        performedByRole: "user",
        changes: {
          before: { status: "INITIATED" },
          after: { status: "COMPLETED" },
          fields: ["status"],
        },
        metadata: {
          gateway: payment.gateway,
          transactionId: payment.transactionId,
          amount: payment.amount,
        },
      });
    }
    
    return res.json({ message: "Payment verified", payment });
  } catch (err) {
    return next(err);
  }
});

export default router;
