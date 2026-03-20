import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function userDeleteMutator(id) {
  if (!id) throw new Error("user id required");
  await axiosInstance.delete(ROUTES.API.ADMIN.USER_DELETE(id));
}
