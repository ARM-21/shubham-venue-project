import express from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import { authenticateScannerBearer } from "../../middleware/auth.middleware.js";
import User from "../../models/User.js";
import EventStaffAssignment from "../../models/EventStaffAssignment.js";
import Ticket from "../../models/Ticket.js";
import OrganizerEvent from "../../models/OrganizerEvent.js";
import TicketCheckin from "../../models/TicketCheckin.js";
import { signScannerJwt, verifyTicketScanToken, hashToken } from "../../utils/token.utils.js";

const router = express.Router();

async function getActiveAssignments(staffUserId) {
  return EventStaffAssignment.find({ staffUserId, active: true, status: { $in: ["INVITED", "ACCEPTED"] } })
    .select("eventId gate status acceptedAt invitationExpiresAt")
    .lean();
}

function normalizeAssignments(assignments = []) {
  return assignments.map((a) => ({
    id: a._id,
    eventId: a.eventId,
    gate: a.gate || "",
    status: a.status,
    acceptedAt: a.acceptedAt,
    invitationExpiresAt: a.invitationExpiresAt,
  }));
}

router.post("/login", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "").trim();
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email, role: "staff_scanner" }).select("+password role isActive");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (user.isActive === false) return res.status(403).json({ message: "Account disabled" });

    const valid = await user.comparePassword(password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const assignments = await getActiveAssignments(user._id);
    const token = signScannerJwt({ userId: user._id, assignmentIds: assignments.map((a) => a._id) });

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      assignments: normalizeAssignments(assignments),
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/invitations/accept", async (req, res, next) => {
  try {
    const rawToken = String(req.body?.token || "").trim();
    const password = String(req.body?.password || "").trim();
    const firstName = String(req.body?.firstName || "").trim();
    const lastName = String(req.body?.lastName || "").trim();

    if (!rawToken || !password) {
      return res.status(400).json({ message: "token and password are required" });
    }

    const tokenHash = hashToken(rawToken);
    const assignment = await EventStaffAssignment.findOne({
      invitationTokenHash: tokenHash,
      active: true,
      status: "INVITED",
      invitationExpiresAt: { $gt: new Date() },
    });

    if (!assignment) return res.status(400).json({ message: "Invitation is invalid or expired" });

    const user = await User.findById(assignment.staffUserId).select("+password role isActive");
    if (!user) return res.status(404).json({ message: "Staff account not found" });
    if (user.role !== "staff_scanner") return res.status(403).json({ message: "Scanner access required" });
    if (user.isActive === false) return res.status(403).json({ message: "Account disabled" });

    user.password = password;
    if (firstName) user.first_name = firstName;
    if (lastName) user.last_name = lastName;
    await user.save();

    assignment.status = "ACCEPTED";
    assignment.acceptedAt = new Date();
    assignment.invitationTokenHash = null;
    assignment.invitationExpiresAt = null;
    await assignment.save();

    const assignments = await getActiveAssignments(user._id);
    const token = signScannerJwt({ userId: user._id, assignmentIds: assignments.map((a) => a._id) });

    return res.json({
      message: "Invitation accepted",
      token,
      user: { id: user._id, email: user.email, role: user.role },
      assignments: normalizeAssignments(assignments),
    });
  } catch (err) {
    return next(err);
  }
});

