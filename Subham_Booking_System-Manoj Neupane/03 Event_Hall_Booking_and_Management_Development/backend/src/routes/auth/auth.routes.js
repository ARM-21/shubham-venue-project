import express from "express";
import { registerUser,loginUser } from "../../controllers/auth/auth.controller.js";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import { logout } from "../../controllers/auth/auth.controller.js";

const router = express.Router();


router.post("/register",registerUser );

router.post("/login", loginUser);

router.post("/logout",isAuthenticated,logout)


export default router;

