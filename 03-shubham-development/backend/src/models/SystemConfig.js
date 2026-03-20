import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true, default: "default" },
    maintenanceMode: { type: Boolean, default: false },
    brandingLogoUrl: { type: String, default: "" },
    invoiceOrgName: { type: String, default: "" },
    invoiceOrgAddress: { type: String, default: "" },
    invoiceTaxId: { type: String, default: "" },
    taxPercent: { type: Number, default: 13 },
    serviceChargePercent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

systemConfigSchema.index({ key: 1 }, { unique: true });

const SystemConfig = mongoose.model("SystemConfig", systemConfigSchema);
export default SystemConfig;
