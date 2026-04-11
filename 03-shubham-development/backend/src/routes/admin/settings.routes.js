import express from "express";
import ENV from "../../config/env.config.js";
import { resetMaintenanceCache } from "../../middleware/maintenance.middleware.js";
import { uploadLimiter } from "../../config/rateLimit.config.js";
import SystemConfig from "../../models/SystemConfig.js";
import User from "../../models/User.js";
import { generateImageUploadUrl } from "../../services/upload/presigned.service.js";

const router = express.Router();

const buildS3PublicUrl = ({ bucket, region, key }) => {
  if (!bucket || !region || !key) return "";
  const cleanKey = key.replace(/^\/+/, "");
  return `https://${bucket}.s3.${region}.amazonaws.com/${cleanKey}`;
};

const DEFAULT_LOGO_URL =
  ENV.DEFAULT_BRANDING_LOGO_URL ||
  buildS3PublicUrl({
    bucket: ENV.AWS_S3_BUCKET_NAME,
    region: ENV.AWS_REGION,
    key: ENV.DEFAULT_BRANDING_LOGO_KEY,
  });

async function getOrCreateConfig() {
  const existing = await SystemConfig.findOne({ key: "default" });
  if (existing) return existing;
  return SystemConfig.create({
    key: "default",
    brandingLogoUrl: DEFAULT_LOGO_URL || "",
  });
}

router.get("/config", async (req, res, next) => {
  try {
    const config = await getOrCreateConfig();
    return res.json({ config });
  } catch (err) {
    return next(err);
  }
});

router.put("/config", async (req, res, next) => {
  try {
    const {
      maintenanceMode,
      brandingLogoUrl,
      invoiceOrgName,
      invoiceOrgAddress,
      invoiceTaxId,
      taxPercent,
      serviceChargePercent,
    } = req.body || {};

    if (maintenanceMode !== undefined && typeof maintenanceMode !== "boolean") {
      return res.status(400).json({ message: "maintenanceMode must be boolean" });
    }

    if (taxPercent !== undefined && !Number.isFinite(Number(taxPercent))) {
      return res.status(400).json({ message: "taxPercent must be a number" });
    }

    if (serviceChargePercent !== undefined && !Number.isFinite(Number(serviceChargePercent))) {
      return res.status(400).json({ message: "serviceChargePercent must be a number" });
    }

    const config = await getOrCreateConfig();
    if (maintenanceMode !== undefined) config.maintenanceMode = maintenanceMode;
    if (brandingLogoUrl !== undefined) {
      config.brandingLogoUrl = String(brandingLogoUrl || DEFAULT_LOGO_URL || "").trim();
    } else if (!config.brandingLogoUrl && DEFAULT_LOGO_URL) {
      config.brandingLogoUrl = String(DEFAULT_LOGO_URL).trim();
    }
    if (invoiceOrgName !== undefined) config.invoiceOrgName = String(invoiceOrgName || "").trim();
    if (invoiceOrgAddress !== undefined) config.invoiceOrgAddress = String(invoiceOrgAddress || "").trim();
    if (invoiceTaxId !== undefined) config.invoiceTaxId = String(invoiceTaxId || "").trim();
    if (taxPercent !== undefined) config.taxPercent = Number(taxPercent);
    if (serviceChargePercent !== undefined) config.serviceChargePercent = Number(serviceChargePercent);
    await config.save();
    resetMaintenanceCache();

    return res.json({ message: "Config updated", config });
  } catch (err) {
    return next(err);
  }
});

router.post("/config/logo-upload", uploadLimiter, async (req, res, next) => {
  try {
    const { fileExtension, contentType } = req.body || {};
    if (!fileExtension || !contentType) {
      return res.status(400).json({ message: "fileExtension and contentType are required" });
    }

    const upload = await generateImageUploadUrl({
      folder: "uploads/system-branding",
      filePrefix: "branding",
      fileExtension,
      contentType,
      metadataType: "branding-logo",
    });

    return res.json(upload);
  } catch (err) {
    return next(err);
  }
});

router.patch("/notifications", async (req, res, next) => {
  try {
    const { emailNotifications } = req.body || {};
    if (typeof emailNotifications !== "boolean") {
      return res.status(400).json({ message: "emailNotifications must be boolean" });
    }

    await User.findByIdAndUpdate(req.currentUser._id, { notifyBookings: emailNotifications }, { new: true });
    return res.json({ message: "Notification preference updated", emailNotifications });
  } catch (err) {
    return next(err);
  }
});

export default router;
