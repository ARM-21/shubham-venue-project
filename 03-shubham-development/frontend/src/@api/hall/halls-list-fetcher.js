import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const HALLS_QUERY_KEY = "admin-halls";

export async function hallsFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.ADMIN.HALLS, { params });
  return res.data;
}
