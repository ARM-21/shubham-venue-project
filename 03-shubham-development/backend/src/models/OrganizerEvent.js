import mongoose from "mongoose";

const organizerEventSchema = new mongoose.Schema(
  {
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
      index: true,
    },
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    type: { type: String, trim: true },
    description: { type: String, trim: true },
    isPublic: { type: Boolean, default: true, index: true },
    accessCode: { type: String, trim: true },
    bannerUrl: { type: String, trim: true },
    // Event Timing
    startDateTime: { type: Date },
    endDateTime: { type: Date },
    eventDate: { type: Date }, // Specific date when event happens
    // Registration Period
    registrationStartDate: { type: Date },
    registrationEndDate: { type: Date },
    // Professional Event Details
    eventCategory: {
      type: String,
      enum: [
        "WEDDING",
        "CORPORATE",
        "CONFERENCE",
        "SEMINAR",
        "WORKSHOP",
        "TRADE_SHOW",
        "PRODUCT_LAUNCH",
        "FUNDRAISER",
        "EDUCATIONAL",
        "CULTURAL",
        "SPORTS",
        "ENTERTAINMENT",
        "PRIVATE_PARTY",
        "OTHER",
      ],
      trim: true,
    },
    tags: [{ type: String, trim: true }],
    maxAttendees: { type: Number, min: 1 },
    expectedAttendees: { type: Number, min: 0 },
    targetAudience: { type: String, trim: true },
    dressCode: { type: String, trim: true },
    ageRestriction: { type: String, trim: true },
    // Event Requirements
    specialRequirements: { type: String, trim: true },
    catering: { type: Boolean, default: false },
    decoration: { type: Boolean, default: false },
    requiresTicket: { type: Boolean, default: true },
    // Location Details
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    // Media & Content
    additionalDetails: {
      type: Map,
      of: String,
      default: {},
    },
    status: {
      type: String,
      enum: ["DRAFT", "PENDING_REVIEW", "PUBLISHED", "CANCELLED", "SUSPENDED"],
      default: "DRAFT",
      index: true,
    },

    // Admin approval fields (for trust score < 3)
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvalNotes: String,
    rejectionReason: String,

    // Flagging & Suspension
    flags: [
      {
        flagId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Flag",
        },
        flaggedAt: Date,
        flaggedBy: mongoose.Schema.Types.ObjectId,
        reason: String,
        severity: String,
        status: { type: String, enum: ["open", "resolved", "dismissed"] },
        resolvedAt: Date,
      },
    ],
    isFlagged: {
      type: Boolean,
      default: false,
      index: true,
    },
    suspendedAt: Date,
    suspensionReason: String,
    suspensionEndDate: Date, // for temporary suspensions

    // Publishing metadata
    publishedAt: Date,
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

organizerEventSchema.index({ organizerId: 1, createdAt: -1 });
organizerEventSchema.index({ isPublic: 1, status: 1, startDateTime: 1 });

export default mongoose.model("OrganizerEvent", organizerEventSchema);
