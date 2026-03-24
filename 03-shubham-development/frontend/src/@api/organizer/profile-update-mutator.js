import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function profileUpdateMutator(updateData) {
  if (!updateData) throw new Error("Update data required");
  const res = await axiosInstance.patch(ROUTES.API.PROFILE.UPDATE, updateData);
  return res.data;
}
