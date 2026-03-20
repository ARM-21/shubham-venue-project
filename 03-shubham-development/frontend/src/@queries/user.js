import { useQuery } from "@tanstack/react-query";
import { userDetailFetcher } from "@api/users/user-detail-fetcher";

export function useQueryUser(id, options) {
  return useQuery({
    queryKey: ["admin-user", id],
    queryFn: async () => userDetailFetcher(id),
    enabled: !!id,
    ...options,
  });
}
