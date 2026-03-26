import { useQuery } from "@tanstack/react-query";
import {
  ORGANIZER_EVENT_ATTENDEES_QUERY_KEY,
  organizerEventAttendeesFetcher,
} from "@api/organizer/event-attendees-fetcher";

/**
 * Fetch attendees for a specific event
 * Real-time polling enabled by default during active events
 */
export function useQueryEventAttendees(eventId, options = {}) {
  const isEventActive = options.isEventActive ?? true;

  return useQuery({
    queryKey: [ORGANIZER_EVENT_ATTENDEES_QUERY_KEY, eventId],
    queryFn: () => organizerEventAttendeesFetcher(eventId),
    enabled: !!eventId,
    staleTime: isEventActive ? 8 * 1000 : 3 * 60 * 1000, // 8 sec if active, 3 min otherwise
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchInterval: isEventActive ? 12 * 1000 : false, // Auto-poll every 12 seconds during active events
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
    ...options,
  });
}
