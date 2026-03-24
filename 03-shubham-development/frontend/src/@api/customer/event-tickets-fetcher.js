import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const EVENT_TICKETS_QUERY_KEY = "event-tickets";

export async function eventTicketsFetcher(eventId, params) {
  const res = await axiosInstance.get(ROUTES.API.EVENTS.TICKETS(eventId), { params });
  return res.data;
}
