import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const REPORTS_TRANSACTIONS_QUERY_KEY = "admin-reports-transactions";

export async function reportsTransactionsFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.ADMIN.REPORTS.TRANSACTIONS, { params });
  return res.data;
}
