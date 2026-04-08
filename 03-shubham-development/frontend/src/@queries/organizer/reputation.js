import { useQuery } from "@tanstack/react-query";
import {
  ORGANIZER_REPUTATION_QUERY_KEY,
  organizerReputationFetcher,
} from "@api/organizer/organizer-reputation-fetcher";

/**
 * Fetch organizer's own reputation dashboard (trust score, flags, recommendations)
 */
export function useQueryOrganizerReputation(options) {
  return useQuery({
    queryKey: [ORGANIZER_REPUTATION_QUERY_KEY],
    queryFn: organizerReputationFetcher,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}
