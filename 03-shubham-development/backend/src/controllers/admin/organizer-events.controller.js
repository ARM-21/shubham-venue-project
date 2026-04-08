import mongoose from "mongoose";
import OrganizerEvent from "../../models/OrganizerEvent.js";
import User from "../../models/User.js";
import Hall from "../../models/Hall.js";
import Menu from "../../models/menu/Menu.js";
import AdminNotification from "../../models/AdminNotification.js";
import {
  calculateTrustScore,
  onEventCreated,
  onEventApproved,
} from "../../services/trustScore.service.js";
import { createAuditLog } from "../../middleware/audit.middleware.js";
import {
  sendOrganizerEventApprovedEmail,
  sendOrganizerEventRejectedEmail,
  sendAdminEventPendingApprovalEmail,
} from "../../services/email/email.service.js";
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
      cateringMenus,
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

    // Get booking to validate event dates against booking date
    const booking = await mongoose.model('Booking').findById(bookingId);
    if (!booking) {
      return httpError(res, "Booking not found", 404);
    }

    // Strict validation: Event dates must match booking date
    const bookingDate = new Date(booking.date);
    const bookingDateString = bookingDate.toISOString().split('T')[0];

    // If startDateTime is provided, validate it's on the booking date
    if (startDateTime) {
      const startDate = new Date(startDateTime);
      const startDateString = startDate.toISOString().split('T')[0];
      if (startDateString !== bookingDateString) {
        return httpError(
          res,
          `Event must start on the booked date (${bookingDateString}). You selected ${startDateString}`,
          400
        );
      }
    }

    // If endDateTime is provided, validate it's on the booking date
    if (endDateTime) {
      const endDate = new Date(endDateTime);
      const endDateString = endDate.toISOString().split('T')[0];
      if (endDateString !== bookingDateString) {
        return httpError(
          res,
          `Event must end on the booked date (${bookingDateString}). You selected ${endDateString}`,
          400
        );
      }
    }

    // Validate start time < end time
    if (startDateTime && endDateTime) {
      const startDt = new Date(startDateTime);
      const endDt = new Date(endDateTime);
      if (startDt >= endDt) {
        return httpError(res, "Event start time must be before end time", 400);
      }
    }

    // Validate registration end date is before or on event date
    if (registrationEndDate) {
      const regEndDate = new Date(registrationEndDate);
      if (startDateTime) {
        const startDt = new Date(startDateTime);
        if (regEndDate > startDt) {
          return httpError(
            res,
            "Registration must close before event starts",
            400
          );
        }
      } else if (regEndDate > bookingDate) {
        return httpError(
          res,
          "Registration must close on or before the event date",
          400
        );
      }
    }

    // Validate catering menus
    let validatedCateringMenus = [];
    if (cateringMenus && cateringMenus.length > 0) {
      // Catering must be enabled if menus are provided
      if (!catering) {
        return httpError(
          res,
          "Catering must be enabled to select menu items",
          400
        );
      }

      // Validate all menu IDs exist
      const menuIds = cateringMenus.map((id) => new mongoose.Types.ObjectId(id));
      const existingMenus = await Menu.find({ _id: { $in: menuIds } }).select("_id");

      if (existingMenus.length !== cateringMenus.length) {
        return httpError(res, "One or more selected menus do not exist", 404);
      }

      validatedCateringMenus = existingMenus.map((menu) => menu._id);
    }

    // Validate attendees don't exceed hall capacity
    if (maxAttendees && maxAttendees > hall.capacity) {
      return httpError(
        res,
        `Maximum attendees (${maxAttendees}) cannot exceed hall capacity (${hall.capacity})`,
        400
      );
    }

    if (expectedAttendees && expectedAttendees > hall.capacity) {
      return httpError(
        res,
        `Expected attendees (${expectedAttendees}) cannot exceed hall capacity (${hall.capacity})`,
        400
      );
    }

    // Validate expected attendees <= max attendees
    if (maxAttendees && expectedAttendees && expectedAttendees > maxAttendees) {
      return httpError(
        res,
        "Expected attendees cannot exceed maximum attendees",
        400
      );
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
      cateringMenus: validatedCateringMenus,
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

    // Create admin notifications if event needs approval
    if (initialStatus === "PENDING_REVIEW") {
      const organizer = await User.findById(organizerId).select("firstName lastName email");
      const admins = await User.find({ role: "admin" }).select("_id email");
      
      for (const admin of admins) {
        await AdminNotification.create({
          adminId: admin._id,
          type: "event_pending_approval",
          title: `Event Pending Review: ${name}`,
          message: `${organizer?.firstName} ${organizer?.lastName} submitted "${name}" for approval (Trust Score: ${trustCalculation.trustScore.toFixed(1)}/5)`,
          eventId: newEvent._id,
          organizerId: organizerId,
          requestUserId: organizerId,
          requestUserName: `${organizer?.firstName} ${organizer?.lastName}`,
          requestUserEmail: organizer?.email,
          actionPath: `/admin/governance/organizer-events?status=PENDING_REVIEW`,
        });
      }

      // Send email to all admins
      const adminEmails = admins.map(admin => admin.email).filter(Boolean);
      if (adminEmails.length > 0) {
        await sendAdminEventPendingApprovalEmail(adminEmails, {
          eventName: name,
          organizerName: `${organizer?.firstName} ${organizer?.lastName}`,
          trustScore: trustCalculation.trustScore,
          eventId: newEvent._id,
        });
      }
    }

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
      .populate("cateringMenus", "name pricePerPerson description")
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

    // Create notification for organizer
    const organizer = await User.findById(event.organizerId).select("_id");
    if (organizer) {
      await AdminNotification.create({
        adminId: organizer._id,
        type: "event_approved",
        title: `Event Approved: ${event.name}`,
        message: `Your event "${event.name}" has been approved and is now published.`,
        eventId: eventId,
        organizerId: event.organizerId,
        actionPath: `/organizer/events/${eventId}`,
      });
    }

    // Send email to organizer
    const organizerData = await User.findById(event.organizerId).select("email firstName lastName");
    if (organizerData?.email) {
      await sendOrganizerEventApprovedEmail(organizerData.email, {
        eventName: event.name,
        organizerName: `${organizerData.firstName} ${organizerData.lastName}`.trim(),
        eventId: eventId,
      });
    }

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

    // Create notification for organizer
    const organizer = await User.findById(event.organizerId).select("_id");
    if (organizer) {
      await AdminNotification.create({
        adminId: organizer._id,
        type: "event_rejected",
        title: `Event Rejected: ${event.name}`,
        message: `Your event "${event.name}" has been rejected. Reason: ${reason}`,
        eventId: eventId,
        organizerId: event.organizerId,
        actionPath: `/organizer/events/${eventId}`,
      });
    }

    // Send email to organizer
    const organizerData = await User.findById(event.organizerId).select("email firstName lastName");
    if (organizerData?.email) {
      await sendOrganizerEventRejectedEmail(organizerData.email, {
        eventName: event.name,
        organizerName: `${organizerData.firstName} ${organizerData.lastName}`.trim(),
        rejectionReason: reason,
      });
    }

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
 * Get event detail by ID
 * Returns full event information including organizer and hall details
 */
export const getEventDetail = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (!eventId) {
      return httpError(res, "Event ID is required", 400);
    }

    const event = await OrganizerEvent.findById(eventId)
      .populate("organizerId", "email firstName lastName")
      .populate("hallId", "name")
      .populate("cateringMenus", "name pricePerPerson description");

    if (!event) {
      return httpError(res, "Event not found", 404);
    }

    // Map to expected structure
    const eventData = {
      _id: event._id,
      name: event.name,
      type: event.type,
      description: event.description,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      eventDate: event.eventDate,
      expectedAttendees: event.expectedAttendees || 0,
      organizerId: event.organizerId,
      hallId: {
        _id: event.hallId?._id,
        name: event.hallId?.name || "TBD",
      },
      catering: event.catering,
      cateringMenus: event.cateringMenus || [],
      decoration: event.decoration,
      requiresTicket: event.requiresTicket,
      status: event.status,
      createdAt: event.createdAt,
    };

    return success(res, eventData);
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
