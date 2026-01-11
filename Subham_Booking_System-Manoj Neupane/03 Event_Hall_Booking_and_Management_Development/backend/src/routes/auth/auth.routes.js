import express from "express";
import { registerUserController,loginUserController, resendOTPController, verifyOTPController, logoutController } from "../../controllers/auth/auth.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";

const router = express.Router();


router.post("/register",registerUserController );

router.post("/login", loginUserController);
router.post("/resend-otp", resendOTPController);
router.post("/verify-otp", verifyOTPController);

router.post("/logout",isAuthenticated,logoutController)


export default router;

