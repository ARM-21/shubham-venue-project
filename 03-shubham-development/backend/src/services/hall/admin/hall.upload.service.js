import generateImageUploadUrl from "../../upload/presigned.service.js";

export async function generateHallImageUploadUrl(fileExtension, contentType) {
  const folder = process.env.AWS_S3_HALL_FOLDER || "halls";
  return generateImageUploadUrl({ folder, filePrefix: "hall", fileExtension, contentType, metadataType: "hall-image" });
}
