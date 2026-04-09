import { useQuery } from "@tanstack/react-query";
import {
  ORGANIZER_ANALYTICS_QUERY_KEY,
  organizerAnalyticsFetcher,
} from "@api/organizer/analytics-fetcher";

/**
 * Fetch organizer analytics/dashboard metrics
 * Now includes real-time polling for active events
 */
export function useQueryOrganizerAnalytics(options = {}) {
  // Check if event is active (optional - can be passed via options)
  const isEventActive = options.isEventActive ?? true;

  return useQuery({
    queryKey: [ORGANIZER_ANALYTICS_QUERY_KEY],
    queryFn: () => organizerAnalyticsFetcher(),
    staleTime: isEventActive ? 10 * 1000 : 2 * 60 * 1000, // 10 sec if active, 2 min otherwise
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchInterval: isEventActive ? 15 * 1000 : false, // Auto-poll every 15 seconds during active events
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    ...options,
  });
}
