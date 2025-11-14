import express from "express";
import { isAuthenticated, isAdmin } from "../middleware.js";
import User from "../models/User.js";

const router = express.Router();


router.get("/me", isAuthenticated, (req, res) => {
    res.json({ user: req.currentUser })
})

router.put("/me", isAuthenticated, async (req, res) => {
    const updates = { ...req.body };
    delete updates.password;
    delete updates.role;
    const updated = await User.findByIdAndUpdate(req.currentUser._id, updates, { new: true, runValidators: true }).select("-password");
    res.json({ message: "User Updated Successfully", user: updated, })
})

router.patch("/me/password",isAuthenticated,async (req,res)=>{

})
router.delete("/me",isAuthenticated,async (req,res)=>{

})


export default router;
//admin routes will be added later on