import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const EVENT_DETAIL_PUBLIC_QUERY_KEY = "event-detail-public";

export async function eventDetailPublicFetcher(id) {
  const res = await axiosInstance.get(ROUTES.API.EVENTS.DETAIL(id));
  return res.data;
}
