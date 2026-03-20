import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function notificationStatusMutator(id, payload) {
  if (!id) throw new Error("notification id required");
  await axiosInstance.patch(ROUTES.API.ADMIN.NOTIFICATION_STATUS(id), payload);
}
