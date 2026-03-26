import mongoose from "mongoose";
import EventStaffAssignment from "../../models/EventStaffAssignment.js";
import User from "../../models/User.js";
import OrganizerEvent from "../../models/OrganizerEvent.js";

/**
 * Assign an existing user as scanner for an event
 * Admin only endpoint
 */
export async function assignScannerToEvent(req, res, next) {
  try {
    let { eventId } = req.params;
    let { userId, gate } = req.body;

    // ===== VALIDATION =====
    if (!eventId || !userId || !gate) {
      return res.status(400).json({
        message: "eventId, userId, and gate are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    // ===== CONVERT IDS TO OBJECTID =====
    eventId = mongoose.Types.ObjectId(eventId);
    userId = mongoose.Types.ObjectId(userId);

    // ===== CHECK EVENT EXISTS =====
    const event = await OrganizerEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // ===== CHECK USER EXISTS =====
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ===== CHECK IF ALREADY ASSIGNED =====
    const existing = await EventStaffAssignment.findOne({
      eventId,
      userId,
      active: true,
    });

    if (existing) {
      return res.status(400).json({
        message: "User is already assigned to this event",
      });
    }

    // ===== CREATE ASSIGNMENT =====
    const assignment = await EventStaffAssignment.create({
      eventId,
      userId,
      gate,
      active: true,
    });

    return res.status(201).json({
      message: "Scanner assignment created",
      assignment: {
        id: assignment._id,
        eventId: assignment.eventId,
        userId: assignment.userId,
        userEmail: user.email,
        gate: assignment.gate,
        active: assignment.active,
        createdAt: assignment.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Get all scanner assignments for an event
 */
export async function getEventScanners(req, res, next) {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: "Invalid eventId" });
    }

    const assignments = await EventStaffAssignment.find({
      eventId,
      active: true,
    })
      .populate("userId", "email username first_name last_name")
      .sort({ createdAt: -1 });

    return res.json({
      eventId,
      scanners: assignments.map((a) => ({
        id: a._id,
        userId: a.userId._id,
        email: a.userId.email,
        name:
          a.userId.first_name && a.userId.last_name
            ? `${a.userId.first_name} ${a.userId.last_name}`
            : a.userId.username,
        gate: a.gate,
        active: a.active,
        assignedAt: a.createdAt,
      })),
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Remove scanner access (soft delete)
 */
export async function removeScannerAssignment(req, res, next) {
  try {
    const { assignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
      return res.status(400).json({ message: "Invalid assignmentId" });
    }

    const assignment = await EventStaffAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    assignment.active = false;
    await assignment.save();

    return res.json({
      message: "Scanner assignment removed",
      assignment: {
        id: assignment._id,
        active: assignment.active,
      },
    });
  } catch (err) {
    return next(err);
  }
}
