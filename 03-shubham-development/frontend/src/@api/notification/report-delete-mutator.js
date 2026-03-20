import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function reportDeleteMutator(id) {
  if (!id) throw new Error("report id required");
  await axiosInstance.delete(ROUTES.API.ADMIN.REPORT_DELETE(id));
}
