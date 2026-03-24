import { useQuery } from "@tanstack/react-query";
import { AVAILABILITY_QUERY_KEY, availabilityFetcher } from "@api/customer/availability-fetcher";

export function useQueryAvailability(params, options) {
  return useQuery({
    queryKey: [AVAILABILITY_QUERY_KEY, params],
    queryFn: async () => availabilityFetcher(params),
    staleTime: 2 * 60 * 1000, // 2 minutes - availability changes frequently
    gcTime: 5 * 60 * 1000,     // 5 minutes cache
    ...options,
  });
}
