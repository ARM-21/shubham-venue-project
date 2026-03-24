import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const MENUS_PUBLIC_QUERY_KEY = "menus-public";

export async function menusPublicFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.MENUS.ROOT, { params });
  return res.data;
}
