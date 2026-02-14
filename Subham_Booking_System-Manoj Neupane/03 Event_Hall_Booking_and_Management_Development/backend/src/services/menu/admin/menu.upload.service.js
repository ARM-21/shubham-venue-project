import generateImageUploadUrl from "../../upload/presigned.service.js";

export async function generateMenuImageUploadUrl(fileExtension, contentType) {
  const folder = process.env.AWS_S3_MENU_FOLDER || "menus";
  return generateImageUploadUrl({ folder, filePrefix: "menu", fileExtension, contentType, metadataType: "menu-image" });
}

export async function generateDishImageUploadUrl(fileExtension, contentType) {
  const folder = process.env.AWS_S3_DISH_FOLDER || "dishes";
  return generateImageUploadUrl({ folder, filePrefix: "dish", fileExtension, contentType, metadataType: "dish-image" });
}
