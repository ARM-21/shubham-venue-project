import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function menuDetailFetcher(id) {
  if (!id) throw new Error("menu id required");
  const res = await axiosInstance.get(ROUTES.API.ADMIN.MENU_DETAIL(id));
  return res.data;
}
