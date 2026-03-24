import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export const ORGANIZER_ANALYTICS_QUERY_KEY = "organizer-analytics";

export async function organizerAnalyticsFetcher(eventId) {
  // If eventId provided, get metrics for specific event
  // Otherwise get dashboard analytics
  const endpoint = eventId 
    ? `${ROUTES.API.ORGANIZER.EVENT(eventId)}/analytics`
    : ROUTES.API.ORGANIZER.EVENTS; // Getting events for analytics
    
  const res = await axiosInstance.get(endpoint);
  return res.data;
}
