import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function hallStatusMutator(id, payload) {
  if (!id) throw new Error("hall id required");
  await axiosInstance.patch(ROUTES.API.ADMIN.HALL_STATUS(id), payload);
}
