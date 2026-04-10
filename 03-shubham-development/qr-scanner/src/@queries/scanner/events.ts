import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { eventsFetcher, EventsResponse } from '@/@api/scanner/events-fetcher';

export const EVENTS_QUERY_KEY = ['scanner', 'events'] as const;

/**
 * Hook to fetch assigned scanner events
 * Automatically manages caching, refetching, and loading states
 */
export function useQueryScannerEvents(
  options?: Omit<UseQueryOptions<EventsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: EVENTS_QUERY_KEY,
    queryFn: eventsFetcher,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection time)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...options,
  });
}

/**
 * Get events data with default empty array
 */
export function useScannerEvents(
  options?: Omit<UseQueryOptions<EventsResponse, Error>, 'queryKey' | 'queryFn'>
) {
  const query = useQueryScannerEvents(options);
  return {
    ...query,
    data: query.data?.events || [],
  };
}
