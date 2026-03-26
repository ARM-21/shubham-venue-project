import mongoose from "mongoose";

/**
 * TicketCheckin
 * Audit trail for all QR scanning activities
 * Track every scan attempt (success/failure) for security & analytics
 */
const ticketCheckinSchema = new mongoose.Schema(
  {
    // Event Reference
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizerEvent",
      required: true,
      index: true,
    },

    // Ticket Reference (optional - some rejections may not have ticket)
    ticketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
      default: null,
    },

    // Staff who scanned
    checkedInBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // When the scan happened
    checkedInAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },

    // Mobile device identifier (for tracking multiple devices per guard)
    deviceId: {
      type: String,
      trim: true,
      // Examples: "DEVICE_UUID_123", "IPHONE_IMEI_456"
    },

    // Scan result status
    status: {
      type: String,
      enum: ["SUCCESS", "ALREADY_CHECKED_IN", "REJECTED", "INVALID_QR"],
      required: true,
      index: true,
    },

    // Detailed reason for rejection
    note: {
      type: String,
      trim: true,
      // Examples: "Ticket is not active", "Ticket locked", "QR token expired"
    },

    // Hash of the scanned QR token (for debugging without exposing tokens)
    payloadHash: {
      type: String,
      trim: true,
      // Useful for: tracking duplicate scans, auditing history
    },

    // Gate/location where scan happened
    gate: {
      type: String,
      trim: true,
    },

    // Optional: Latitude/Longitude from mobile device
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },

    // Optional: Additional metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Can store: phone model, app version, etc.
    },
  },
  { timestamps: true }
);

// Indexes for analytics queries
ticketCheckinSchema.index({ eventId: 1, checkedInAt: 1 });
ticketCheckinSchema.index({ eventId: 1, checkedInBy: 1 });
ticketCheckinSchema.index({ eventId: 1, status: 1 });
ticketCheckinSchema.index({ ticketId: 1, status: 1 });
ticketCheckinSchema.index({ payloadHash: 1 }); // Find duplicate scans

export default mongoose.model("TicketCheckin", ticketCheckinSchema);
