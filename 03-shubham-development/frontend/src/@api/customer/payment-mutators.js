import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function initiatePaymentMutator(payload) {
  const res = await axiosInstance.post(ROUTES.API.PAYMENTS.INITIATE, payload);
  return res.data;
}
