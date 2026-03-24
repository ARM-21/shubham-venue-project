import { useQuery } from "@tanstack/react-query";
import { EVENT_DETAIL_PUBLIC_QUERY_KEY, eventDetailPublicFetcher } from "@api/customer/event-detail-public-fetcher";

export function useQueryEventDetailPublic(eventId, options) {
  return useQuery({
    queryKey: [EVENT_DETAIL_PUBLIC_QUERY_KEY, eventId],
    queryFn: async () => eventDetailPublicFetcher(eventId),
    enabled: !!eventId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes cache
    ...options,
  });
}
