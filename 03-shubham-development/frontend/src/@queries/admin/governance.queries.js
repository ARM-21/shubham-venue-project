import { useQuery } from '@tanstack/react-query';
import {
  fetchFlags,
  fetchFlagDashboard,
  fetchFlagDetail,
} from '@api/governance/flags-api';
import {
  fetchOrganizers,
  fetchOrganizerReputation,
  fetchOrganizerAuditTrail,
} from '@api/governance/organizers-api';
import {
  fetchOrganizerEvents,
  fetchOrganizerEventDetail,
} from '@api/governance/organizer-events-api';
import {
  fetchAuditLogs,
} from '@api/governance/audit-logs-api';
import {
  fetchSuspensionStats,
} from '@api/governance/stats-api';

/**
 * Get all flags with filters and pagination
 */
export const useQueryFlags = (options = {}) => {
  const { status, severity, eventId, organizerId, page = 1, limit = 20 } = options;

  return useQuery({
    queryKey: ['flags', status, severity, eventId, organizerId, page, limit],
    queryFn: () => fetchFlags({ status: status || 'open', severity, eventId, organizerId, page, limit }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get flag details with investigation thread
 */
export const useQueryFlagDetail = (flagId) => {
  return useQuery({
    queryKey: ['flag', flagId],
    queryFn: () => fetchFlagDetail(flagId),
    enabled: !!flagId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Get flag dashboard stats
 */
export const useQueryFlagDashboard = () => {
  return useQuery({
    queryKey: ['flagDashboard'],
    queryFn: () => fetchFlagDashboard(),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
};

/**
 * Get all organizer events for review
 */
export const useQueryOrganizerEventsReview = (options = {}) => {
  const { status, page = 1, limit = 20 } = options;

  return useQuery({
    queryKey: ['organizerEventsReview', status, page, limit],
    queryFn: () => fetchOrganizerEvents({ status, page, limit }),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get pending review events only
 */
export const useQueryPendingReviewEvents = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['pendingReviewEvents', page, limit],
    queryFn: () => fetchOrganizerEvents({ status: 'pending', page, limit }),
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get organizer event details
 */
export const useQueryOrganizerEventDetail = (eventId) => {
  return useQuery({
    queryKey: ['organizerEventDetail', eventId],
    queryFn: () => fetchOrganizerEventDetail(eventId),
    enabled: !!eventId,
  });
};

/**
 * Get all organizers with reputation scores
 */
export const useQueryOrganizersReputation = (options = {}) => {
  const { suspended, hasFlags, page = 1, limit = 20 } = options;

  return useQuery({
    queryKey: ['organizersReputation', suspended, hasFlags, page, limit],
    queryFn: () => fetchOrganizers({ suspended, hasFlags, page, limit }),
    staleTime: 3 * 60 * 1000,
  });
};

/**
 * Get organizer reputation dashboard
 */
export const useQueryOrganizerReputation = (organizerId) => {
  return useQuery({
    queryKey: ['organizerReputation', organizerId],
    queryFn: () => fetchOrganizerReputation(organizerId),
    enabled: !!organizerId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get organizer's audit trail
 */
export const useQueryOrganizerAuditTrail = (organizerId, page = 1) => {
  return useQuery({
    queryKey: ['organizerAuditTrail', organizerId, page],
    queryFn: () => fetchOrganizerAuditTrail(organizerId),
    enabled: !!organizerId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get suspension statistics
 */
export const useQuerySuspensionStats = () => {
  return useQuery({
    queryKey: ['suspensionStats'],
    queryFn: () => fetchSuspensionStats(),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get audit logs for admin
 */
export const useQueryAuditLogs = (options = {}) => {
  const { page = 1, search = '', entityType = 'all', action = 'all', dateRange = 'all' } = options;

  return useQuery({
    queryKey: ['auditLogs', page, search, entityType, action, dateRange],
    queryFn: () => fetchAuditLogs({ page, search, entityType, action, dateRange, limit: 50 }),
  });
};
