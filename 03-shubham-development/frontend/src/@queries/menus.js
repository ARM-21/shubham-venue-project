import { useQuery } from "@tanstack/react-query";
import { MENUS_QUERY_KEY, menusFetcher } from "@api/menu/menus-list-fetcher";

export function useQueryMenus(options) {
  const { params, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: [MENUS_QUERY_KEY, params],
    queryFn: async () => menusFetcher(params),
    ...queryOptions,
  });
}
