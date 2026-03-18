import mongoose from "mongoose";

const eventTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true , require: true},
    description: { type: String, default: "" },
    audience: { type: String, enum: ["customer", "organizer", "both"], default: "customer" },
    defaultMenuId: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", default: null },
    price: { type: Number, default: 0}, 
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
  },
  { timestamps: true }
);

const EventType = mongoose.model("EventType", eventTypeSchema, "event_types");
export default EventType;