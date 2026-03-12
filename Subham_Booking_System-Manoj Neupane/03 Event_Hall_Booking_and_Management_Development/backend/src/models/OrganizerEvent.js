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
    startDateTime: { type: Date },
    endDateTime: { type: Date },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CANCELLED"],
      default: "DRAFT",
      index: true,
    },
  },
  { timestamps: true }
);

organizerEventSchema.index({ organizerId: 1, createdAt: -1 });
organizerEventSchema.index({ isPublic: 1, status: 1, startDateTime: 1 });

export default mongoose.model("OrganizerEvent", organizerEventSchema);
