import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function eventUpdateMutator({ id, eventData }) {
  if (!id || !eventData) throw new Error("Event ID and data required");
  const res = await axiosInstance.patch(ROUTES.API.ORGANIZER.EVENT(id), eventData);
  return res.data;
}
