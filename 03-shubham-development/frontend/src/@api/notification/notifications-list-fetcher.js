import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const NOTIFICATIONS_QUERY_KEY = "admin-notifications";

export async function notificationsFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.ADMIN.NOTIFICATIONS, { params });
  return res.data;
}
