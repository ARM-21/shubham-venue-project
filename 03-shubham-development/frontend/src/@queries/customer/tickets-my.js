import { useQuery } from "@tanstack/react-query";
import { TICKETS_MY_QUERY_KEY, ticketsMyFetcher } from "@api/customer/tickets-my-fetcher";

export function useQueryTicketsMy(params, options) {
  return useQuery({
    queryKey: [TICKETS_MY_QUERY_KEY, params],
    queryFn: async () => ticketsMyFetcher(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000,     // 5 minutes cache
    ...options,
  });
}
