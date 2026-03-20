import { useQuery } from "@tanstack/react-query";
import { REPORTS_QUERY_KEY, reportsFetcher } from "@api/reports-list-fetcher";

export function useQueryReports(options) {
  const { params, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: [REPORTS_QUERY_KEY, params],
    queryFn: async () => reportsFetcher(params),
    ...queryOptions,
  });
}
