import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import OrganizerEvent from "../../models/OrganizerEvent.js";
import TicketType from "../../models/TicketType.js";
import Ticket from "../../models/Ticket.js";

const router = express.Router();

async function generateUniqueQrCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = crypto.randomBytes(16).toString("hex");
    const exists = await Ticket.exists({ qrCodeValue: candidate });
    if (!exists) return candidate;
  }
  return null;
}

router.get("/public", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const q = String(req.query.q || "").trim();

    const filter = { isPublic: true, status: "PUBLISHED" };
    if (q) {
      const regex = new RegExp(q, "i");
      filter.$or = [{ name: regex }, { type: regex }];
    }

    const [events, total] = await Promise.all([
      OrganizerEvent.find(filter)
        .sort({ startDateTime: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({ path: "hallId", select: "name slug capacity" })
        .lean(),
      OrganizerEvent.countDocuments(filter),
    ]);

    return res.json({
      events,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const event = await OrganizerEvent.findById(req.params.id)
      .populate({ path: "hallId", select: "name slug capacity" })
      .lean();

    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.status === "CANCELLED") {
      return res.status(404).json({ message: "Event not found" });
    }

    if (!event.isPublic || event.status !== "PUBLISHED") {
      const accessCode = String(req.query.accessCode || "").trim();
      if (!accessCode || accessCode !== String(event.accessCode || "")) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const ticketTypes = await TicketType.find({ eventId: event._id, isActive: true })
      .select("name price quantityTotal quantitySold")
      .lean();

    return res.json({ event, ticketTypes });
  } catch (err) {
    return next(err);
  }
});

router.post("/:id/tickets", isAuthenticated, async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const event = await OrganizerEvent.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (event.status !== "PUBLISHED") {
      return res.status(400).json({ message: "Event is not available" });
    }

    if (!event.isPublic) {
      const accessCode = String(req.body?.accessCode || req.query.accessCode || "").trim();
      if (!accessCode || accessCode !== String(event.accessCode || "")) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const ticketTypeId = String(req.body?.ticketTypeId || "").trim();
    if (!mongoose.Types.ObjectId.isValid(ticketTypeId)) {
      return res.status(400).json({ message: "Valid ticketTypeId is required" });
    }

    const ticketType = await TicketType.findOneAndUpdate(
      {
        _id: ticketTypeId,
        eventId: event._id,
        isActive: true,
        $expr: { $lt: ["$quantitySold", "$quantityTotal"] },
      },
      { $inc: { quantitySold: 1 } },
      { new: true }
    );

    if (!ticketType) {
      return res.status(409).json({ message: "Ticket type is sold out or unavailable" });
    }

    const qrCodeValue = await generateUniqueQrCode();
    if (!qrCodeValue) {
      return res.status(500).json({ message: "Failed to generate ticket code" });
    }

    try {
      const ticket = await Ticket.create({
        eventId: event._id,
        ticketTypeId: ticketType._id,
        ownerUserId: req.currentUser._id,
        qrCodeValue,
        status: "ACTIVE",
      });

      return res.status(201).json({
        message: "Ticket issued",
        ticket: {
          id: ticket._id,
          eventId: ticket.eventId,
          ticketTypeId: ticket.ticketTypeId,
          qrCodeValue: ticket.qrCodeValue,
          status: ticket.status,
        },
      });
    } catch (err) {
      await TicketType.findByIdAndUpdate(ticketType._id, { $inc: { quantitySold: -1 } });
      throw err;
    }
  } catch (err) {
    return next(err);
  }
});

export default router;
