import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const BOOKINGS_MY_QUERY_KEY = "bookings-my";

export async function bookingsMyFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.BOOKINGS.MINE, { params });
  return res.data;
}
