import { useQuery } from "@tanstack/react-query";
import { EVENT_TICKETS_QUERY_KEY, eventTicketsFetcher } from "@api/customer/event-tickets-fetcher";

export function useQueryEventTickets(eventId, params, options) {
  return useQuery({
    queryKey: [EVENT_TICKETS_QUERY_KEY, eventId, params],
    queryFn: async () => eventTicketsFetcher(eventId, params),
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 5 * 60 * 1000,     // 5 minutes cache
    ...options,
  });
}
