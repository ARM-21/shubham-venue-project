import {
    getUserProfileService,
    updateUserProfileService
} from "../../services/user/profile.service.js";

export const getUserProfile = (req, res) => {
    const user = getUserProfileService(req.currentUser);
    res.json({ user });
};

export const updateUserProfile = async (req, res) => {
    const updatedUser = await updateUserProfileService(
        req.currentUser._id,
        req.body
    );

    res.json({
        message: "User Updated Successfully",
        user: updatedUser,
    });
};
