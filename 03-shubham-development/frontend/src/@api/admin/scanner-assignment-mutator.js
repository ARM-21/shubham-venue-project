import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export async function assignScannerMutator(eventId, data) {
  if (!eventId) throw new Error("Event ID required");
  const res = await axiosInstance.post(ROUTES.API.ADMIN.SCANNER.ASSIGN(eventId), data);
  return res.data;
}

export async function removeScannerMutator(assignmentId) {
  if (!assignmentId) throw new Error("Assignment ID required");
  const res = await axiosInstance.delete(ROUTES.API.ADMIN.SCANNER.REMOVE(assignmentId));
  return res.data;
}
