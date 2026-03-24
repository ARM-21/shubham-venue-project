import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function initiateTicketMutator(payload) {
  const res = await axiosInstance.post(ROUTES.API.TICKETS.INITIATE, payload);
  return res.data;
}

export async function verifyTicketMutator(payload) {
  const res = await axiosInstance.post(ROUTES.API.TICKETS.VERIFY, payload);
  return res.data;
}
