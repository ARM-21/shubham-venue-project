import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const ORGANIZER_STATUS_QUERY_KEY = "organizer-status";

export async function organizerStatusFetcher() {
  const res = await axiosInstance.get(ROUTES.API.ORGANIZER_REQUESTS.ME);
  return res.data;
}
