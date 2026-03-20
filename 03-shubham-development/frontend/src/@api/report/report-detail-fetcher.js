import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function reportDetailFetcher(id) {
  if (!id) throw new Error("report id required");
  const res = await axiosInstance.get(ROUTES.API.ADMIN.REPORT_DETAIL(id));
  return res.data;
}
