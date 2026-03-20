import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function hallDeleteMutator(id) {
  if (!id) throw new Error("hall id required");
  await axiosInstance.delete(ROUTES.API.ADMIN.HALL_DELETE(id));
}
