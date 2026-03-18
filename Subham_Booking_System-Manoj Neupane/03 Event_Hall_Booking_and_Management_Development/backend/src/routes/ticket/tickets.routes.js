import express from "express";
import mongoose from "mongoose";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import Ticket from "../../models/Ticket.js";
import { initiateTicketPayment, verifyTicketPayment } from "../../services/payment/ticketPayment.service.js";

const router = express.Router();

router.post("/initiate", isAuthenticated, async (req, res, next) => {
  try {
    const { eventId, ticketTypeId, accessCode, gateway } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Valid eventId is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(ticketTypeId)) {
      return res.status(400).json({ message: "Valid ticketTypeId is required" });
    }

    const result = await initiateTicketPayment({
      eventId,
      ticketTypeId,
      userId: req.currentUser._id,
      accessCode,
      gateway,
    });

    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
});

router.post("/verify", isAuthenticated, async (req, res, next) => {
  try {
    const transactionUuid = String(req.body?.transactionUuid || req.body?.transaction_uuid || "").trim();
    const pidx = String(req.body?.pidx || "").trim();
    if (!transactionUuid && !pidx) {
      return res.status(400).json({ message: "transactionUuid or pidx is required" });
    }

    const result = await verifyTicketPayment({ transactionUuid, pidx, userId: req.currentUser._id });
    return res.json({ message: "Ticket payment verified", ...result });
  } catch (err) {
    return next(err);
  }
});

router.get("/my", isAuthenticated, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const status = String(req.query.status || "").toUpperCase();

    const filter = { ownerUserId: req.currentUser._id };
    if (["ACTIVE", "CANCELLED", "REFUNDED"].includes(status)) {
      filter.status = status;
    }

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "eventId", select: "name type startDateTime endDateTime hallId" })
        .populate({ path: "ticketTypeId", select: "name price" })
        .populate({ path: "eventId.hallId", select: "name slug" })
        .lean(),
      Ticket.countDocuments(filter),
    ]);

    return res.json({
      tickets,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
