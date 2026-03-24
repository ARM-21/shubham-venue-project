import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const HALLS_PUBLIC_QUERY_KEY = "halls-public";

export async function hallsPublicFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.HALLS.ROOT, { params });
  return res.data;
}
