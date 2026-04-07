import Flag from "../../models/Flag.js";
import FlagResolution from "../../models/FlagResolution.js";
import OrganizerEvent from "../../models/OrganizerEvent.js";
import User from "../../models/User.js";
import {
  onEventFlagged,
  onFlagResolved,
  suspendOrganizer,
  liftSuspension,
  updateTrustScore,
} from "../../services/trustScore.service.js";
import { createAuditLog } from "../../middleware/audit.middleware.js";
import { success, httpError } from "../../utils/http.utils.js";

/**
 * Admin: Flag an event
 */
export const flagEvent = async (req, res, next) => {
  try {
    const { eventId, reason, severity, description, evidence } = req.body;
    const adminId = req.currentUser._id;

    // Validate
    if (!eventId || !reason || !description) {
      return httpError(res, "Missing required fields", 400);
    }

    // Get event
    const event = await OrganizerEvent.findById(eventId);
    if (!event) {
      return httpError(res, "Event not found", 404);
    }

    // Check if already flagged with same reason
    const existingFlag = await Flag.findOne({
      eventId,
      reason,
      status: "open",
    });

    if (existingFlag) {
      return httpError(res, "Event already flagged with this reason", 409);
    }

    // Create flag
    const newFlag = await Flag.create({
      eventId,
      organizerId: event.organizerId,
      reason,
      severity: severity || "medium",
      description,
      evidence: evidence || [],
      flaggedBy: adminId,
      flaggedAt: new Date(),
    });

    // Create resolution thread
    const thread = await FlagResolution.create({
      flagId: newFlag._id,
      eventId,
      organizerId: event.organizerId,
      initialSeverity: newFlag.severity,
      status: "open",
      timeline: [
        {
          action: "flagged",
          performedBy: adminId,
          performedByRole: "admin",
          message: description,
          evidence: evidence || [],
          timestamp: new Date(),
        },
      ],
    });

    // Update event - Mark as flagged but DO NOT auto-suspend
    // Event stays public during investigation. Admin decides suspension after review.
    await OrganizerEvent.findByIdAndUpdate(eventId, {
      isFlagged: true,
      $push: {
        flags: {
          flagId: newFlag._id,
          flaggedAt: new Date(),
          flaggedBy: adminId,
          reason,
          severity: newFlag.severity,
          status: "open",
        },
      },
    });

    // Update organizer metrics
    await onEventFlagged(event.organizerId);

    // Audit log
    await createAuditLog({
      entityType: "event",
      entityId: eventId,
      action: "flagged",
      performedBy: adminId,
      performedByRole: "admin",
      changes: {
        before: { isFlagged: false },
        after: { isFlagged: true, flagId: newFlag._id },
        fields: ["isFlagged", "flags"],
      },
      relatedOrganizerId: event.organizerId,
      metadata: { reason, severity: newFlag.severity, description },
    });

    return success(res, { flag: newFlag, thread: thread._id }, "Event flagged successfully", 201);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all flags (with filters and pagination)
 */
export const getAllFlags = async (req, res, next) => {
  try {
    const {
      status,
      severity,
      organizerId,
      eventId,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    // Only filter by status if explicitly provided (not "all" or undefined)
    if (status && status !== 'all') query.status = status;
    if (severity && severity !== 'all') query.severity = severity;
    if (organizerId) query.organizerId = organizerId;
    if (eventId) query.eventId = eventId;

    const skip = (page - 1) * limit;

    const flags = await Flag.find(query)
      .populate("eventId", "name startDateTime eventDate status type hallId")
      .populate("organizerId", "email username firstName lastName")
      .populate("flaggedBy", "email username")
      .sort({ severity: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Flag.countDocuments(query);

    return success(
      res,
      {
        flags,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          current: parseInt(page),
        },
      },
      "Flags retrieved"
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get flag investigation details
 */
export const getFlagResolution = async (req, res, next) => {
  try {
    const { flagId } = req.params;

    // Check if flag exists first
    const flag = await Flag.findById(flagId)
      .populate("eventId", "name startDateTime eventDate status type hallId createdAt")
      .populate("flaggedBy", "email username")
      .populate("organizerId", "email username firstName lastName");

    if (!flag) {
      return httpError(res, "Flag not found", 404);
    }

    let resolution = await FlagResolution.findOne({ flagId })
      .populate("timeline.performedBy", "email username role")
      .populate("decidedBy", "email username");
    
    // If resolution doesn't exist, create it (data consistency fix for flags created before resolution logic)
    if (!resolution) {
      resolution = await FlagResolution.create({
        flagId,
        eventId: flag.eventId._id,
        organizerId: flag.organizerId._id,
        initialSeverity: flag.severity,
        status: "open",
        timeline: [
          {
            action: "flagged",
            performedBy: flag.flaggedBy._id,
            performedByRole: "admin",
            message: flag.description,
            evidence: flag.evidence || [],
            timestamp: flag.flaggedAt,
          },
        ],
      });
      // Populate the new resolution
      resolution = await FlagResolution.findById(resolution._id)
        .populate("timeline.performedBy", "email username role")
        .populate("decidedBy", "email username");
    }

    return success(
      res,
      { flag, resolution },
      "Resolution details retrieved"
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Add comment/evidence to investigation
 */
export const addFlagComment = async (req, res, next) => {
  try {
    const { flagId } = req.params;
    const { message, evidence } = req.body;
    const adminId = req.currentUser._id;

    // Get current flag status
    const flag = await Flag.findById(flagId);
    if (!flag) {
      return httpError(res, "Flag not found", 404);
    }

    // Auto-move to investigating if currently open
    const timelineEntries = [];
    
    if (flag.status === "open") {
      // Update flag status to investigating
      await Flag.findByIdAndUpdate(flagId, {
        status: "investigating",
      });

      // Add status change to timeline
      timelineEntries.push({
        action: "status_changed",
        performedBy: adminId,
        performedByRole: "admin",
        message: "Investigation started",
        timestamp: new Date(),
      });
    }

    // Add the comment
    timelineEntries.push({
      action: "commented",
      performedBy: adminId,
      performedByRole: "admin",
      message,
      evidence: evidence || [],
      timestamp: new Date(),
    });

    const thread = await FlagResolution.findOneAndUpdate(
      { flagId },
      {
        $push: {
          timeline: { $each: timelineEntries },
        },
        // Update resolution status if it was open
        ...(flag.status === "open" && { status: "investigating" }),
      },
      { new: true }
    ).populate("timeline.performedBy", "email username");

    if (!thread) {
      return httpError(res, "Resolution thread not found", 404);
    }

    return success(res, thread, "Comment added and investigation started");
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Resolve flag (make decision)
 */
export const resolveFlag = async (req, res, next) => {
  try {
    const { flagId } = req.params;
    const { resolution, decision, reason, suspensionDays } = req.body;
    const adminId = req.currentUser._id;

    // Accept both "resolution" and "decision" for flexibility
    const finalDecision = resolution || decision;

    // Validate decision
    if (!finalDecision) {
      return httpError(res, "Resolution/Decision is required", 400);
    }

    const validDecisions = ["warning", "suspended_7days", "suspended_30days", "permanent_suspension", "dismissed"];
    if (!validDecisions.includes(finalDecision)) {
      return httpError(res, `Invalid decision. Must be one of: ${validDecisions.join(", ")}`, 400);
    }

    if (!reason || !reason.trim()) {
      return httpError(res, "Reason is required", 400);
    }

    const flag = await Flag.findById(flagId);
    if (!flag) {
      return httpError(res, "Flag not found", 404);
    }

    const thread = await FlagResolution.findOne({ flagId });
    if (!thread) {
      return httpError(res, "Resolution thread not found", 404);
    }

    // Update flag
    await Flag.findByIdAndUpdate(flagId, {
      status: finalDecision === "dismissed" ? "dismissed" : "resolved",
      resolution:
        finalDecision === "dismissed"
          ? "dismissed"
          : finalDecision === "warning"
          ? "warned_organizer"
          : "suspended_event",
      resolvedBy: adminId,
      resolvedAt: new Date(),
      resolutionNotes: reason,
    });

    // Update thread
    const actions = [];
    const suspensionDaysNum = suspensionDays
      ? parseInt(suspensionDays)
      : finalDecision === "suspended_7days"
      ? 7
      : finalDecision === "suspended_30days"
      ? 30
      : null;

    if (finalDecision === "warning") {
      actions.push("organizer_warned");
    } else if (finalDecision.includes("suspended")) {
      actions.push("event_suspended");
      if (suspensionDaysNum) {
        actions.push("organizer_suspended");
      }
    } else if (finalDecision === "dismissed") {
      actions.push("event_restored");
    }

    await FlagResolution.findByIdAndUpdate(
      thread._id,
      {
        status: finalDecision === "dismissed" ? "dismissed" : "resolved",
        decision: finalDecision,
        decisionReason: reason,
        decidedBy: adminId,
        decidedAt: new Date(),
        actions,
      },
      { new: true }
    );

    // Take action on organizer
    if (finalDecision === "warning") {
      await updateTrustScore(flag.organizerId);
    } else if (finalDecision.includes("suspended")) {
      await suspendOrganizer(
        flag.organizerId,
        `Flagged: ${flag.reason}`,
        suspensionDaysNum
      );
    } else if (finalDecision === "dismissed") {
      await onFlagResolved(flag.organizerId, "dismissed");

      // Restore event if was suspended
      await OrganizerEvent.findByIdAndUpdate(flag.eventId, {
        isFlagged: false,
        suspendedAt: null,
        suspensionReason: null,
      });
    }

    // Audit log
    await createAuditLog({
      entityType: "event",
      entityId: flag.eventId,
      action: "flagged", // or could be new "resolved" action
      performedBy: adminId,
      performedByRole: "admin",
      metadata: {
        decision: finalDecision,
        reason,
        suspensionDays: suspensionDaysNum,
      },
      relatedOrganizerId: flag.organizerId,
    });

    return success(
      res,
      { 
        flag: await Flag.findById(flagId)
          .populate("eventId", "name startDateTime eventDate status type hallId")
          .populate("flaggedBy", "email username")
          .populate("organizerId", "email username firstName lastName"), 
        thread 
      },
      `Flag ${finalDecision}`
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Dismiss flag
 */
export const dismissFlag = async (req, res, next) => {
  try {
    const { flagId } = req.params;
    const { reason } = req.body;
    const adminId = req.currentUser._id;

    await Flag.findByIdAndUpdate(
      flagId,
      {
        status: "dismissed",
        resolution: "dismissed",
        resolvedBy: adminId,
        resolvedAt: new Date(),
        resolutionNotes: reason,
      }
    );

    // Fetch flag with populated fields
    const flag = await Flag.findById(flagId)
      .populate("eventId", "name startDateTime eventDate status type hallId")
      .populate("flaggedBy", "email username")
      .populate("organizerId", "email username firstName lastName");

    if (!flag) {
      return httpError(res, "Flag not found", 404);
    }

    const thread = await FlagResolution.findOneAndUpdate(
      { flagId },
      {
        status: "dismissed",
        decision: "dismissed",
        decisionReason: reason,
        decidedBy: adminId,
        decidedAt: new Date(),
        actions: ["event_restored"],
      },
      { new: true }
    );

    // Restore event
    await OrganizerEvent.findByIdAndUpdate(flag.eventId._id, {
      isFlagged: false,
      suspendedAt: null,
    });

    // Update organizer score
    await onFlagResolved(flag.organizerId._id, "dismissed");

    return success(res, { flag, thread }, "Flag dismissed");
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get organizer's flags history
 */
export const getOrganizerFlags = async (req, res, next) => {
  try {
    const { organizerId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const flags = await Flag.find({
      organizerId,
    })
      .populate("flaggedBy", "email username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Flag.countDocuments({ organizerId });

    return success(res, {
      flags,
      pagination: { total, pages: Math.ceil(total / limit), current: page },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get dashboard stats
 */
export const getFlagDashboard = async (req, res, next) => {
  try {
    const openFlags = await Flag.countDocuments({ status: "open" });
    const highSeverity = await Flag.countDocuments({
      severity: { $in: ["high", "critical"] },
      status: "open",
    });
    const investigatingFlags = await FlagResolution.countDocuments({
      status: "investigating",
    });
    const resolvedTotal = await Flag.countDocuments({ status: "resolved" });

    const recentFlags = await Flag.find({})
      .populate("eventId", "name description startDateTime")
      .populate("organizerId", "email firstName lastName")
      .sort({ createdAt: -1 })
      .limit(10);

    return success(res, {
      stats: {
        activeFlags: openFlags,
        highPriority: highSeverity,
        investigating: investigatingFlags,
        totalResolved: resolvedTotal,
      },
      recentFlags,
    });
  } catch (err) {
    next(err);
  }
};
