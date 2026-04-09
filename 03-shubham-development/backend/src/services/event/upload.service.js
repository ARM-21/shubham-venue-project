import generateImageUploadUrl from "../upload/presigned.service.js";

export async function generateEventBannerUploadUrl(fileExtension, contentType) {
  const folder = process.env.AWS_S3_EVENT_FOLDER || "events";
  return generateImageUploadUrl({ 
    folder, 
    filePrefix: "event-banner", 
    fileExtension, 
    contentType, 
    metadataType: "event-banner" 
  });
}
