import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function reportStatusMutator(id, payload) {
  if (!id) throw new Error("report id required");
  await axiosInstance.patch(ROUTES.API.ADMIN.REPORT_STATUS(id), payload);
}
