import { useQuery } from "@tanstack/react-query";
import { MENUS_PUBLIC_QUERY_KEY, menusPublicFetcher } from "@api/customer/menus-public-fetcher";

export function useQueryMenusPublic(params, options) {
  return useQuery({
    queryKey: [MENUS_PUBLIC_QUERY_KEY, params],
    queryFn: async () => menusPublicFetcher(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000,     // 10 minutes cache
    ...options,
  });
}
