import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public/uploads/avatars');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    const fileName = `avatar_${req.user._id}_${Date.now()}${ext}`;
    cb(null, fileName);
  }
});

// File filter for validation
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP allowed'), false);
  }
};

// Export configured multer middleware
export const uploadAvatarMiddleware = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter
}).single('avatar'); // 'avatar' is the field name from FormData

// Service function to handle avatar upload logic
export async function processAvatarUpload(userId, file, UserModel) {
  try {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Get old avatar to delete
    const existingUser = await UserModel.findById(userId).select('profilePicture').lean();
    const oldAvatar = existingUser?.profilePicture;

    // Create new avatar URL
    const avatarUrl = `/uploads/avatars/${file.filename}`;

    // Update user profile picture
    await UserModel.findByIdAndUpdate(userId, { 
      $set: { profilePicture: avatarUrl } 
    });

    // Delete old avatar if exists
    if (oldAvatar && !oldAvatar.startsWith('http')) {
      const oldPath = path.join(process.cwd(), 'public', oldAvatar);
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      } catch (err) {
        console.warn('Failed to delete old avatar:', err.message);
      }
    }

    // Return updated user
    const user = await UserModel.findById(userId).select('-password').lean();
    return user;
  } catch (err) {
    // Clean up uploaded file on error
    if (file?.path && fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupErr) {
        console.warn('Failed to cleanup uploaded file:', cleanupErr.message);
      }
    }
    throw err;
  }
}

//  Delete avatar service
export async function deleteAvatarService(userId, UserModel) {
  try {
    const user = await UserModel.findById(userId).select('profilePicture').lean();
    
    if (!user) {
      throw new Error('User not found');
    }

    const avatarPath = user.profilePicture;

    // Don't delete Google profile pictures
    if (avatarPath && !avatarPath.startsWith('http')) {
      const fullPath = path.join(process.cwd(), 'public', avatarPath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Remove from database
    await UserModel.findByIdAndUpdate(userId, { 
      $unset: { profilePicture: 1 } 
    });

    const updatedUser = await UserModel.findById(userId).select('-password').lean();
    return updatedUser;
  } catch (err) {
    console.error('Delete avatar error:', err);
    throw err;
  }
}
