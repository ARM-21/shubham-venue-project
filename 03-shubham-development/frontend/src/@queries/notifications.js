import { useQuery } from "@tanstack/react-query";
import { NOTIFICATIONS_QUERY_KEY, notificationsFetcher } from "@api/notification/notifications-list-fetcher";

export function useQueryNotifications(options) {
  const { params, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, params],
    queryFn: async () => notificationsFetcher(params),
    ...queryOptions,
  });
}
