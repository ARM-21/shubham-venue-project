import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const TICKETS_MY_QUERY_KEY = "tickets-my";

export async function ticketsMyFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.TICKETS.MINE, { params });
  return res.data;
}
