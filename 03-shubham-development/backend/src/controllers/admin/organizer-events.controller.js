import OrganizerEvent from "../../models/OrganizerEvent.js";
import User from "../../models/User.js";
import Hall from "../../models/Hall.js";
import {
  calculateTrustScore,
  onEventCreated,
  onEventApproved,
} from "../../services/trustScore.service.js";
import { createAuditLog } from "../../middleware/audit.middleware.js";
import { success, httpError } from "../../utils/http.utils.js";

/**
 * Organizer: Create new event
 * Auto-publish if trustScore >= 4, else PENDING_REVIEW
 */
export const createOrganizerEvent = async (req, res, next) => {
  try {
    const organizerId = req.currentUser._id;
    const {
      bookingId,
      hallId,
      name,
      type,
      description,
      eventCategory,
      startDateTime,
      endDateTime,
      eventDate,
      registrationStartDate,
      registrationEndDate,
      maxAttendees,
      expectedAttendees,
      tags,
      dressCode,
      ageRestriction,
      catering,
      decoration,
      requiresTicket,
      location,
      bannerUrl,
      accessCode,
      isPublic,
    } = req.body;

    // Validate required fields
    if (!bookingId || !hallId || !name) {
      return httpError(res, "Missing required fields", 400);
    }

    // Verify hall exists
    const hall = await Hall.findById(hallId);
    if (!hall) {
      return httpError(res, "Hall not found", 404);
    }

    // Check organizer trust score
    const trustCalculation = await calculateTrustScore(organizerId);
    const initialStatus =
      trustCalculation.trustScore >= 4 ? "PUBLISHED" : "PENDING_REVIEW";

    // Create event
    const newEvent = await OrganizerEvent.create({
      organizerId,
      bookingId,
      hallId,
      name: name.trim(),
      type: type?.trim(),
      description: description?.trim(),
      eventCategory,
      startDateTime,
      endDateTime,
      eventDate,
      registrationStartDate,
      registrationEndDate,
      maxAttendees,
      expectedAttendees,
      tags: tags || [],
      dressCode,
      ageRestriction,
      catering: catering || false,
      decoration: decoration || false,
      requiresTicket: requiresTicket !== false,
      location: location || {},
      bannerUrl,
      accessCode,
      isPublic: isPublic !== false,
      status: initialStatus,
      publishedAt: initialStatus === "PUBLISHED" ? new Date() : null,
      publishedBy: initialStatus === "PUBLISHED" ? organizerId : null,
    });

    // Update organizer metrics
    await onEventCreated(organizerId);

    // If auto-published, also increment approved count
    if (initialStatus === "PUBLISHED") {
      await onEventApproved(organizerId);
    }

    // Audit log
    await createAuditLog({
      entityType: "event",
      entityId: newEvent._id,
      action: initialStatus === "PUBLISHED" ? "published" : "created",
      performedBy: organizerId,
      performedByRole: "organizer",
      changes: {
        before: {},
        after: {
          name,
          status: initialStatus,
          organizerId,
        },
        fields: ["name", "status", "organizerId"],
      },
      relatedOrganizerId: organizerId,
      metadata: {
        trustScore: trustCalculation.trustScore,
        requiresApproval: trustCalculation.requiresApproval,
      },
    });

    return success(
      res,
      {
        event: newEvent,
        status: initialStatus,
        trustScore: trustCalculation.trustScore,
        requiresApproval: trustCalculation.requiresApproval,
      },
      initialStatus === "PUBLISHED"
        ? "Event published successfully"
        : "Event submitted for admin review",
      201
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Organizer: Get their events
 */
export const getOrganizerEvents = async (req, res, next) => {
  try {
    const organizerId = req.currentUser._id;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { organizerId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const events = await OrganizerEvent.find(query)
      .populate("hallId", "name city state")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await OrganizerEvent.countDocuments(query);

    // Get event flags count for each
    const eventsWithFlags = await Promise.all(
      events.map(async (event) => {
        const flagCount = event.flags?.length || 0;
        return {
          ...event.toObject(),
          flagCount,
        };
      })
    );

    return success(res, {
      events: eventsWithFlags,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: parseInt(page),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all organizer events (for admin oversight)
 */
export const getAllOrganizerEvents = async (req, res, next) => {
  try {
    const {
      status,
      isFlagged,
      organizerId,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (isFlagged !== undefined) query.isFlagged = isFlagged === "true";
    if (organizerId) query.organizerId = organizerId;

    const skip = (page - 1) * limit;

    const events = await OrganizerEvent.find(query)
      .populate("organizerId", "email firstName lastName trustMetrics")
      .populate("hallId", "name city")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await OrganizerEvent.countDocuments(query);

    return success(res, {
      events,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: parseInt(page),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get pending review events
 */
export const getPendingReviewEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const events = await OrganizerEvent.find({
      status: "PENDING_REVIEW",
    })
      .populate(
        "organizerId",
        "email firstName lastName trustMetrics suspensionStatus"
      )
      .populate("hallId", "name city capacity")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await OrganizerEvent.countDocuments({
      status: "PENDING_REVIEW",
    });

    return success(res, {
      events,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: parseInt(page),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Approve pending event
 */
export const approveEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { notes } = req.body;
    const adminId = req.currentUser._id;

    const event = await OrganizerEvent.findByIdAndUpdate(
      eventId,
      {
        status: "PUBLISHED",
        publishedAt: new Date(),
        publishedBy: adminId,
        approvedBy: adminId,
        approvalNotes: notes || "",
      },
      { new: true }
    );

    if (!event) {
      return httpError(res, "Event not found", 404);
    }

    // Update organizer metrics
    await onEventApproved(event.organizerId);

    // Audit log
    await createAuditLog({
      entityType: "event",
      entityId: eventId,
      action: "approved",
      performedBy: adminId,
      performedByRole: "admin",
      changes: {
        before: { status: "PENDING_REVIEW" },
        after: { status: "PUBLISHED" },
        fields: ["status"],
      },
      relatedOrganizerId: event.organizerId,
      metadata: { notes },
    });

    return success(res, event, "Event approved and published");
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Reject pending event
 */
export const rejectEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { reason } = req.body;
    const adminId = req.currentUser._id;

    if (!reason) {
      return httpError(res, "Rejection reason required", 400);
    }

    const event = await OrganizerEvent.findByIdAndUpdate(
      eventId,
      {
        status: "CANCELLED",
        rejectionReason: reason,
      },
      { new: true }
    );

    if (!event) {
      return httpError(res, "Event not found", 404);
    }

    // Audit log
    await createAuditLog({
      entityType: "event",
      entityId: eventId,
      action: "rejected",
      performedBy: adminId,
      performedByRole: "admin",
      changes: {
        before: { status: "PENDING_REVIEW" },
        after: { status: "CANCELLED", rejectionReason: reason },
        fields: ["status", "rejectionReason"],
      },
      relatedOrganizerId: event.organizerId,
      metadata: { reason },
    });

    return success(res, event, "Event rejected");
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Suspend event
 */
export const suspendEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const { reason, suspensionDays } = req.body;
    const adminId = req.currentUser._id;

    const suspensionEndDate = suspensionDays
      ? new Date(Date.now() + suspensionDays * 24 * 60 * 60 * 1000)
      : null;

    const event = await OrganizerEvent.findByIdAndUpdate(
      eventId,
      {
        status: "SUSPENDED",
        suspendedAt: new Date(),
        suspensionReason: reason || "Admin suspension",
        suspensionEndDate,
      },
      { new: true }
    );

    if (!event) {
      return httpError(res, "Event not found", 404);
    }

    // Audit log
    await createAuditLog({
      entityType: "event",
      entityId: eventId,
      action: "suspended",
      performedBy: adminId,
      performedByRole: "admin",
      metadata: { reason, suspensionDays },
      relatedOrganizerId: event.organizerId,
    });

    return success(res, event, "Event suspended");
  } catch (err) {
    next(err);
  }
};

/**
 * Get event audit trail with all changes
 */
export const getEventAuditTrail = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    const event = await OrganizerEvent.findById(eventId)
      .populate("organizerId", "email firstName lastName")
      .populate("hallId", "name");

    if (!event) {
      return httpError(res, "Event not found", 404);
    }

    const { getAuditTrail } = await import("../../middleware/audit.middleware.js");
    const auditTrail = await getAuditTrail("event", eventId);

    return success(res, {
      event: event.toObject(),
      auditTrail,
    });
  } catch (err) {
    next(err);
  }
};
