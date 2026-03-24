import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const AVAILABILITY_QUERY_KEY = "halls-availability";

export async function availabilityFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.HALLS.AVAILABILITY, { params });
  return res.data;
}
