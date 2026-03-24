import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function eventDuplicateMutator(id) {
  if (!id) throw new Error("Event ID required");
  const res = await axiosInstance.post(`${ROUTES.API.ORGANIZER.EVENT(id)}/duplicate`);
  return res.data;
}
