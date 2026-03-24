import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const ORGANIZER_EVENT_ATTENDEES_QUERY_KEY = "organizer-event-attendees";

export async function organizerEventAttendeesFetcher(eventId) {
  if (!eventId) throw new Error("Event ID required");
  const res = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENT_ATTENDEES(eventId));
  return res.data;
}
