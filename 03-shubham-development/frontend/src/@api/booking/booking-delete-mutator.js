import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function bookingDeleteMutator(id) {
  if (!id) throw new Error("booking id required");
  await axiosInstance.delete(ROUTES.API.ADMIN.BOOKING_DELETE(id));
}
