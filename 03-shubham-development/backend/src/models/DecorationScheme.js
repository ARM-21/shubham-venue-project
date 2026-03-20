import mongoose from "mongoose";

const decorationSchemeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    features: [{ type: String }],
    imageUrl: { type: String },
    includedAddons: [{ type: mongoose.Schema.Types.ObjectId, ref: "DecorationAddon" }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("DecorationScheme", decorationSchemeSchema);
