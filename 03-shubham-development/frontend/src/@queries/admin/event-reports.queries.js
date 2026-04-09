import { useQuery } from '@tanstack/react-query';
import {
  fetchEventReports,
  fetchReportDetail,
  fetchReportStats,
} from '@api/governance/event-reports-api';

/**
 * Get all event reports (admin only) with filters
 */
export const useQueryEventReports = (filters = {}) => {
  const { status, priority, page = 1, limit = 20, search } = filters;

  return useQuery({
    queryKey: ['eventReports', status, priority, page, limit, search],
    queryFn: () => fetchEventReports({ 
      status, 
      priority, 
      page, 
      limit, 
      search
    }),
    staleTime: 15 * 1000, // 15 sec 
    gcTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get single report detail (admin only)
 */
export const useQueryReportDetail = (reportId) => {
  return useQuery({
    queryKey: ['reportDetail', reportId],
    queryFn: () => fetchReportDetail(reportId),
    enabled: !!reportId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Get report dashboard stats (admin only)
 */
export const useQueryReportStats = () => {
  return useQuery({
    queryKey: ['reportStats'],
    queryFn: () => fetchReportStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
