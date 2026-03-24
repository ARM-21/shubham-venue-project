import {
  getUserProfileService,
  updateUserProfileService,
  changeUserPasswordService,
} from "../../services/user/profile.service.js";
import {
  generatePresignedUploadUrl,
  confirmAvatarUpload,
  deleteFromS3
} from '../../services/user/upload/s3.presigned.service.js';
import User from '../../models/User.js';

/**
 * GET /api/v1/profile/me
 * Get current user's profile
 */
export async function getUserProfile(req, res) {
  try {
    // Use consistent property (req.currentUser)
    const userId = req.currentUser?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const user = await getUserProfileService(userId);

    return res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (err.message === "UNAUTHORIZED") {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    console.error("getUserProfile error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
}

/**
 * PUT /api/v1/profile/me
 * Update user profile
 */
export async function updateUserProfile(req, res) {
  try {
    const userId = req.currentUser?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Validate input (support both camelCase and snake_case)
    const { 
      first_name, last_name, firstName, lastName, phone, city, preferredEventTypes, hasCompletedOnboarding,
      // Organizer details (nested)
      organizerDetails
    } = req.body;
    
    const fname = first_name || firstName;
    const lname = last_name || lastName;

    // Only require name if explicitly being updated (not just organizer details)
    if ((fname || lname) && (!fname || !lname)) {
      return res.status(400).json({
        success: false,
        message: 'Both first name and last name are required when updating name',
      });
    }

    if (fname && fname.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'First name must be at least 2 characters',
      });
    }

    if (lname && lname.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Last name must be at least 2 characters',
      });
    }

    if (phone && !/^[0-9\-\s+()]{10,15}$/.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be valid (10-15 digits)',
      });
    }

    if (city && typeof city !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'City must be a valid string',
      });
    }

    if (preferredEventTypes && !Array.isArray(preferredEventTypes)) {
      return res.status(400).json({
        success: false,
        message: 'Preferred event types must be an array',
      });
    }

    // Get current user to check eligibility
    const user = await User.findById(req.currentUser._id);
    
    // Validate organizer details if provided
    if (organizerDetails) {
      if (!user.isOrganizerEligible) {
        return res.status(403).json({
          success: false,
          message: 'Only eligible organizers can set organizer details',
        });
      }

      // Validate organizer fields
      if (organizerDetails.bankAccount && !/^[0-9]{8,17}$/.test(String(organizerDetails.bankAccount))) {
        return res.status(400).json({
          success: false,
          message: 'Bank account must be 8-17 digits',
        });
      }

      if (organizerDetails.taxId && typeof organizerDetails.taxId !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Tax ID must be a valid string',
        });
      }

      if (organizerDetails.accountHolder && typeof organizerDetails.accountHolder !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Account holder must be a valid string',
        });
      }
    }

    // Build update data
    const updateData = {
      // Only include name fields if provided
      ...(fname && { first_name: fname, firstName: fname }),
      ...(lname && { last_name: lname, lastName: lname }),
      ...(phone && { phone }),
      ...(city && { city }),
      ...(preferredEventTypes && { preferredEventTypes }),
      ...(typeof hasCompletedOnboarding === 'boolean' && { hasCompletedOnboarding }),
      // Organizer details (only if eligible)
      ...(user.isOrganizerEligible && organizerDetails ? { 
        organizerDetails: {
          // Preserve existing values and merge with new ones
          ...user.organizerDetails,
          // Update with new values only if provided
          ...(organizerDetails.taxId !== undefined && { taxId: organizerDetails.taxId ? String(organizerDetails.taxId).trim() : undefined }),
          ...(organizerDetails.bankCode !== undefined && { bankCode: organizerDetails.bankCode ? String(organizerDetails.bankCode).trim() : undefined }),
          ...(organizerDetails.bankAccount !== undefined && { bankAccount: organizerDetails.bankAccount ? String(organizerDetails.bankAccount).trim() : undefined }),
          ...(organizerDetails.accountHolder !== undefined && { accountHolder: organizerDetails.accountHolder ? String(organizerDetails.accountHolder).trim() : undefined }),
          ...(typeof organizerDetails.notificationsEmail === 'boolean' && { notificationsEmail: organizerDetails.notificationsEmail }),
          ...(typeof organizerDetails.notificationsSms === 'boolean' && { notificationsSms: organizerDetails.notificationsSms }),
          ...(typeof organizerDetails.notificationsEventUpdates === 'boolean' && { notificationsEventUpdates: organizerDetails.notificationsEventUpdates })
        }
      } : (!user.isOrganizerEligible ? { organizerDetails: undefined } : {}))
    };

    const updatedUser = await updateUserProfileService(userId, updateData);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("updateUserProfile error:", err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Server error"
    });
  }
}

