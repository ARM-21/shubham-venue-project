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
  const { status = 'pending', priority, page = 1, limit = 20, search } = filters;
  
  // Handle empty string filters - treat as undefined so API uses all
  const finalStatus = status || 'pending';
  const finalPriority = priority || undefined;
  const finalSearch = search || undefined;

  return useQuery({
    queryKey: ['eventReports', finalStatus, finalPriority, page, limit, finalSearch],
    queryFn: () => fetchEventReports({ 
      status: finalStatus, 
      priority: finalPriority, 
      page, 
      limit, 
      search: finalSearch 
    }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
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
