import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import ENV from '../../../config/env.config.js';
import generateImageUploadUrl from '../../upload/presigned.service.js';

// Initialize S3 client with credentials and region from environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Generate presigned URL for avatar upload using shared generator
export async function generatePresignedUploadUrl(userId, fileExtension, contentType) {
  try {
    const folder = process.env.AWS_S3_AVATAR_FOLDER || 'avatars';
    const filePrefix = `avatar_${userId}`;
    const data = await generateImageUploadUrl({ folder, filePrefix, fileExtension, contentType, metadataType: 'avatar' });
    return data;
  } catch (err) {
    console.error('Presigned avatar upload error:', err);
    throw err;
  }
}

// Delete file from S3
export async function deleteFromS3(fileKey) {
  try {
    if (!fileKey) return;

    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey,
    };

    const command = new DeleteObjectCommand(deleteParams);
  
    await s3Client.send(command);
    console.log(`Deleted from S3: ${fileKey}`);
  } catch (error) {
    console.error('S3 deletion error:', error);
  }
}

// Confirm upload and update user
export async function confirmAvatarUpload(userId, s3Key, publicUrl, UserModel) {
  try {
    // Get old avatar to delete
    const existingUser = await UserModel.findById(userId).select('profilePicture s3Key').lean();
    const oldS3Key = existingUser?.s3Key;

    // Update user profile picture
    await UserModel.findByIdAndUpdate(userId, {
      $set: {
        profilePicture: publicUrl,
        s3Key: s3Key,
      },
    });

    // Delete old avatar from S3 if exists
    if (oldS3Key && !existingUser?.profilePicture?.includes('googleusercontent.com')) {
      await deleteFromS3(oldS3Key);
    }

    // Return updated user
    const user = await UserModel.findById(userId).select('-password').lean();
    return user;
  } catch (err) {
    console.error('Confirm upload error:', err);
    throw err;
  }
}
