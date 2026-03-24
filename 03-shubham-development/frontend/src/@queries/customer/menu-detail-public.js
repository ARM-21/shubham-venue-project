import { useQuery } from "@tanstack/react-query";
import { MENU_DETAIL_PUBLIC_QUERY_KEY, menuDetailPublicFetcher } from "@api/customer/menu-detail-public-fetcher";

export function useQueryMenuDetailPublic(slug, options) {
  return useQuery({
    queryKey: [MENU_DETAIL_PUBLIC_QUERY_KEY, slug],
    queryFn: async () => menuDetailPublicFetcher(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes cache
    ...options,
  });
}
