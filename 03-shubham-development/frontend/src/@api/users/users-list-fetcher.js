import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const USERS_QUERY_KEY = "admin-users";

export async function usersFetcher(params) {
  const res = await axiosInstance.get(ROUTES.API.ADMIN.USERS, { params });
  return res.data;
}
