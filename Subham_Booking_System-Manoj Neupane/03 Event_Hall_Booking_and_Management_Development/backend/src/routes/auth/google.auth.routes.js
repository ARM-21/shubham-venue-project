import express from "express";
import User from "../../models/User.js";
import { OAuth2Client } from "google-auth-library";
import { ENV } from "../../config/env.js";

const router = express.Router()

const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);
router.post("/login", async (req, res) => {

    try {

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
            if (req.session.userId != existingUser._id) {
                console.log("user is not connected.. connecting to a session")
                req.session.userId = existingUser._id;
                req.session.role = existingUser.role;
                req.session.save()
            }
            return res.status(200).json({
                message: "Login successful", user: {
                    id: existingUser._id,
                    email: existingUser.email,
                    role: existingUser.role,
                    firstname: existingUser.first_name,
                    lastname: existingUser.last_name,
                    username: existingUser.username,
                    profilePicture: existingUser.profilePicture
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
        req.session.save()
        await user.save();
        res.status(201).json({
            message: `User ${user.username} created with ${email}`, user: {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                firstname: user.first_name,
                lastname: user.last_name,
                username: user.username,
                profilePicture: user.profilePicture

            }
        });
    } catch (err) {
        console.error("Registration Error:", err.errorResponse.errInfo.details);
        return res.status(500).json({ message: "Error Occurred! Try Again Later" });
    }
})


export default router;