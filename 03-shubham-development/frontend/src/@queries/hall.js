import { useQuery } from "@tanstack/react-query";
import { hallDetailFetcher } from "@api/hall/hall-detail-fetcher";

export function useQueryHall(id, options) {
  return useQuery({
    queryKey: ["admin-hall", id],
    queryFn: async () => hallDetailFetcher(id),
    enabled: !!id,
    ...options,
  });
}
