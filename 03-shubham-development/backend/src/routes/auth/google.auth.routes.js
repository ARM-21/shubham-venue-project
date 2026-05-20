import express from "express";
import User from "../../models/User.js";
import { OAuth2Client } from "google-auth-library";
import  ENV  from "../../config/env.config.js";

const router = express.Router()

const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);
router.post("/login", async (req, res) => {

    try {
        // Check if token is provided
        if (!req.body.token) {
            return res.status(400).json({ message: "Google authentication token is missing. Please try again." });
        }

        const response = await client.verifyIdToken({
            idToken: req.body.token,
            audience: ENV.GOOGLE_CLIENT_ID,
        })
        const { email, fullname: fullname, picture, given_name: firstname, family_name: lastname, sub: gid } = response.getPayload();

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }


        const existingUser = await User.findOne({ email });
        if (existingUser) {
            if (existingUser.isActive === false) {
                return res.status(403).json({ message: "Account disabled" });
            }
            req.session.userId = existingUser._id;
            req.session.role = existingUser.role;
            req.session.save();
            // Single-session enforcement — invalidate any previous session
            await User.findByIdAndUpdate(existingUser._id, { currentSessionId: req.session.id });
            return res.status(200).json({
                message: "Login successful", user: {
                    id: existingUser._id,
                    email: existingUser.email,
                    role: existingUser.role,
                    first_name: existingUser.first_name,
                    last_name: existingUser.last_name,
                    username: existingUser.username,
                    profilePicture: existingUser.profilePicture,
                    isVerified: existingUser.isVerified,
                    hasCompletedOnboarding: existingUser.hasCompletedOnboarding || false,
                    isOrganizerEligible: existingUser.isOrganizerEligible || false,
                    provider: 'google'
                }
            });
        }

        const user = new User({
            first_name: firstname,
            last_name: lastname,
            email,
            provider: 'google',
            googleId: gid,
            username: firstname.slice(0, 2) + "_" + gid.slice(0, 3),
            profilePicture: picture
        });
        req.session.userId = user._id.toString();
        req.session.role = user.role;
        req.session.save();
        await user.save();
        // Single-session enforcement for new Google users
        await User.findByIdAndUpdate(user._id, { currentSessionId: req.session.id });
        res.status(201).json({
            message: `User ${user.username} created with ${email}`, user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                first_name: user.first_name,
                last_name: user.last_name,
                username: user.username,
                profilePicture: user.profilePicture,
                isVerified: user.isVerified,
                hasCompletedOnboarding: user.hasCompletedOnboarding || false,
                isOrganizerEligible: user.isOrganizerEligible || false,
                provider: 'google'
            }
        });
    } catch (err) {
        console.error("Google Login Error:", err.message);
        
        // Provide user-friendly error messages for common cases
        if (err.message && err.message.includes("data and hash arguments required")) {
            return res.status(400).json({ message: "Invalid Google authentication token. Please try logging in again." });
        }
        
        if (err.message && err.message.includes("Invalid value for: idToken")) {
            return res.status(400).json({ message: "Your Google authentication token is invalid or expired. Please try logging in again." });
        }
        
        if (err.message && err.message.includes("Token used too late")) {
            return res.status(400).json({ message: "Your login session has expired. Please try again." });
        }
        
        // General error fallback
        return res.status(500).json({ message: "Google authentication failed. Please try again later." });
    }
})


export default router;