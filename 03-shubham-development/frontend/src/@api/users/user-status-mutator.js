import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function userStatusMutator(id, payload) {
  if (!id) throw new Error("user id required");
  await axiosInstance.patch(ROUTES.API.ADMIN.USER_STATUS(id), payload);
}
