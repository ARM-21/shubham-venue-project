import mongoose from "mongoose";

const ticketPaymentSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "OrganizerEvent", required: true, index: true },
    ticketTypeId: { type: mongoose.Schema.Types.ObjectId, ref: "TicketType", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", default: null },

    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "NPR" },
    gateway: { type: String, enum: ["ESEWA", "KHALTI", "FREE"], required: true },

    status: {
      type: String,
      enum: ["INITIATED", "COMPLETED", "FAILED"],
      default: "INITIATED",
      index: true,
    },

    transactionUuid: { type: String, required: true, index: true },
    transactionId: { type: String },
    gatewayResponse: { type: mongoose.Schema.Types.Mixed },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

ticketPaymentSchema.index({ userId: 1, createdAt: -1 });

ticketPaymentSchema.index({ eventId: 1, ticketTypeId: 1, status: 1 });

export default mongoose.model("TicketPayment", ticketPaymentSchema);
