import express from "express";
import { registerUserController,loginUserController, resendOTPController, verifyOTPController, logoutController, validateSessionController } from "../../controllers/auth/auth.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { authLimiter } from "../../config/rateLimit.config.js";

const router = express.Router();

// Apply strict rate limiting to auth endpoints
router.post("/register", authLimiter, registerUserController);

router.post("/login", authLimiter, loginUserController);
router.post("/resend-otp", authLimiter, resendOTPController);
router.post("/verify-otp", authLimiter, verifyOTPController);

router.post("/logout", isAuthenticated, logoutController);

// Validate current session - checks if cookie session is still valid on server
// This runs on app startup and detects stale/invalid cookies
router.get("/validate-session", validateSessionController);

export default router;

