import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const MENUS_QUERY_KEY = "admin-menus";

export async function menusFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.ADMIN.MENUS, { params });
  return res.data;
}
