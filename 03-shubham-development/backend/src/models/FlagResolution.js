import mongoose from "mongoose";

const flagResolutionSchema = new mongoose.Schema(
  {
    flagId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Flag",
      required: true,
      unique: true,
      index: true,
    },
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

    // Investigation status
    status: {
      type: String,
      enum: ["open", "investigating", "resolved", "dismissed"],
      default: "open",
      index: true,
    },
    initialSeverity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
    },

    // Investigation timeline/discussion
    timeline: [
      {
        action: {
          type: String,
          enum: ["flagged", "commented", "evidence_added", "escalated", "resolved", "dismissed"],
        },
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        performedByRole: {
          type: String,
          enum: ["admin", "system"],
        },
        message: String,
        evidence: [String], // URLs to attached evidence
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Investigation decision
    decision: {
      type: String,
      enum: ["warning", "suspended_7days", "suspended_30days", "permanent_suspension", "dismissed"],
    },
    decisionReason: String,
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    decidedAt: Date,

    // Actions taken
    actions: [
      {
        type: String,
        enum: [
          "event_suspended",
          "event_restored",
          "organizer_suspended",
          "organizer_warned",
          "trust_score_adjusted",
          "notification_sent",
          "evidence_archived",
        ],
      },
    ],

    // Follow-up
    requiresEscalation: Boolean,
    escalatedTo: String, // e.g., "legal_team", "fraud_department"
    needsFollowUp: Boolean,
    followUpDate: Date,
    followUpNotes: String,

    // Metadata
    tags: [String], // e.g., ["repeat_offender", "high_value_fraud"]
    relatedCases: [mongoose.Schema.Types.ObjectId], // other FlagResolution IDs with same patterns
  },
  { timestamps: true }
);

// Indexes
flagResolutionSchema.index({ organizerId: 1, createdAt: -1 });
flagResolutionSchema.index({ status: 1, decidedAt: -1 });
flagResolutionSchema.index({ needsFollowUp: 1, followUpDate: 1 });

export default mongoose.model("FlagResolution", flagResolutionSchema);
