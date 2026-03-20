import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const REPORTS_SUMMARY_QUERY_KEY = "admin-reports-summary";

export async function reportsSummaryFetcher() {
  const res = await axiosInstance.get(ROUTES.API.ADMIN.REPORTS.SUMMARY);
  return res.data;
}
