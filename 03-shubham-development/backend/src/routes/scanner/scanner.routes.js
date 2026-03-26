import express from "express";
import mongoose from "mongoose";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import User from "../../models/User.js";
import EventStaffAssignment from "../../models/EventStaffAssignment.js";
import Ticket from "../../models/Ticket.js";
import OrganizerEvent from "../../models/OrganizerEvent.js";
import TicketCheckin from "../../models/TicketCheckin.js";
import { hashToken } from "../../utils/token.utils.js";

const router = express.Router();

/**
 * GET /scanner/my-events
 * Get list of events the user is assigned to scan
 * Authenticated required
 */
router.get("/my-events", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.currentUser._id;

    // Query for assignments where userId matches (convert both to string for comparison to handle type mismatch)
    const assignments = await EventStaffAssignment.find({
      $or: [
        { userId: userId }, // Try direct ObjectId match
        { userId: userId.toString() }, // Try string match (in case data was stored as string)
      ],
      active: true,
    })
      .populate("eventId", "name eventDate startDateTime status hallId")
      .populate("eventId.hallId", "name")
      .sort({ createdAt: -1 });

    return res.json({
      events: assignments.map((a) => ({
        _id: a._id,
        eventId: a.eventId._id,
        eventName: a.eventId.name,
        eventDate: a.eventId.eventDate || a.eventId.startDateTime,
        gate: a.gate,
        status: a.eventId.status,
        hall: {
          hallName: a.eventId.hallId?.name || "N/A",
        },
        assignedAt: a.createdAt,
      })),
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /scanner/events/:eventId/checkins/scan
 * Scan a QR code ticket for check-in
 * Authenticated + assigned to event required
 *
 * Request:
 * {
 *   qrCode: "ticket_qr_code_value",
 *   deviceId: "device_123"  (optional)
 * }
 */
router.post("/events/:eventId/checkins/scan", isAuthenticated, async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.currentUser._id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    // ===== CHECK USER IS ASSIGNED TO EVENT =====
    const assignment = await EventStaffAssignment.findOne({
      eventId,
      $or: [
        { userId: userId }, // Try direct ObjectId match
        { userId: userId.toString() }, // Try string match (in case data was stored as string)
      ],
      active: true,
    }).lean();

    if (!assignment) {
      return res.status(403).json({
        message: "You are not assigned to scan for this event",
      });
    }

    // ===== GET QR CODE FROM REQUEST =====
    const qrCode = String(req.body?.qrCode || "").trim();
    const deviceId = String(req.body?.deviceId || "").trim() || null;

    if (!qrCode) {
      return res.status(400).json({ message: "qrCode is required" });
    }

    // ===== FIND TICKET BY QR CODE =====
    const ticket = await Ticket.findOne({
      eventId,
      qrCodeValue: qrCode,
    }).lean();

    if (!ticket) {
      // Log failed scan
      await TicketCheckin.create({
        eventId,
        checkedInBy: userId,
        checkedInAt: new Date(),
        deviceId,
        status: "REJECTED",
        note: "Ticket not found with this QR code",
        payloadHash: hashToken(qrCode),
        gate: assignment.gate,
      });

      return res.status(404).json({
        message: "Ticket not found",
        status: "REJECTED",
      });
    }

    // ===== CHECK TICKET STATUS =====
    if (ticket.status !== "ACTIVE") {
      await TicketCheckin.create({
        eventId,
        ticketId: ticket._id,
        checkedInBy: userId,
        checkedInAt: new Date(),
        deviceId,
        status: "REJECTED",
        note: `Ticket is ${ticket.status}`,
        payloadHash: hashToken(qrCode),
        gate: assignment.gate,
      });

      return res.status(400).json({
        message: `Ticket is not active (status: ${ticket.status})`,
        status: "REJECTED",
      });
    }

    // ===== CHECK IF ALREADY CHECKED IN =====
    if (ticket.checkedInAt) {
      await TicketCheckin.create({
        eventId,
        ticketId: ticket._id,
        checkedInBy: userId,
        checkedInAt: new Date(),
        deviceId,
        status: "ALREADY_CHECKED_IN",
        note: `Already checked in at ${ticket.checkedInAt}`,
        payloadHash: hashToken(qrCode),
        gate: assignment.gate,
      });

      return res.status(409).json({
        message: `Ticket already checked in at ${new Date(ticket.checkedInAt).toLocaleString()}`,
        status: "ALREADY_CHECKED_IN",
        checkedInAt: ticket.checkedInAt,
      });
    }

    // ===== CHECK EVENT STATUS =====
    const event = await OrganizerEvent.findById(eventId).select("status").lean();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.status === "CANCELLED") {
      await TicketCheckin.create({
        eventId,
        ticketId: ticket._id,
        checkedInBy: userId,
        checkedInAt: new Date(),
        deviceId,
        status: "REJECTED",
        note: "Event is cancelled",
        payloadHash: hashToken(qrCode),
        gate: assignment.gate,
      });

      return res.status(400).json({
        message: "Event is cancelled",
        status: "REJECTED",
      });
    }

    // ===== UPDATE TICKET - MARK AS CHECKED IN =====
    const now = new Date();
    const updatedTicket = await Ticket.findOneAndUpdate(
      {
        _id: ticket._id,
        status: "ACTIVE",
        $or: [{ checkedInAt: { $exists: false } }, { checkedInAt: null }],
      },
      {
        $set: {
          checkedInAt: now,
          checkedInBy: userId,
        },
      },
      { new: true }
    ).lean();

    // ===== LOG CHECK-IN =====
    await TicketCheckin.create({
      eventId,
      ticketId: ticket._id,
      checkedInBy: userId,
      checkedInAt: now,
      deviceId,
      status: "SUCCESS",
      payloadHash: hashToken(qrCode),
      gate: assignment.gate,
    });

    // ===== RETURN SUCCESS =====
    return res.json({
      message: "Check-in successful ✓",
      status: "SUCCESS",
      ticket: {
        id: ticket._id,
        ownerUserId: ticket.ownerUserId,
      },
      checkedInAt: now,
      gate: assignment.gate,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
