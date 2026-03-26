import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const SCANNER_ASSIGNMENT_QUERY_KEY = "scanner-assignments";

export async function scannerAssignmentListFetcher(eventId) {
  if (!eventId) throw new Error("Event ID required");
  const res = await axiosInstance.get(ROUTES.API.ADMIN.SCANNER.LIST_EVENT(eventId));
  return res.data;
}
