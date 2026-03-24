import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const MENU_DETAIL_PUBLIC_QUERY_KEY = "menu-detail-public";

export async function menuDetailPublicFetcher(slug) {
  const res = await axiosInstance.get(ROUTES.API.MENUS.BY_SLUG(slug));
  return res.data;
}
