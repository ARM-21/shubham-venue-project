import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const ORGANIZER_EVENT_QUERY_KEY = "organizer-event";

export async function organizerEventDetailFetcher(id) {
  if (!id) throw new Error("Event ID required");
  const res = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENT(id));
  return res.data;
}
