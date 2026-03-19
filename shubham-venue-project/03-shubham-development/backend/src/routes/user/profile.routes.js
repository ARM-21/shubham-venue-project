import express from "express";
import { isAuthenticated } from "../../middleware/auth.middleware.js";
import {
  getUserProfile,
  updateUserProfile,
  changeUserPassword,
  getAvatarUploadUrl,
  confirmUserAvatarUpload,
  deleteUserAvatar,
} from "../../controllers/user/profile.controller.js";

const router = express.Router();

router.get("/me", isAuthenticated, getUserProfile);
router.put("/me", isAuthenticated, updateUserProfile);
router.patch("/me/password", isAuthenticated, changeUserPassword);

// Presigned URL flow (2 steps)
router.post("/me/avatar/upload-url", isAuthenticated, getAvatarUploadUrl);
router.post("/me/avatar/confirm", isAuthenticated, confirmUserAvatarUpload);

// Delete avatar
router.delete("/me/avatar", isAuthenticated, deleteUserAvatar);

export default router;
