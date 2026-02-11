import express from "express";
import SystemConfig from "../../models/SystemConfig.js";
import User from "../../models/User.js";
import { resetMaintenanceCache } from "../../middleware/maintenance.middleware.js";

const router = express.Router();

async function getOrCreateConfig() {
  const existing = await SystemConfig.findOne({ key: "default" });
  if (existing) return existing;
  return SystemConfig.create({ key: "default" });
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
    const { maintenanceMode } = req.body || {};

    if (maintenanceMode !== undefined && typeof maintenanceMode !== "boolean") {
      return res.status(400).json({ message: "maintenanceMode must be boolean" });
    }

    const config = await getOrCreateConfig();
    if (maintenanceMode !== undefined) config.maintenanceMode = maintenanceMode;
    await config.save();
    resetMaintenanceCache();

    return res.json({ message: "Config updated", config });
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
