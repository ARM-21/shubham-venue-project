import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function hallDetailFetcher(id) {
  if (!id) throw new Error("hall id required");
  const res = await axiosInstance.get(ROUTES.API.ADMIN.HALL(id));
  // API returns { message, hall }
  return res.data?.hall ?? res.data;
}
