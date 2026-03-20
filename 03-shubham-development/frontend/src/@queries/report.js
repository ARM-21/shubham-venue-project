import { useQuery } from "@tanstack/react-query";
import { REPORTS_SUMMARY_QUERY_KEY, reportsSummaryFetcher } from "@api/report/reports-summary-fetcher";
import { REPORTS_TRANSACTIONS_QUERY_KEY, reportsTransactionsFetcher } from "@api/report/reports-transactions-fetcher";

export function useQueryReportsSummary(options) {
  return useQuery({
    queryKey: [REPORTS_SUMMARY_QUERY_KEY],
    queryFn: async () => reportsSummaryFetcher(),
    ...options,
  });
}

export function useQueryReportsTransactions(params, options) {
  return useQuery({
    queryKey: [REPORTS_TRANSACTIONS_QUERY_KEY, params],
    queryFn: async () => reportsTransactionsFetcher(params),
    ...options,
  });
}

