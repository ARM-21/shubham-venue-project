import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const ORGANIZER_BOOKINGS_QUERY_KEY = "organizer-bookings";

export async function organizerBookingsFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.ORGANIZER.BOOKINGS, { params });
  return res.data;
}
