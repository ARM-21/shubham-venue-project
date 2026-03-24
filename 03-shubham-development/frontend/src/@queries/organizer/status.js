import { useQuery } from "@tanstack/react-query";
import {
  ORGANIZER_STATUS_QUERY_KEY,
  organizerStatusFetcher,
} from "@api/organizer/organizer-status-fetcher";

/**
 * Fetch organizer status (verification status, approval, etc.)
 */
export function useQueryOrganizerStatus(options) {
  return useQuery({
    queryKey: [ORGANIZER_STATUS_QUERY_KEY],
    queryFn: organizerStatusFetcher,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}
