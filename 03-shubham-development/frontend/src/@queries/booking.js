import { useQuery } from "@tanstack/react-query";
import { bookingDetailFetcher } from "@api/booking/booking-detail-fetcher";

export function useQueryBooking(id, options) {
  return useQuery({
    queryKey: ["admin-booking", id],
    queryFn: async () => bookingDetailFetcher(id),
    enabled: !!id,
    ...options,
  });
}
