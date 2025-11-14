import express from "express";
import User from "../models/User.js";
import { registerUser,loginUser } from "../controllers/authController.js";
import { isAuthenticated } from "../middleware.js";
import { logout } from "../controllers/authController.js";

const router = express.Router();


router.post("/register",registerUser );

router.post("/login", loginUser);

router.post("/logout",isAuthenticated,logout)


export default router;

