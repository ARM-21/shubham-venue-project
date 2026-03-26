import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';

export const SCANNER_QUERIES = {
  all: ['scanner-assignments'],
  event: (eventId) => [...SCANNER_QUERIES.all, 'event', eventId],
};

/**
 * Fetch assigned scanner staff for an event
 */
export function useEventScanners(eventId, options = {}) {
  return useQuery({
    queryKey: SCANNER_QUERIES.event(eventId),
    queryFn: async () => {
      const res = await axiosInstance.get(
        ROUTES.API.ADMIN.SCANNER.LIST_EVENT(eventId)
      );
      return res.data.scanners || [];
    },
    enabled: !!eventId,
    ...options,
  });
}

/**
 * Assign a user as scanner staff to an event
 */
export function useAssignScanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, userId, gate }) => {
      const res = await axiosInstance.post(
        ROUTES.API.ADMIN.SCANNER.ASSIGN(eventId),
        { userId, gate }
      );
      return res.data.assignment;
    },
    onSuccess: (assignment, { eventId }) => {
      // Invalidate the event's scanner list to refetch
      queryClient.invalidateQueries({
        queryKey: SCANNER_QUERIES.event(eventId),
      });
    },
  });
}

/**
 * Remove a scanner staff assignment from an event
 */
export function useRemoveScanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ assignmentId, eventId }) => {
      await axiosInstance.delete(
        ROUTES.API.ADMIN.SCANNER.REMOVE(assignmentId)
      );
    },
    onSuccess: (_, { eventId }) => {
      // Invalidate the event's scanner list to refetch
      queryClient.invalidateQueries({
        queryKey: SCANNER_QUERIES.event(eventId),
      });
    },
  });
}
