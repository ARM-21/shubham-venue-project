import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function notificationDetailFetcher(id) {
  if (!id) throw new Error("notification id required");
  const res = await axiosInstance.get(ROUTES.API.ADMIN.NOTIFICATION_DETAIL(id));
  return res.data;
}
