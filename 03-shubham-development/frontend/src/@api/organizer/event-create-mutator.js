import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function eventCreateMutator(eventData) {
  if (!eventData) throw new Error("Event data required");
  const res = await axiosInstance.post(ROUTES.API.ORGANIZER.EVENTS, eventData);
  return res.data;
}
