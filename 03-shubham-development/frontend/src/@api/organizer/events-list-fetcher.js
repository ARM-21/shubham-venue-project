import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const ORGANIZER_EVENTS_QUERY_KEY = "organizer-events";

export async function organizerEventsFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENTS, { params });
  return res.data;
}