router.get("/me", authenticateScannerBearer, async (req, res, next) => {
  try {
    const assignments = await getActiveAssignments(req.scannerUser._id);
    return res.json({
      user: {
        id: req.scannerUser._id,
        email: req.scannerUser.email,
        role: req.scannerUser.role,
      },
      assignments: normalizeAssignments(assignments),
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/events/:eventId/checkins/scan", authenticateScannerBearer, async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const assignment = await EventStaffAssignment.findOne({
      eventId,
      staffUserId: req.scannerUser._id,
      active: true,
      status: "ACCEPTED",
    }).lean();

    if (!assignment) {
      return res.status(403).json({ message: "Not assigned to this event" });
    }

    const qrToken = String(req.body?.qrToken || req.body?.token || "").trim();
    const deviceId = String(req.body?.deviceId || "").trim() || null;
    if (!qrToken) return res.status(400).json({ message: "qrToken is required" });

    let decoded;
    try {
      decoded = verifyTicketScanToken(qrToken);
    } catch (err) {
      await TicketCheckin.create({
        eventId,
        checkedInBy: req.scannerUser._id,
        checkedInAt: new Date(),
        deviceId,
        status: "REJECTED",
        note: err?.message || "Invalid QR token",
        payloadHash: hashToken(qrToken),
      });
      const status = err?.statusCode || 401;
      return res.status(status).json({ message: err?.message || "Invalid QR token" });
    }

    if (decoded?.eventId && String(decoded.eventId) !== String(eventId)) {
      await TicketCheckin.create({
        eventId,
        checkedInBy: req.scannerUser._id,
        checkedInAt: new Date(),
        deviceId,
        status: "REJECTED",
        note: "QR token does not belong to this event",
        payloadHash: hashToken(qrToken),
      });
      return res.status(400).json({ message: "QR token does not belong to this event" });
    }

    const ticketFilter = { eventId };
    if (decoded?.sub) ticketFilter._id = decoded.sub;
    if (decoded?.code) ticketFilter.qrCodeValue = decoded.code;

    const ticket = await Ticket.findOne(ticketFilter).lean();
    if (!ticket) {
      await TicketCheckin.create({
        eventId,
        checkedInBy: req.scannerUser._id,
        checkedInAt: new Date(),
        deviceId,
        status: "REJECTED",
        note: "Ticket not found",
        payloadHash: hashToken(qrToken),
      });
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status !== "ACTIVE") {
      await TicketCheckin.create({
        eventId,
        ticketId: ticket._id,
        checkedInBy: req.scannerUser._id,
        checkedInAt: new Date(),
        deviceId,
        status: "REJECTED",
        note: "Ticket is not active",
        payloadHash: hashToken(qrToken),
      });
      return res.status(400).json({ message: "Ticket is not active" });
    }

    const event = await OrganizerEvent.findById(eventId).select("status endDateTime").lean();
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.status === "CANCELLED") return res.status(400).json({ message: "Event is cancelled" });

    const now = new Date();
    const updatedTicket = await Ticket.findOneAndUpdate(
      {
        _id: ticket._id,
        status: "ACTIVE",
        $or: [{ checkedInAt: { $exists: false } }, { checkedInAt: null }],
      },
      { $set: { checkedInAt: now, checkedInBy: req.scannerUser._id } },
      { new: true }
    ).lean();

    const alreadyCheckedIn = Boolean(ticket.checkedInAt);
    const checkStatus = updatedTicket ? "SUCCESS" : alreadyCheckedIn ? "ALREADY_CHECKED_IN" : "REJECTED";
    const checkedInAt = updatedTicket ? updatedTicket.checkedInAt : ticket.checkedInAt || now;

    await TicketCheckin.create({
      eventId,
      ticketId: ticket._id,
      checkedInBy: req.scannerUser._id,
      checkedInAt,
      deviceId,
      status: checkStatus,
      note: checkStatus === "REJECTED" ? "Ticket locked" : undefined,
      payloadHash: hashToken(qrToken),
    });

    if (checkStatus === "REJECTED") {
      return res.status(409).json({ message: "Ticket could not be checked in" });
    }

    return res.json({
      message: checkStatus === "SUCCESS" ? "Check-in successful" : "Ticket already checked in",
      status: checkStatus,
      checkedInAt,
      ticket: {
        id: ticket._id,
        eventId: ticket.eventId,
        ticketTypeId: ticket.ticketTypeId,
        ownerUserId: ticket.ownerUserId,
        status: ticket.status,
        checkedInBy: updatedTicket?.checkedInBy || ticket.checkedInBy,
      },
      gate: assignment.gate || "",
    });
  } catch (err) {
    return next(err);
  }
});

export default router;
