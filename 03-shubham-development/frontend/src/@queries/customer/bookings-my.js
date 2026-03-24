import { useQuery } from "@tanstack/react-query";
import { BOOKINGS_MY_QUERY_KEY, bookingsMyFetcher } from "@api/customer/bookings-my-fetcher";

export function useQueryBookingsMy(params, options) {
  return useQuery({
    queryKey: [BOOKINGS_MY_QUERY_KEY, params],
    queryFn: async () => bookingsMyFetcher(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000,     // 5 minutes cache
    ...options,
  });
}
