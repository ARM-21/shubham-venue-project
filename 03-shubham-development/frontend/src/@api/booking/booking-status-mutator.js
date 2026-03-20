import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function bookingStatusMutator(id, payload) {
  if (!id) throw new Error("booking id required");
  await axiosInstance.patch(ROUTES.API.ADMIN.BOOKING_STATUS(id), payload);
}
