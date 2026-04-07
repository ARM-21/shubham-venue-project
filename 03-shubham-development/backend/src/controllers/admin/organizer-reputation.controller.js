import User from "../../models/User.js";
import Flag from "../../models/Flag.js";
import OrganizerEvent from "../../models/OrganizerEvent.js";
import {
  getOrganizerReputation,
  suspendOrganizer,
  liftSuspension,
  updateTrustScore,
} from "../../services/trustScore.service.js";
import {
  recalculateOrganizerMetrics,
  recalculateAllOrganizerMetrics,
} from "../../services/metrics.service.js";
import { createAuditLog } from "../../middleware/audit.middleware.js";
import { success, httpError } from "../../utils/http.utils.js";

/**
 * Admin: Get organizer reputation dashboard
 */
export const getOrganizerReputationDashboard = async (req, res, next) => {
  try {
    const { organizerId } = req.params;

    const reputation = await getOrganizerReputation(organizerId);

    if (!reputation) {
      return httpError(res, "Organizer not found", 404);
    }

    // Get more detailed data
    const organizer = await User.findById(organizerId).select(
      "email firstName lastName phone city organizerStatus isOrganizerEligible trustMetrics suspensionStatus"
    );

    const recentFlags = await Flag.find({
      organizerId,
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentEvents = await OrganizerEvent.find({
      organizerId,
    })
      .select("name status createdAt isFlagged")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return success(res, {
      organizer,
      reputation,
      recentFlags,
      recentEvents,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get all organizers with reputation scores
 */
export const getAllOrganizersWithReputation = async (req, res, next) => {
  try {
    const {
      trustScore,
      suspended,
      hasFlags,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {
      isOrganizerEligible: true,
    };

    if (suspended === "true") {
      query.suspensionStatus = { $ne: "none" };
    } else if (suspended === "false") {
      query.suspensionStatus = "none";
    }

    let organizers = await User.find(query)
      .select(
        "email firstName lastName trustMetrics suspensionStatus organizerStatus"
      )
      .sort({ "trustMetrics.trustScore": -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Add flag counts if needed
    if (hasFlags === "true" || hasFlags === "false") {
      organizers = await Promise.all(
        organizers.map(async (org) => {
          const flagCount = await Flag.countDocuments({
            organizerId: org._id,
            status: "open",
          });
          return { ...org, openFlags: flagCount };
        })
      );

      if (hasFlags === "true") {
        organizers = organizers.filter((org) => org.openFlags > 0);
      } else {
        organizers = organizers.filter((org) => org.openFlags === 0);
      }
    }

    const total = await User.countDocuments(query);

    return success(res, {
      organizers,
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
 * Admin: Suspend organizer
 */
export const manualSuspendOrganizer = async (req, res, next) => {
  try {
    const { organizerId } = req.params;
    const { reason, suspensionDays } = req.body;
    const adminId = req.currentUser._id;

    if (!reason) {
      return httpError(res, "Suspension reason required", 400);
    }

    const organizer = await suspendOrganizer(
      organizerId,
      reason,
      suspensionDays || null
    );

    // Audit log
    await createAuditLog({
      entityType: "organizer",
      entityId: organizerId,
      action: "suspended",
      performedBy: adminId,
      performedByRole: "admin",
      metadata: { reason, suspensionDays },
      relatedOrganizerId: organizerId,
    });

    return success(res, organizer, "Organizer suspended");
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Lift organizer suspension
 */
export const liftOrganizerSuspension = async (req, res, next) => {
  try {
    const { organizerId } = req.params;
    const adminId = req.currentUser._id;

    const organizer = await liftSuspension(organizerId, adminId);

    // Audit log
    await createAuditLog({
      entityType: "organizer",
      entityId: organizerId,
      action: "unsuspended",
      performedBy: adminId,
      performedByRole: "admin",
      relatedOrganizerId: organizerId,
    });

    return success(res, organizer, "Organizer suspension lifted");
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Manually adjust trust score
 */
export const adjustTrustScore = async (req, res, next) => {
  try {
    const { organizerId } = req.params;
    const { adjustment, reason } = req.body;
    const adminId = req.currentUser._id;

    if (!adjustment || !reason) {
      return httpError(res, "Adjustment and reason required", 400);
    }

    const organizer = await User.findById(organizerId);
    if (!organizer) {
      return httpError(res, "Organizer not found", 404);
    }

    const oldScore = organizer.trustMetrics.trustScore;
    const newScore = Math.max(1, Math.min(5, oldScore + adjustment));

    await User.findByIdAndUpdate(organizerId, {
      "trustMetrics.trustScore": newScore,
      "trustMetrics.lastUpdatedAt": new Date(),
    });

    // Audit log
    await createAuditLog({
      entityType: "organizer",
      entityId: organizerId,
      action: "status_changed",
      performedBy: adminId,
      performedByRole: "admin",
      changes: {
        before: { trustScore: oldScore },
        after: { trustScore: newScore },
        fields: ["trustScore"],
      },
      metadata: { adjustment, reason },
      relatedOrganizerId: organizerId,
    });

    return success(res, { oldScore, newScore }, "Trust score adjusted");
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get organizer events for review
 */
export const getOrganizerEventsForReview = async (req, res, next) => {
  try {
    const { organizerId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const query = { organizerId };
    if (status) query.status = status;

    const events = await OrganizerEvent.find(query)
      .populate("hallId", "name city capacity")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
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
 * Admin: Get organizer's full audit trail
 */
export const getOrganizerAuditTrail = async (req, res, next) => {
  try {
    const { organizerId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const { getOrganizerAuditTrail: getTrail } = await import(
      "../../middleware/audit.middleware.js"
    );
    const auditTrail = await getTrail(organizerId, page * limit);

    return success(res, {
      auditTrail,
      pagination: {
        returned: auditTrail.length,
        current: parseInt(page),
        perPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Send warning to organizer
 */
export const sendOrganizerWarning = async (req, res, next) => {
  try {
    const { organizerId } = req.params;
    const { message, reason } = req.body;
    const adminId = req.currentUser._id;

    // TODO: Implement email notification system
    // For now, just create audit log

    await createAuditLog({
      entityType: "organizer",
      entityId: organizerId,
      action: "status_changed",
      performedBy: adminId,
      performedByRole: "admin",
      metadata: {
        warningReason: reason,
        warningMessage: message,
      },
      relatedOrganizerId: organizerId,
    });

    return success(
      res,
      { message: "Warning sent" },
      "Warning sent to organizer"
    );
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get suspended organizers statistics
 */
export const getSuspensionStats = async (req, res, next) => {
  try {
    const totalSuspended = await User.countDocuments({
      suspensionStatus: { $ne: "none" },
    });

    // Count active temporary suspensions (status = temporary AND end date in future)
    const temporarySuspended = await User.countDocuments({
      suspensionStatus: "temporary",
      suspensionEndDate: { $gt: new Date() },
    });

    // Count expired temporary suspensions (status = temporary BUT end date has passed)
    const expiredTemporarySuspensions = await User.countDocuments({
      suspensionStatus: "temporary",
      suspensionEndDate: { $lte: new Date() },
    });

    const permanentSuspended = await User.countDocuments({
      suspensionStatus: "permanent",
    });

    // Count temporary suspensions expiring within 7 days
    const expiringSoon = await User.countDocuments({
      suspensionStatus: "temporary",
      suspensionEndDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return success(res, {
      stats: {
        totalSuspended,
        temporary: temporarySuspended,
        permanent: permanentSuspended,
        expiringSoon,
        expiredTemporary: expiredTemporarySuspensions,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Get audit logs with filters
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = "", entityType = "all", action = "all", dateRange = "all" } = req.query;
    
    // Import AuditLog model if it exists, otherwise return empty
    let AuditLog;
    try {
      AuditLog = (await import("../../models/AuditLog.js")).default;
    } catch (e) {
      // AuditLog model doesn't exist yet, return empty data
      return success(res, {
        logs: [],
        pagination: {
          total: 0,
          pages: 0,
          current: parseInt(page),
          perPage: parseInt(limit),
        },
      });
    }

    const query = {};

    // Apply filters
    if (search) {
      query.$or = [
        { userId: new RegExp(search, "i") },
        { action: new RegExp(search, "i") },
        { entityId: new RegExp(search, "i") },
      ];
    }

    if (entityType !== "all") {
      query.entityType = entityType;
    }

    if (action !== "all") {
      query.action = action;
    }

    if (dateRange !== "all") {
      const now = new Date();
      let startDate;
      
      switch (dateRange) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }
      
      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    const skip = (page - 1) * limit;
    const logs = await AuditLog.find(query)
      .populate('performedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await AuditLog.countDocuments(query);

    return success(res, {
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        current: parseInt(page),
        perPage: parseInt(limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Recalculate metrics for a specific organizer or all organizers
 * POST /api/v1/admin/governance/stats/recalculate
 * Body: { organizerId?: string } - if omitted, recalculates all organizers
 */
export const recalculateMetrics = async (req, res, next) => {
  try {
    const { organizerId } = req.body;
    const adminId = req.currentUser._id;

    if (organizerId) {
      // Recalculate single organizer
      const organizer = await User.findById(organizerId);
      if (!organizer) {
        return httpError(res, "Organizer not found", 404);
      }

      const metrics = await recalculateOrganizerMetrics(organizerId);

      // Audit log
      await createAuditLog({
        entityType: "organizer",
        entityId: organizerId,
        action: "metrics_recalculated",
        performedBy: adminId,
        performedByRole: "admin",
        metadata: { type: "single", newMetrics: metrics },
        relatedOrganizerId: organizerId,
      });

      return success(
        res,
        { organizerId, metrics },
        "Metrics recalculated for organizer"
      );
    } else {
      // Recalculate all organizers
      const result = await recalculateAllOrganizerMetrics();

      // Audit log
      await createAuditLog({
        entityType: "system",
        entityId: "metrics_bulk_recalculation",
        action: "bulk_metrics_recalculation",
        performedBy: adminId,
        performedByRole: "admin",
        metadata: result,
      });

      return success(res, result, "Metrics recalculated for all organizers");
    }
  } catch (err) {
    next(err);
  }
};
