import mongoose from "mongoose";

const flagSchema = new mongoose.Schema(
  {
    // What's being flagged
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizerEvent",
      required: true,
      index: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Flag details
    reason: {
      type: String,
      enum: [
        "suspicious_activity",
        "false_content",
        "policy_violation",
        "spam",
        "fraud",
        "unauthorized_content",
        "inappropriate_content",
        "duplicate_listing",
        "other",
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },

    // Evidence/attachments
    evidence: [
      {
        type: String, // URL to evidence (screenshots, etc.)
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Flag status
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "dismissed"],
      default: "open",
      index: true,
    },

    // Who flagged
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flaggedAt: {
      type: Date,
      default: Date.now,
    },

    // Resolution info
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolutionNotes: String,
    resolution: {
      type: String,
      enum: ["unsuspended_event", "suspended_event", "warned_organizer", "dismissed", "escalated"],
    },

    // Related investigation/resolution thread
    resolutionThreadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FlagResolution",
    },

    // Impact tracking
    impactedEventsSameOrganizer: {
      type: Number,
      default: 0,
    },
    similarSuspiciousPatterns: [
      {
        flagId: mongoose.Schema.Types.ObjectId,
        reason: String,
      },
    ],
  },
  { timestamps: true }
);

// Indexes
flagSchema.index({ eventId: 1, createdAt: -1 });
flagSchema.index({ organizerId: 1, createdAt: -1 });
flagSchema.index({ status: 1, severity: -1 });
flagSchema.index({ severity: -1, createdAt: -1 }); // for priority sorting
flagSchema.index({ organizerId: 1, status: 1 }); // for organizer dashboard

export default mongoose.model("Flag", flagSchema);
