import express from "express";
import {
  registerPushToken,
  unregisterPushToken,
  getPushTokens,
  sendTestNotification,
} from "../../controllers/notification/notification.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { isAdmin } from "../../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticated);

// Register push token
router.post("/register-push-token", registerPushToken);

// Unregister push token
router.post("/unregister-push-token", unregisterPushToken);

// Get user's push tokens
router.get("/push-tokens", getPushTokens);

// Send test notification (admin only)
router.post("/send-test", isAdmin, sendTestNotification);

export default router;
