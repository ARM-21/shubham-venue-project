import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import ENV from "../../config/env.config.js";

const s3Client = new S3Client({
  region: ENV.AWS_REGION,
  credentials: {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  },
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

export async function generateImageUploadUrl({ folder = "uploads", filePrefix = "file", fileExtension, contentType, metadataType = "image" }) {
  if (!contentType || !fileExtension) throw new Error("fileExtension and contentType are required");
  if (!ALLOWED_TYPES.includes(contentType)) throw new Error("Invalid file type. Only JPG, PNG, GIF, and WEBP allowed");
  if (!ALLOWED_EXT.includes((fileExtension || "").toLowerCase())) throw new Error("Invalid file extension");

  const randomString = crypto.randomBytes(12).toString("hex");
  const fileName = `${filePrefix}_${Date.now()}_${randomString}${fileExtension}`;
  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: ENV.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Metadata: { uploadedAt: new Date().toISOString(), type: metadataType },
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  const publicUrl = `https://${ENV.AWS_S3_BUCKET_NAME}.s3.${ENV.AWS_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl, key, expiresIn: 300 };
}

export default generateImageUploadUrl;
