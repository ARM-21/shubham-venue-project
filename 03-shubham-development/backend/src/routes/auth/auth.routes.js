import express from "express";
import { registerUserController,loginUserController, resendOTPController, verifyOTPController, logoutController, validateSessionController } from "../../controllers/auth/auth.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";

const router = express.Router();


router.post("/register",registerUserController );

router.post("/login", loginUserController);
router.post("/resend-otp", resendOTPController);
router.post("/verify-otp", verifyOTPController);

router.post("/logout",isAuthenticated,logoutController)

// Validate current session - checks if cookie session is still valid on server
// This runs on app startup and detects stale/invalid cookies
router.get("/validate-session", validateSessionController);


export default router;

