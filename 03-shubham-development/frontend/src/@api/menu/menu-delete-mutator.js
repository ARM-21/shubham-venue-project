import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function menuDeleteMutator(id) {
  if (!id) throw new Error("menu id required");
  await axiosInstance.delete(ROUTES.API.ADMIN.MENU_DELETE(id));
}
