import express from "express";
import { isAuthenticated, isOrganizer } from "../../middleware/auth.middleware.js";
import { auditMiddleware } from "../../middleware/audit.middleware.js";

import * as organizerEventsController from "../../controllers/admin/organizer-events.controller.js";
import { exportEventAttendees, exportAllEventAttendees } from "../../services/event/export.service.js";
import { success, httpError } from "../../utils/http.utils.js";
import OrganizerEvent from "../../models/OrganizerEvent.js";

const router = express.Router();

// Apply middleware
router.use(isAuthenticated, isOrganizer);
router.use(auditMiddleware);

/**
 * Organizer can create events
 * Auto-publishes if trust score >= 4, else goes to PENDING_REVIEW
 */
router.post("/events", organizerEventsController.createOrganizerEvent);

/**
 * Get organizer's own events
 */
router.get("/events", organizerEventsController.getOrganizerEvents);

/**
 * Export checked-in attendees for an event (CSV format)
 * GET /api/v1/organizer/events/:eventId/attendees/export
 */
router.get("/events/:eventId/attendees/export", async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.currentUser._id;

    // Verify organizer owns this event
    const event = await OrganizerEvent.findById(eventId);
    if (!event) {
      return next(httpError(404, "Event not found"));
    }

    if (event.organizerId.toString() !== organizerId.toString()) {
      return next(httpError(403, "You don't have permission to export attendees for this event"));
    }

    // Generate CSV
    const { csv, filename } = await exportEventAttendees(eventId);

    // Set response headers for file download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error("[Export Attendees Error]", error);
    next(error);
  }
});

/**
 * Export all attendees for an event including cancelled/refunded (CSV format)
 * GET /api/v1/organizer/events/:eventId/attendees/export-all
 */
router.get("/events/:eventId/attendees/export-all", async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.currentUser._id;

    // Verify organizer owns this event
    const event = await OrganizerEvent.findById(eventId);
    if (!event) {
      return next(httpError(404, "Event not found"));
    }

    if (event.organizerId.toString() !== organizerId.toString()) {
      return next(httpError(403, "You don't have permission to export attendees for this event"));
    }

    // Generate CSV
    const { csv, filename } = await exportAllEventAttendees(eventId);

    // Set response headers for file download
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csv);
  } catch (error) {
    console.error("[Export All Attendees Error]", error);
    next(error);
  }
});

export default router;
