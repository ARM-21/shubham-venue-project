import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function userDetailFetcher(id) {
  if (!id) throw new Error("user id required");
  const res = await axiosInstance.get(ROUTES.API.ADMIN.USER(id));
  return res.data;
}
