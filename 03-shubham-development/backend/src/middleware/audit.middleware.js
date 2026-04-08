import AuditLog from "../models/AuditLog.js";

/**
 * Middleware to track audit logs for admin operations
 * Usage: Pass audit info via req.auditLog = { entityType, entityId, action, metadata }
 */
export const auditMiddleware = async (req, res, next) => {
  // Store original send method
  const originalSend = res.send;

  res.send = function (data) {
    // Only log on successful responses (2xx)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      if (req.auditLog) {
        createAuditLog({
          ...req.auditLog,
          performedBy: req.currentUser?._id,
          performedByRole: req.currentUser?.role || "system",
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        }).catch((err) => console.error("Audit log error:", err));
      }
    }

    // Call original send
    return originalSend.call(this, data);
  };

  next();
};

/**
 * Create an audit log entry
 */
export async function createAuditLog(logData) {
  try {
    const log = new AuditLog({
      entityType: logData.entityType,
      entityId: logData.entityId,
      action: logData.action,
      performedBy: logData.performedBy,
      performedByRole: logData.performedByRole || "organizer",
      changes: logData.changes || { before: {}, after: {}, fields: [] },
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      metadata: logData.metadata || {},
      relatedOrganizerId: logData.relatedOrganizerId,
    });

    await log.save();
    return log;
  } catch (error) {
    console.warn("Warning: Could not create audit log:", error.message);
    // Don't throw - audit failures shouldn't break operations or metrics sync
    return null;
  }
}

/**
 * Helper to attach audit data to request
 */
export function setAudit(req, auditData) {
  req.auditLog = auditData;
}

/**
 * Get audit trail for an entity
 */
export async function getAuditTrail(entityType, entityId, limit = 50) {
  return await AuditLog.find({
    entityType,
    entityId,
  })
    .populate("performedBy", "email username role")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * Get audit trail for organizer (all their events/activities)
 */
export async function getOrganizerAuditTrail(organizerId, limit = 100) {
  return await AuditLog.find({
    relatedOrganizerId: organizerId,
  })
    .populate("performedBy", "email username role")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * Export audit trail (for compliance/investigation)
 */
export async function exportAuditTrail(filters = {}) {
  const query = {};

  if (filters.entityType) query.entityType = filters.entityType;
  if (filters.entityId) query.entityId = filters.entityId;
  if (filters.organizerId) query.relatedOrganizerId = filters.organizerId;
  if (filters.action) query.action = filters.action;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  return await AuditLog.find(query)
    .populate("performedBy", "email username role")
    .sort({ createdAt: -1 })
    .lean();
}
