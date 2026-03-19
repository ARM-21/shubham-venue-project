import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizerEvent",
      required: true,
      index: true,
    },
    ticketTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketType",
      required: true,
      index: true,
    },
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TicketPayment",
      default: null,
    },
    qrCodeValue: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED", "REFUNDED"],
      default: "ACTIVE",
      index: true,
    },
    checkedInAt: { type: Date },
  },
  { timestamps: true }
);

ticketSchema.index({ eventId: 1, ownerUserId: 1 });

export default mongoose.model("Ticket", ticketSchema);
