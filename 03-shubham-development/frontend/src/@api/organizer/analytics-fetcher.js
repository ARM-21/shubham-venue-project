import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const ORGANIZER_ANALYTICS_QUERY_KEY = "organizer-analytics";

export async function organizerAnalyticsFetcher() {
  // Get dashboard analytics for all organizer events
  const endpoint = ROUTES.API.ORGANIZER.ANALYTICS;
    
  const res = await axiosInstance.get(endpoint);
  return res.data;
}
