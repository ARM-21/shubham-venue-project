import { useQuery } from "@tanstack/react-query";
import { HALL_DETAIL_PUBLIC_QUERY_KEY, hallDetailPublicFetcher } from "@api/customer/hall-detail-public-fetcher";

export function useQueryHallDetailPublic(slug, options) {
  return useQuery({
    queryKey: [HALL_DETAIL_PUBLIC_QUERY_KEY, slug],
    queryFn: async () => hallDetailPublicFetcher(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes cache
    ...options,
  });
}
