import mongoose from "mongoose";

const ticketTypeSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrganizerEvent",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantityTotal: { type: Number, required: true, min: 1 },
    quantitySold: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ticketTypeSchema.index({ eventId: 1, name: 1 });

export default mongoose.model("TicketType", ticketTypeSchema);
