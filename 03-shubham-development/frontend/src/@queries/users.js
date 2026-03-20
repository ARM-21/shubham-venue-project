import { useQuery } from "@tanstack/react-query";
import { USERS_QUERY_KEY, usersFetcher } from "@api/users/users-list-fetcher";

export function useQueryUsers(options) {
  const { params, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: async () => usersFetcher(params),
    ...queryOptions,
  });
}
