import { useQuery } from "@tanstack/react-query";
import {
  ORGANIZER_BOOKINGS_QUERY_KEY,
  organizerBookingsFetcher,
} from "@api/organizer/bookings-list-fetcher";

/**
 * Fetch list of organizer bookings with optional filters
 */
export function useQueryOrganizerBookings(options) {
  const { params, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: [ORGANIZER_BOOKINGS_QUERY_KEY, params],
    queryFn: async () => organizerBookingsFetcher(params),
    staleTime: 15 * 1000, // 15 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
}
