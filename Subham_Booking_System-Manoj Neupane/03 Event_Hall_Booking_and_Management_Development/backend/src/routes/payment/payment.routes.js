import express from "express";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { initiatePayment, completePayment } from "../../services/payment/payment.service.js";

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
    const { pidx, paymentId, transactionUuid, transaction_uuid: transactionUuidLegacy } = req.body || {};
    const target = pidx || transactionUuid || transactionUuidLegacy || paymentId;
    if (!target) return res.status(400).json({ message: "pidx or transactionUuid is required" });

    const payment = await completePayment({ paymentId: target });
    return res.json({ message: "Payment verified", payment });
  } catch (err) {
    return next(err);
  }
});

export default router;

