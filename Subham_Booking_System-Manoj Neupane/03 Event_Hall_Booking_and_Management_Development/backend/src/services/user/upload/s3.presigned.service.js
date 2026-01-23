import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import  ENV from '../../../config/env.config.js';
import crypto from 'crypto';
import path from 'path';

const s3Client = new S3Client({
  region: ENV.AWS_REGION,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  },
});

// Generate presigned URL for upload
export async function generatePresignedUploadUrl(userId, fileExtension, contentType) {
  try {
    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      throw new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP allowed');
    }

    // Generate unique filename
    const randomString = crypto.randomBytes(16).toString('hex');
    const fileName = `avatar_${userId}_${Date.now()}_${randomString}${fileExtension}`;
    const key = `${ENV.AWS_S3_AVATAR_FOLDER}/${fileName}`;

    // Create upload command with conditions

    console.log(ENV.AWS_S3_BUCKET_NAME, ENV.AWS_REGION, ENV.AWS_S3_AVATAR_FOLDER, ENV.AWS_ACCESS_KEY_ID);
    const command = new PutObjectCommand({
      Bucket: ENV.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      // Metadata for tracking
      Metadata: {
        userId: userId.toString(),
        uploadedAt: new Date().toISOString(),
      },
    });

    // Generate presigned URL (valid for 5 minutes)
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300, // 5 minutes
    });

    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
      uploadUrl: presignedUrl,
      publicUrl: publicUrl,
      key: key,
      expiresIn: 300,
    };
  } catch (error) {
    console.error('Presigned URL generation error:', error);
    throw new Error('Failed to generate upload URL');
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
