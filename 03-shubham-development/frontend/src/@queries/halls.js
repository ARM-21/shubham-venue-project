import { useQuery } from "@tanstack/react-query";
import { HALLS_QUERY_KEY, hallsFetcher } from "@api/hall/halls-list-fetcher";

export function useQueryHalls(options) {
  const { params, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: [HALLS_QUERY_KEY, params],
    queryFn: async () => hallsFetcher(params),
    ...queryOptions,
  });
}
