import { useQuery } from "@tanstack/react-query";
import { EVENTS_PUBLIC_QUERY_KEY, eventsPublicFetcher } from "@api/customer/events-public-fetcher";

export function useQueryEventsPublic(params, options) {
  return useQuery({
    queryKey: [EVENTS_PUBLIC_QUERY_KEY, params],
    queryFn: async () => eventsPublicFetcher(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 5 * 60 * 1000,     // 5 minutes cache
    ...options,
  });
}
