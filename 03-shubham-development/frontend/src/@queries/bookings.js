import { useQuery } from "@tanstack/react-query";
import { BOOKINGS_QUERY_KEY, bookingsFetcher } from "@api/booking/bookings-list-fetcher";

export function useQueryBookings(options) {
  const { params, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: [BOOKINGS_QUERY_KEY, params],
    queryFn: async () => bookingsFetcher(params),
    ...queryOptions,
  });
}
