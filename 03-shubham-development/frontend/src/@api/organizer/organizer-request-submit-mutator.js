import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function submitOrganizerRequestMutator(payload) {
  if (!payload) throw new Error("Request payload required");
  const res = await axiosInstance.post(ROUTES.API.ORGANIZER_REQUESTS.ROOT, payload);
  return res.data;
}
