import { useQuery } from '@tanstack/react-query';
import { DASHBOARD_OVERVIEW_QUERY_KEY, fetchDashboardOverview } from '@api/dashboard/overview-fetcher';

export function useQueryDashboardOverview(options = {}) {
  return useQuery({
    queryKey: [DASHBOARD_OVERVIEW_QUERY_KEY],
    queryFn: fetchDashboardOverview,
    ...options,
  });
}
