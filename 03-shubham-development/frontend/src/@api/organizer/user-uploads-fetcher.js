import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const USER_UPLOADS_QUERY_KEY = "user-uploads";

export async function userUploadsFetcher(type = "banner") {
  if (!type) throw new Error("Upload type required");
  
  const res = await axiosInstance.get("/api/v1/profile/uploads", {
    params: { type },
  });
  
  return res.data?.uploads || [];
}
