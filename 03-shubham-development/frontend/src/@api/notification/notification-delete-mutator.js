import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function notificationDeleteMutator(id) {
  if (!id) throw new Error("notification id required");
  await axiosInstance.delete(ROUTES.API.ADMIN.NOTIFICATION_DELETE(id));
}
