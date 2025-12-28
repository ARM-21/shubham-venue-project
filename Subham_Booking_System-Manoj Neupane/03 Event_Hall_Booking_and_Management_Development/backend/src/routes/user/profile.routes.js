import express from "express";
import { isAuthenticated, isAdmin } from "../../middleware/auth.middleware.js";
import User from "../../models/User.js";
import { getUserProfile, updateUserProfile } from "../../controllers/user/profile.controller.js";

const router = express.Router();


router.get("/me", isAuthenticated, getUserProfile)

router.put("/me", isAuthenticated,updateUserProfile)

router.patch("/me/password",isAuthenticated,async (req,res)=>{

})
router.delete("/me",isAuthenticated,async (req,res)=>{

})


export default router;
