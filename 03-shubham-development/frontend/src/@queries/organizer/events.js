import { useQuery } from "@tanstack/react-query";
import {
  ORGANIZER_EVENTS_QUERY_KEY,
  organizerEventsFetcher,
} from "@api/organizer/events-list-fetcher";
import {
  ORGANIZER_EVENT_QUERY_KEY,
  organizerEventDetailFetcher,
} from "@api/organizer/event-detail-fetcher";

/**
 * Fetch list of organizer events with optional filters
 */
export function useQueryOrganizerEvents(options) {
  const { params, ...queryOptions } = options ?? {};

  return useQuery({
    queryKey: [ORGANIZER_EVENTS_QUERY_KEY, params],
    queryFn: async () => organizerEventsFetcher(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    ...queryOptions,
  });
}

/**
 * Fetch single event details
 */
export function useQueryOrganizerEvent(id, options) {
  return useQuery({
    queryKey: [ORGANIZER_EVENT_QUERY_KEY, id],
    queryFn: async () => organizerEventDetailFetcher(id),
    enabled: !!id,
    staleTime: 15 * 1000, // 15 seconds
    cacheTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}
