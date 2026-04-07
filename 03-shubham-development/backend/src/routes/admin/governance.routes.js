import express from "express";
import { isAuthenticated, isAdmin } from "../../middleware/auth.middleware.js";
import { auditMiddleware } from "../../middleware/audit.middleware.js";

// Controllers
import * as flagsController from "../../controllers/admin/flags.controller.js";
import * as organizerEventsController from "../../controllers/admin/organizer-events.controller.js";
import * as reputationController from "../../controllers/admin/organizer-reputation.controller.js";

const router = express.Router();

// Apply middleware
router.use(auditMiddleware);

// ============================================
// FLAG MANAGEMENT ROUTES
// ============================================

// Flags Dashboard & Overview
router.get("/flags/dashboard", isAuthenticated, isAdmin, flagsController.getFlagDashboard);

// Create flag (admin flags an event)
router.post("/flags", isAuthenticated, isAdmin, flagsController.flagEvent);

// Get all flags with filters
router.get("/flags", isAuthenticated, isAdmin, flagsController.getAllFlags);

// Get specific flag resolution/investigation details
router.get("/flags/:flagId", isAuthenticated, isAdmin, flagsController.getFlagResolution);

// Add comment/evidence to investigation
router.post("/flags/:flagId/comments", isAuthenticated, isAdmin, flagsController.addFlagComment);

// Resolve flag with decision
router.patch("/flags/:flagId/resolve", isAuthenticated, isAdmin, flagsController.resolveFlag);

// Dismiss flag
router.post("/flags/:flagId/dismiss", isAuthenticated, isAdmin, flagsController.dismissFlag);

// Get organizer's all flags history
router.get("/organizers/:organizerId/flags", isAuthenticated, isAdmin, flagsController.getOrganizerFlags);

// ============================================
// ORGANIZER EVENT MANAGEMENT ROUTES
// ============================================

// Get pending review events (MUST come before generic route)
router.get("/organizer-events/pending", isAuthenticated, isAdmin, organizerEventsController.getPendingReviewEvents);

// Get event audit trail
router.get("/organizer-events/:eventId/audit", isAuthenticated, isAdmin, organizerEventsController.getEventAuditTrail);

// Get all organizer events (admin oversight)
router.get("/organizer-events", isAuthenticated, isAdmin, organizerEventsController.getAllOrganizerEvents);

// Approve pending event
router.post("/organizer-events/:eventId/approve", isAuthenticated, isAdmin, organizerEventsController.approveEvent);

// Reject pending event
router.post("/organizer-events/:eventId/reject", isAuthenticated, isAdmin, organizerEventsController.rejectEvent);

// Suspend event
router.post("/organizer-events/:eventId/suspend", isAuthenticated, isAdmin, organizerEventsController.suspendEvent);

// Get single event detail (MUST come after all specific routes)
router.get("/organizer-events/:eventId", isAuthenticated, isAdmin, organizerEventsController.getEventDetail);

// ============================================
// ORGANIZER REPUTATION & TRUST MANAGEMENT
// ============================================

// Get organizer reputation dashboard
router.get("/organizers/:organizerId/reputation", isAuthenticated, isAdmin, reputationController.getOrganizerReputationDashboard);

// Get all organizers with reputation scores
router.get("/organizers", isAuthenticated, isAdmin, reputationController.getAllOrganizersWithReputation);

// Get organizer's events for review
router.get("/organizers/:organizerId/events", isAuthenticated, isAdmin, reputationController.getOrganizerEventsForReview);

// Get organizer's audit trail
router.get("/organizers/:organizerId/audit-trail", isAuthenticated, isAdmin, reputationController.getOrganizerAuditTrail);

// Suspend organizer
router.post("/organizers/:organizerId/suspend", isAuthenticated, isAdmin, reputationController.manualSuspendOrganizer);

// Lift organizer suspension
router.post("/organizers/:organizerId/unsuspend", isAuthenticated, isAdmin, reputationController.liftOrganizerSuspension);

// Adjust trust score
router.patch("/organizers/:organizerId/trust-score", isAuthenticated, isAdmin, reputationController.adjustTrustScore);

// Send warning to organizer
router.post("/organizers/:organizerId/warning", isAuthenticated, isAdmin, reputationController.sendOrganizerWarning);

// Get suspension statistics
router.get("/stats/suspensions", isAuthenticated, isAdmin, reputationController.getSuspensionStats);

// Recalculate metrics for organizer(s)
router.post("/stats/recalculate", isAuthenticated, isAdmin, reputationController.recalculateMetrics);

// ============================================
// AUDIT LOGS ROUTES
// ============================================

// Get audit logs with filters
router.get("/audit-logs", isAuthenticated, isAdmin, reputationController.getAuditLogs);

export default router;
