import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function bookingDetailFetcher(id) {
  if (!id) throw new Error("booking id required");
  const res = await axiosInstance.get(ROUTES.API.ADMIN.BOOKING_DETAIL(id));
  return res.data;
}
