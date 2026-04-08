import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const ORGANIZER_REPUTATION_QUERY_KEY = "organizer-reputation";

export async function organizerReputationFetcher() {
  // Get organizer's own trust score, metrics, flags, and recommendations
  const endpoint = ROUTES.API.ORGANIZER.REPUTATION;
  
  const res = await axiosInstance.get(endpoint);
  return res.data;
}