/**
 * PATCH /api/v1/profile/me/password
 * Change user password
 */
export async function changeUserPassword(req, res) {
  try {
    const userId = req.currentUser?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters',
      });
    }

    // Password strength validation
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain uppercase, lowercase, and number',
      });
    }

    await changeUserPasswordService(userId, currentPassword, newPassword);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Failed to change password'
    });
  }
}

/**
 * POST /api/v1/profile/me/avatar/upload-url
 * Get presigned URL for avatar upload
 */
export async function getAvatarUploadUrl(req, res) {                                                                                                                                                                                
  try {
    const userId = req.currentUser?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const { fileExtension, contentType } = req.body;

    if (!fileExtension || !contentType) {
      return res.status(400).json({
        success: false,
        message: 'File extension and content type are required',
      });
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPG, PNG, GIF, and WEBP allowed',
      });
    }

    // Validate extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file extension',
      });
    }

    const urlData = await generatePresignedUploadUrl(
      userId,
      fileExtension,
      contentType
    );

    return res.status(200).json({
      success: true,
      data: urlData,
    });
  } catch (err) {
    console.error('Get upload URL error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to generate upload URL',
    });
  }
}
                        
/**
 * POST /api/v1/profile/me/avatar/confirm
 * Confirm avatar upload after S3 upload
 */
export async function confirmUserAvatarUpload(req, res) {
  try {
    const userId = req.currentUser?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    const { s3Key, publicUrl } = req.body;

    if (!s3Key || !publicUrl) {
      return res.status(400).json({
        success: false,
        message: 'S3 key and public URL are required',
      });
    }

    // Validate URLs
    if (!publicUrl.startsWith('https://')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid public URL',
      });
    }

    const user = await confirmAvatarUpload(userId, s3Key, publicUrl, User);

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      user,
    });
  } catch (err) {
    console.error('Confirm avatar upload error:', err);
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to confirm upload',
    });
  }
}

/**
 * DELETE /api/v1/profile/me/avatar
 * Delete user's avatar
 */
export async function deleteUserAvatar(req, res) {
  try {
    const userId = req.currentUser?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }

    // Get user with avatar info
    const user = await User.findById(userId)
      .select('profilePicture s3Key provider')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if user has an avatar
    if (!user.profilePicture) {
      return res.status(400).json({
        success: false,
        message: 'No avatar to delete',
      });
    }

    // Don't delete Google profile pictures
    const isGoogleAvatar = user.profilePicture.includes('googleusercontent.com');

    if (isGoogleAvatar) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete Google profile picture. Upload a custom avatar to replace it.',
      });
    }

    // Delete from S3 if it's an S3 file
    if (user.s3Key) {
      try {
        await deleteFromS3(user.s3Key);
      } catch (s3Error) {
        console.error('S3 deletion error:', s3Error);
        // Continue even if S3 deletion fails
      }
    }

    // Remove avatar from database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $unset: { profilePicture: 1, s3Key: 1 },
      },
      { new: true }
    ).select('-password').lean();

    return res.status(200).json({
      success: true,
      message: 'Avatar deleted successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error('Delete avatar error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete avatar',
    });
  }
}
