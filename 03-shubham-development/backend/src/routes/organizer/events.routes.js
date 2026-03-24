import express from "express";
import { isAuthenticated, isOrganizer } from "../../middleware/auth.middleware.js";
import { auditMiddleware } from "../../middleware/audit.middleware.js";

import * as organizerEventsController from "../../controllers/admin/organizer-events.controller.js";

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

export default router;
