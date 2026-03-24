import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const EVENTS_PUBLIC_QUERY_KEY = "events-public";

export async function eventsPublicFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.EVENTS.PUBLIC, { params });
  return res.data;
}
