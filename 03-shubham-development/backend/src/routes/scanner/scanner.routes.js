import express from "express";
import mongoose from "mongoose";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { scannerLimiter } from "../../config/rateLimit.config.js";
import User from "../../models/User.js";
import EventStaffAssignment from "../../models/EventStaffAssignment.js";
import Ticket from "../../models/Ticket.js";
import OrganizerEvent from "../../models/OrganizerEvent.js";
import TicketCheckin from "../../models/TicketCheckin.js";
import Hall from "../../models/Hall.js";
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
    const now = new Date();

    // Query for assignments where userId matches
    const assignments = await EventStaffAssignment.find({
      $or: [
        { userId: userId },
        { userId: userId.toString() },
      ],
      active: true,
    })
      .populate({
        path: "eventId",
        select: "name eventDate startDateTime endDateTime status hallId",
      })
      .lean();

    // Populate halls for the events
    const hallIds = assignments
      .map((a) => a.eventId?.hallId)
      .filter((id) => id && id.toString());

    const halls = await Hall
      .find({ _id: { $in: hallIds } })
      .select("_id name")
      .lean();

    const hallMap = new Map(halls.map((h) => [h._id.toString(), h.name]));

    return res.json({
      events: assignments.map((a) => {
        const eventEndTime = a.eventId.endDateTime || a.eventId.eventDate;
        const isEnded = eventEndTime && new Date(eventEndTime) < now;
        
        return {
          _id: a._id,
          eventId: a.eventId._id,
          eventName: a.eventId.name,
          eventDate: a.eventId.eventDate || a.eventId.startDateTime,
          gate: a.gate,
          status: a.eventId.status,
          isEnded, // Flag to show if event has ended
          canScan: !isEnded, // Disable scanning for ended events
          hall: {
            hallName: hallMap.get(a.eventId.hallId?.toString()) || "N/A",
          },
          assignedAt: a.createdAt,
        };
      }),
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
router.post("/events/:eventId/checkins/scan", isAuthenticated, scannerLimiter, async (req, res, next) => {
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

    // ===== CHECK EVENT HAS NOT ENDED =====
    const event = await OrganizerEvent.findById(eventId)
      .select("endDateTime eventDate status")
      .lean();

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const now = new Date();
    const eventEndTime = event.endDateTime || event.eventDate;
    if (eventEndTime && new Date(eventEndTime) < now) {
      return res.status(400).json({
        message: "Cannot scan for ended events",
        status: "EVENT_ENDED",
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

/**
 * GET /scanner/events/:eventId/checkins
 * Get check-in history for a specific event
 * Authenticated + assigned to event required
 */
router.get("/events/:eventId/checkins", isAuthenticated, async (req, res, next) => {
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
        { userId: userId },
        { userId: userId.toString() },
      ],
      active: true,
    }).lean();

    if (!assignment) {
      return res.status(403).json({
        message: "You are not assigned to this event",
      });
    }

    // ===== GET CHECK-IN HISTORY =====
    const checkins = await TicketCheckin.find({
      eventId,
    })
      .populate({
        path: "ticketId",
        select: "qrCodeValue ownerUserId",
        populate: {
          path: "ownerUserId",
          select: "email first_name last_name username",
        },
      })
      .sort({ checkedInAt: -1 })
      .lean();

    // ===== FORMAT RESPONSE =====
    const formattedCheckins = checkins.map((checkin) => ({
      _id: checkin._id,
      ticketId: checkin.ticketId?._id,
      attendeeName: 
        checkin.ticketId?.ownerUserId?.first_name || 
        checkin.ticketId?.ownerUserId?.username ||
        "Unknown",
      attendeeEmail: checkin.ticketId?.ownerUserId?.email || "N/A",
      checkedInAt: checkin.checkedInAt,
      checkedInBy: checkin.checkedInBy,
      status: checkin.status,
      note: checkin.note,
      gate: checkin.gate,
    }));

    return res.json({
      eventId,
      totalScans: formattedCheckins.length,
      successfulScans: formattedCheckins.filter((c) => c.status === "SUCCESS")
        .length,
      failedScans: formattedCheckins.filter((c) => c.status !== "SUCCESS")
        .length,
      checkins: formattedCheckins,
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /scanner/analytics
 * Get staff member's overall scan analytics
 * Authenticated required
 */
router.get("/analytics", isAuthenticated, async (req, res, next) => {
  try {
    const userId = req.currentUser._id;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // ===== GET ALL EVENTS ASSIGNED TO THIS USER =====
    const assignments = await EventStaffAssignment.find({
      $or: [
        { userId: userId },
        { userId: userId.toString() },
      ],
      active: true,
    })
      .select("eventId")
      .lean();

    const eventIds = assignments.map((a) => a.eventId);

    // ===== GET ALL CHECK-INS FOR THIS USER ACROSS ALL ASSIGNED EVENTS =====
    const allCheckins = await TicketCheckin.find({
      checkedInBy: userId,
    })
      .populate({
        path: "ticketId",
        select: "ownerUserId eventId",
        populate: {
          path: "ownerUserId",
          select: "email first_name last_name username",
        },
      })
      .populate({
        path: "eventId",
        select: "name startDateTime endDateTime",
      })
      .sort({ checkedInAt: -1 })
      .lean();

    // ===== AGGREGATE STATISTICS =====
    const totalScans = allCheckins.length;
    const successfulScans = allCheckins.filter(
      (c) => c.status === "SUCCESS"
    ).length;
    const failedScans = allCheckins.filter((c) => c.status !== "SUCCESS")
      .length;
    const alreadyChecked = allCheckins.filter(
      (c) => c.status === "ALREADY_CHECKED_IN"
    ).length;

    // ===== GET STATS BY EVENT =====
    const statsByEvent = {};
    allCheckins.forEach((checkin) => {
      const eventId = checkin.eventId?._id?.toString();
      if (!eventId) return;

      if (!statsByEvent[eventId]) {
        statsByEvent[eventId] = {
          eventId,
          eventName: checkin.eventId?.name || "Unknown",
          eventDate: checkin.eventId?.startDateTime,
          totalScans: 0,
          successfulScans: 0,
          failedScans: 0,
          alreadyChecked: 0,
        };
      }

      statsByEvent[eventId].totalScans++;
      if (checkin.status === "SUCCESS") {
        statsByEvent[eventId].successfulScans++;
      } else if (checkin.status === "ALREADY_CHECKED_IN") {
        statsByEvent[eventId].alreadyChecked++;
      } else {
        statsByEvent[eventId].failedScans++;
      }
    });

    // ===== GET RECENT SCANS (LAST 20) =====
    const recentScans = allCheckins.slice(0, 20).map((checkin) => ({
      _id: checkin._id,
      ticketId: checkin.ticketId?._id,
      attendeeName:
        checkin.ticketId?.ownerUserId?.first_name ||
        checkin.ticketId?.ownerUserId?.username ||
        "Unknown",
      attendeeEmail: checkin.ticketId?.ownerUserId?.email || "N/A",
      eventName: checkin.eventId?.name || "Unknown",
      checkedInAt: checkin.checkedInAt,
      status: checkin.status,
      note: checkin.note,
      gate: checkin.gate,
    }));

    return res.json({
      staff: {
        id: userId,
        name: req.currentUser.first_name || req.currentUser.username,
      },
      summary: {
        totalScans,
        successfulScans,
        failedScans,
        alreadyChecked,
        successRate:
          totalScans > 0
            ? ((successfulScans / totalScans) * 100).toFixed(1)
            : 0,
      },
      byEvent: Object.values(statsByEvent),
      recentScans,
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
