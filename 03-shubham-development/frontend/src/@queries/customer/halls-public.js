import { useQuery } from "@tanstack/react-query";
import { HALLS_PUBLIC_QUERY_KEY, hallsPublicFetcher } from "@api/customer/halls-public-fetcher";

export function useQueryHallsPublic(params, options) {
  return useQuery({
    queryKey: [HALLS_PUBLIC_QUERY_KEY, params],
    queryFn: async () => hallsPublicFetcher(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 5 * 60 * 1000,     // 5 minutes cache
    ...options,
  });
}
