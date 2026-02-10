import express from "express";
import mongoose from "mongoose";
import Booking from "../../../models/Booking.js";
import Payment from "../../../models/Payment.js";
import Menu from "../../../models/menu/Menu.js";
import DecorationScheme from "../../../models/DecorationScheme.js";
import User from "../../../models/User.js";

const router = express.Router();

router.patch("/:id/status", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const nextStatus = (status || "").toUpperCase();
    const allowedTargets = ["CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!allowedTargets.includes(nextStatus)) {
      return res.status(400).json({ message: "status must be CONFIRMED|CANCELLED|COMPLETED" });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const current = booking.status;
    const canTransition = (from, to) => {
      if (from === "PENDING" && (to === "CONFIRMED" || to === "CANCELLED")) return true;
      if (from === "CONFIRMED" && (to === "CANCELLED" || to === "COMPLETED")) return true;
      if (from === "CANCELLED" && to === "CONFIRMED") return true;
      return false;
    };

    if (!canTransition(current, nextStatus)) {
      return res.status(400).json({ message: `Cannot change status from ${current} to ${nextStatus}` });
    }

    booking.status = nextStatus;
    booking.reservedUntil = null;

    if (nextStatus === "CONFIRMED") {
      booking.confirmedAt = new Date();
      booking.cancelledAt = null;
      booking.cancellationReason = null;
    }

    if (nextStatus === "CANCELLED") {
      booking.cancelledAt = new Date();
      booking.cancellationReason = reason || null;
    }

    if (nextStatus === "COMPLETED") {
      booking.cancelledAt = null;
      booking.cancellationReason = null;
    }

    await booking.save();

    return res.json({ message: "Booking status updated", booking });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, slot, guests, hallId, eventName, eventType, specialRequirements } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const updates = {};

    if (eventName !== undefined) updates.eventName = eventName;
    if (eventType !== undefined) updates.eventType = eventType;
    if (specialRequirements !== undefined) updates.specialRequirements = specialRequirements;
    if (guests !== undefined) {
      const g = Number(guests);
      if (!Number.isFinite(g) || g < 1) return res.status(400).json({ message: "guests must be a positive number" });
      updates.guests = g;
    }

    const nextHallId = hallId && mongoose.Types.ObjectId.isValid(hallId) ? new mongoose.Types.ObjectId(hallId) : booking.hallId;
    const nextSlot = slot || booking.slot;
    const nextDateStr = date || booking.date?.toISOString?.().slice(0, 10);

    if (!["morning", "evening", "wholeday"].includes(nextSlot)) {
      return res.status(400).json({ message: "slot must be morning|evening|wholeday" });
    }

    const dateObj = new Date(`${nextDateStr}T00:00:00.000Z`);
    if (Number.isNaN(dateObj.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const conflictSlots = nextSlot === "wholeday"
      ? ["morning", "evening", "wholeday"]
      : nextSlot === "morning"
        ? ["morning", "wholeday"]
        : ["evening", "wholeday"];

    const rangeStart = dateObj;
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

    const blocking = await Booking.findOne({
      _id: { $ne: booking._id },
      hallId: nextHallId,
      date: { $gte: rangeStart, $lt: rangeEnd },
      slot: { $in: conflictSlots },
      status: { $in: ["PENDING", "CONFIRMED", "COMPLETED"] },
    }).select("_id status slot").lean();

    if (blocking) {
      return res.status(400).json({ message: "Hall not available for the selected date/slot" });
    }

    updates.hallId = nextHallId;
    updates.slot = nextSlot;
    updates.date = dateObj;

    booking.set(updates);
    await booking.save();

    return res.json({ message: "Booking updated", booking });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id/payment", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, gateway = "cash" } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const nextStatus = (status || "").toLowerCase();
    const allowedStatuses = ["initiated", "completed", "failed", "refunded"];
    if (!allowedStatuses.includes(nextStatus)) {
      return res.status(400).json({ message: "status must be initiated|completed|failed|refunded" });
    }

    const allowedGateways = ["khalti", "esewa", "cash"];
    if (!allowedGateways.includes(gateway)) {
      return res.status(400).json({ message: "gateway must be khalti|esewa|cash" });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    let payment = booking.paymentId ? await Payment.findById(booking.paymentId) : null;
    if (!payment) {
      payment = await Payment.findOne({ bookingId: booking._id }).sort({ createdAt: -1 });
    }

    if (!payment) {
      payment = await Payment.create({
        bookingId: booking._id,
        userId: booking.userId,
        amount: booking.totalAmount,
        gateway,
        status: "initiated",
      });
    }

    payment.status = nextStatus;
    payment.gateway = gateway;
    payment.paidAt = nextStatus === "completed" ? payment.paidAt || new Date() : null;
    await payment.save();

    if (!booking.paymentId || String(booking.paymentId) !== String(payment._id)) {
      booking.paymentId = payment._id;
      await booking.save();
    }

    return res.json({ message: "Payment updated", payment });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const deleted = await Booking.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Booking not found" });

    return res.json({ message: "Booking deleted" });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const {
      status,
      hallId,
      dateFrom,
      dateTo,
      q,
      page = 1,
      limit = 20,
    } = req.query || {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const match = {};
    const statusUpper = (status || "").toUpperCase();
    if (["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(statusUpper)) {
      match.status = statusUpper;
    }

    if (hallId && mongoose.Types.ObjectId.isValid(hallId)) {
      match.hallId = new mongoose.Types.ObjectId(hallId);
    }

    if (dateFrom || dateTo) {
      match.date = {};
      if (dateFrom) {
        const fromDate = new Date(`${dateFrom}T00:00:00.000Z`);
        if (Number.isNaN(fromDate.getTime())) return res.status(400).json({ message: "Invalid dateFrom" });
        match.date.$gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(`${dateTo}T23:59:59.999Z`);
        if (Number.isNaN(toDate.getTime())) return res.status(400).json({ message: "Invalid dateTo" });
        match.date.$lte = toDate;
      }
    }

    const search = (q || "").trim();
    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        match._id = new mongoose.Types.ObjectId(search);
      } else {
        const users = await User.find({
          $or: [
            { first_name: search },
            { last_name: search },
            { email: search },
          ],
        })
          .collation({ locale: "en", strength: 2 })
          .select("_id")
          .lean();

        const userIds = users.map((u) => u._id);
        if (!userIds.length) {
          return res.json({ items: [], page: pageNum, limit: limitNum, total: 0, pages: 1 });
        }
        match.userId = { $in: userIds };
      }
    }

    const [items, total] = await Promise.all([
      Booking.find(match)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate({ path: "userId", select: "first_name last_name email profilePicture" })
        .populate({ path: "hallId", select: "name" })
        .populate({ path: "paymentId", select: "status gateway amount paidAt" })
        .lean(),
      Booking.countDocuments(match),
    ]);

    const normalized = items.map((b) => ({
      id: b._id,
      hall: { id: b.hallId?._id, name: b.hallId?.name },
      user: {
        id: b.userId?._id,
        firstName: b.userId?.first_name,
        lastName: b.userId?.last_name,
        email: b.userId?.email,
        profilePicture: b.userId?.profilePicture,
      },
      date: b.date,
      slot: b.slot,
      guests: b.guests,
      totalAmount: b.totalAmount,
      status: b.status,
      createdAt: b.createdAt,
      payment: b.paymentId
        ? {
            id: b.paymentId?._id,
            status: b.paymentId?.status,
            gateway: b.paymentId?.gateway,
            amount: b.paymentId?.amount,
            paidAt: b.paymentId?.paidAt,
          }
        : null,
    }));

    return res.json({
      items: normalized,
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.max(1, Math.ceil(total / limitNum)),
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id)
      .populate({ path: "userId", select: "first_name last_name email phone profilePicture" })
      .populate({ path: "hallId", select: "name capacity price" })
      .populate({ path: "paymentId", select: "status gateway amount paidAt transactionId" })
      .lean();

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const decoration = booking.decorationScheme?.schemeId && mongoose.Types.ObjectId.isValid(booking.decorationScheme.schemeId)
      ? await DecorationScheme.findById(booking.decorationScheme.schemeId).select("name price slug _id").lean()
      : null;

    let menuDoc = null;
    if (booking.menuMode === "package") {
      const pkgId = booking.selectedMenu?.[0]?.itemId;
      if (pkgId && mongoose.Types.ObjectId.isValid(pkgId)) {
        menuDoc = await Menu.findById(pkgId).select("name pricePerPerson slug _id").lean();
      }
    }

    const payments = await Payment.find({ bookingId: booking._id })
      .sort({ createdAt: -1 })
      .select("status gateway amount paidAt transactionId createdAt")
      .lean();

    return res.json({
      id: booking._id,
      user: booking.userId,
      hall: booking.hallId,
      date: booking.date,
      slot: booking.slot,
      guests: booking.guests,
      eventType: booking.eventType,
      eventName: booking.eventName,
      specialRequirements: booking.specialRequirements,
      totalAmount: booking.totalAmount,
      status: booking.status,
      menu: {
        mode: booking.menuMode,
        selection: booking.selectedMenu,
        total: booking.menuTotal,
        package: menuDoc
          ? { id: menuDoc._id, name: menuDoc.name, slug: menuDoc.slug, pricePerPerson: menuDoc.pricePerPerson }
          : null,
      },
      decorations: {
        scheme: decoration
          ? { id: decoration._id, name: decoration.name, slug: decoration.slug, price: decoration.price }
          : booking.decorationScheme || null,
        addons: booking.addons || [],
        total: booking.decorationTotal,
      },
      pricing: {
        hallPrice: booking.hallPrice,
        menuTotal: booking.menuTotal,
        decorationTotal: booking.decorationTotal,
        totalAmount: booking.totalAmount,
      },
      reservedUntil: booking.reservedUntil,
      confirmedAt: booking.confirmedAt,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      createdAt: booking.createdAt,
      payment: booking.paymentId || null,
      payments,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
