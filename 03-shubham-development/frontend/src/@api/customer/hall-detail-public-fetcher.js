import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const HALL_DETAIL_PUBLIC_QUERY_KEY = "hall-detail-public";

export async function hallDetailPublicFetcher(slug) {
  const res = await axiosInstance.get(ROUTES.API.HALLS.BY_SLUG(slug));
  return res.data;
}
