import { useQuery } from "@tanstack/react-query";
import { notificationDetailFetcher } from "@api/notification/notification-detail-fetcher";

export function useQueryNotification(id, options) {
  return useQuery({
    queryKey: ["admin-notification", id],
    queryFn: async () => notificationDetailFetcher(id),
    enabled: !!id,
    ...options,
  });
}
