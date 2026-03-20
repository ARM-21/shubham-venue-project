import fs from 'fs';
import path from 'path';
import multer from 'multer';
import User from '../../models/User.js';

// Get current user's profile
export async function getUserProfileService(userId) {
  if (!userId) throw new Error("UNAUTHORIZED");

  const user = await User.findById(userId).select("-password -__v");
  if (!user) throw new Error("NOT_FOUND");
  return user;
}

// Update profile fields (name, phone, other safe fields)
export async function updateUserProfileService(userId, data) {
  try {
    const { name, phone } = data;
    const allowed = {};
    if (name) allowed.name = name;
    if (phone) allowed.phone = phone;
    const user = await User.findByIdAndUpdate(userId, { $set: allowed }, { new: true }).select('-password').lean();
    return user ;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Change password: requires currentPassword and newPassword
export async function changeUserPasswordService(userId, currentPassword, newPassword) {
  try {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new Error("User not found");

    const match = await user.comparePassword(currentPassword, user.password);
    if (!match) throw new Error("Current password is incorrect");
    user.password = newPassword
    await user.save();
    return { message: 'Password updated' };
  } catch (err) {
    console.error(err);
    throw err;
  }
}

// Upload avatar (expects multer middleware to populate req.file)


// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(import.meta.dirname, '../../public/uploads/avatars');
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname) || '.jpg';
//     const fileName = `avatar_${req.user._id}_${Date.now()}${ext}`;
//     cb(null, fileName);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
//   if (allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP allowed'), false);
//   }
// };

// export const uploadAvatar = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
//   fileFilter
// });
