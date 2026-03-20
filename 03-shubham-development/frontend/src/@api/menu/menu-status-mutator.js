import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function menuStatusMutator(id, payload) {
  if (!id) throw new Error("menu id required");
  await axiosInstance.patch(ROUTES.API.ADMIN.MENU_STATUS(id), payload);
}
