import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true, default: "default" },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

systemConfigSchema.index({ key: 1 }, { unique: true });

const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);
export default SystemConfig;
