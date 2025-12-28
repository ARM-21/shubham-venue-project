import User from "../../models/User.js";

export const getUserProfileService = (currentUser) => {
    return currentUser;
};

export const updateUserProfileService = async (userId, updateData) => {
    const updates = { ...updateData };
    delete updates.password;
    delete updates.role;

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
    ).select("-password");

    return updatedUser;
};
