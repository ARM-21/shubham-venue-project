import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const REPORTS_QUERY_KEY = "admin-reports";

export async function reportsFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.ADMIN.REPORTS, { params });
  return res.data;
}
