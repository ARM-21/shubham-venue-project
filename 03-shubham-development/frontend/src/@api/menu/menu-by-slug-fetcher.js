import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function menuBySlugFetcher(slug) {
  if (!slug) throw new Error("menu slug required");
  const res = await axiosInstance.get(ROUTES.API.MENUS.BY_SLUG(encodeURIComponent(slug)));
  return res.data;
}
