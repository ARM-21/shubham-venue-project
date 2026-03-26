import mongoose from "mongoose";

/**
 * EventStaffAssignment
 * Admin assigns regular users as scanners to specific events
 * Links user to event + gate for QR scanning
 */
const eventStaffAssignmentSchema = new mongoose.Schema(
  {
    // Event Reference
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizerEvent",
      required: true,
      index: true,
    },

    // User Reference (regular customer user)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Gate/Location where this user can scan
    gate: {
      type: String,
      required: true,
      trim: true,
      // Examples: "MAIN_GATE", "BACK_GATE", "VIP_ENTRANCE"
    },

    // Notes from admin
    notes: {
      type: String,
      trim: true,
    },

    // Soft delete - set to false to revoke scanner access
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
eventStaffAssignmentSchema.index({ eventId: 1, userId: 1 });
eventStaffAssignmentSchema.index({ eventId: 1, active: 1 });
eventStaffAssignmentSchema.index({ userId: 1, active: 1 }); // Get user's events

export default mongoose.model("EventStaffAssignment", eventStaffAssignmentSchema);
