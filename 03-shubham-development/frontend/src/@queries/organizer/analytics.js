import { useQuery } from "@tanstack/react-query";
import {
  ORGANIZER_ANALYTICS_QUERY_KEY,
  organizerAnalyticsFetcher,
} from "@api/organizer/analytics-fetcher";

/**
 * Fetch organizer analytics/dashboard metrics
 */
export function useQueryOrganizerAnalytics(options) {
  return useQuery({
    queryKey: [ORGANIZER_ANALYTICS_QUERY_KEY],
    queryFn: () => organizerAnalyticsFetcher(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}
