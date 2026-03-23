import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    hallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hall",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
    // Detailed ratings for different aspects
    aspects: {
      cleanliness: { type: Number, min: 1, max: 5 },
      service: { type: Number, min: 1, max: 5 },
      ambiance: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
    },
    images: [{ type: String }],
    isVerified: {
      type: Boolean,
      default: false, // true if user actually booked the venue
    },
    likes: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminNotes: { type: String },
  },
  { timestamps: true }
);

// Index for efficient queries
reviewSchema.index({ hallId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
