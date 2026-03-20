import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function settingsConfigFetcher() {
  const res = await axiosInstance.get(ROUTES.API.ADMIN.SETTINGS_CONFIG);
  return res.data?.config ?? res.data;
}
