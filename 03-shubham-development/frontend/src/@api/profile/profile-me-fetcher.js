import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function profileMeFetcher() {
  const res = await axiosInstance.get(ROUTES.API.PROFILE.ME);
  return res.data;
}
