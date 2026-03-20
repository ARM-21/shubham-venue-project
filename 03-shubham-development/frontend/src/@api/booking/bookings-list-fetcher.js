import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const BOOKINGS_QUERY_KEY = "admin-bookings";

export async function bookingsFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.ADMIN.BOOKINGS, { params });
  return res.data;
}
