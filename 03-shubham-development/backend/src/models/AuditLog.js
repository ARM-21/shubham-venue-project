import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    // Entity info
    entityType: {
      type: String,
      enum: ["event", "organizer", "user", "system"],
      required: true,
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.Mixed, // Can be ObjectId or string for system operations
      required: true,
      index: true,
    },

    // Action tracking
    action: {
      type: String,
      enum: [
        "created",
        "edited",
        "published",
        "flagged",
        "unflagged",
        "suspended",
        "unsuspended",
        "approved",
        "rejected",
        "deleted",
        "status_changed",
        "bulk_metrics_recalculation",
      ],
      required: true,
      index: true,
    },

    // Who performed action
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    performedByRole: {
      type: String,
      enum: ["organizer", "admin", "system"],
      default: "organizer",
    },

    // What changed
    changes: {
      before: { type: Object, default: {} },
      after: { type: Object, default: {} },
      fields: [String], // array of field names that changed
    },

    // Request context
    ipAddress: String,
    userAgent: String,

    // Additional metadata
    metadata: {
      reason: String, // why action was taken
      notes: String, // additional notes
      references: {
        flagId: mongoose.Schema.Types.ObjectId,
        bookingId: mongoose.Schema.Types.ObjectId,
        eventId: mongoose.Schema.Types.ObjectId,
      },
    },

    // Soft reference to parent event/organizer for faster queries
    relatedOrganizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
auditLogSchema.index({ entityId: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ relatedOrganizerId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 }); // for timeline views

export default mongoose.model("AuditLog", auditLogSchema);
