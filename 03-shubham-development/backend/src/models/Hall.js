import mongoose from "mongoose";

const hallSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true, index: true, unique: true },
    description: { type: String },
    capacity: { type: Number, required: true, min: 1 },
    location: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
    images: [{ type: String }],
    amenities: [{ type: String }],
    pricePerHour: { type: Number, default: 0, min: 0, required: true },
    currency: { type: String, default: "NPR" },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    notes: { type: String }
  },
  { timestamps: true }
);


hallSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name.toLowerCase().split(" ").join("-");
  }
  next();
});

export default mongoose.model("Hall", hallSchema);