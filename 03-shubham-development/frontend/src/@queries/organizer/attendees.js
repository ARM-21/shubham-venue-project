import { useQuery } from "@tanstack/react-query";
import {
  ORGANIZER_EVENT_ATTENDEES_QUERY_KEY,
  organizerEventAttendeesFetcher,
} from "@api/organizer/event-attendees-fetcher";

/**
 * Fetch attendees for a specific event
 */
export function useQueryEventAttendees(eventId, options) {
  return useQuery({
    queryKey: [ORGANIZER_EVENT_ATTENDEES_QUERY_KEY, eventId],
    queryFn: () => organizerEventAttendeesFetcher(eventId),
    enabled: !!eventId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}
