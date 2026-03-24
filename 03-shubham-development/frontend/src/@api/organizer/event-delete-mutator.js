import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function eventDeleteMutator(id) {
  if (!id) throw new Error("Event ID required");
  await axiosInstance.delete(ROUTES.API.ORGANIZER.EVENT(id));
}
