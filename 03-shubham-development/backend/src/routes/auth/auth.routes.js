import express from "express";
import { registerUserController, loginUserController, resendOTPController, verifyOTPController, logoutController, validateSessionController, forgotPasswordController, resetPasswordController } from "../../controllers/auth/auth.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { authLimiter, passwordResetLimiter } from "../../config/rateLimit.config.js";

const router = express.Router();

router.post("/register", authLimiter, registerUserController);
router.post("/login", authLimiter, loginUserController);
router.post("/resend-otp", authLimiter, resendOTPController);
router.post("/verify-otp", authLimiter, verifyOTPController);
router.post("/logout", isAuthenticated, logoutController);
router.get("/validate-session", validateSessionController);

// Forgot / reset password — 3 attempts per hour (passwordResetLimiter already defined)
router.post("/forgot-password", passwordResetLimiter, forgotPasswordController);
router.post("/reset-password", passwordResetLimiter, resetPasswordController);

export default router;

