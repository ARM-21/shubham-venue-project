'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, AlertTriangle } from 'lucide-react';
import {
  useQueryFlags,
} from '@queries/admin/governance.queries';
import { FlagCard } from 'components/admin/governance/GovernanceComponents';
import AdminTopbar from 'components/admin/dashboard/AdminTopbar';
import { toast } from 'sonner';

const severityConfig = {
  critical: { text: '#991b1b', bg: '#fee2e2', darkText: '#fca5a5', darkBg: '#7f1d1d' },
  high: { text: '#92400e', bg: '#fef3c7', darkText: '#fcd34d', darkBg: '#78350f' },
  medium: { text: '#1e40af', bg: '#dbeafe', darkText: '#93c5fd', darkBg: '#1e3a8a' },
  low: { text: '#166534', bg: '#dcfce7', darkText: '#86efac', darkBg: '#15803d' },
};

const statusConfig = {
  open: { label: 'Open', color: '#ef4444', bg: '#fee2e2', darkBg: '#7f1d1d' },
  investigating: { label: 'Investigating', color: '#f59e0b', bg: '#fef3c7', darkBg: '#78350f' },
  resolved: { label: 'Resolved', color: '#10b981', bg: '#dcfce7', darkBg: '#15803d' },
  dismissed: { label: 'Dismissed', color: '#8b5cf6', bg: '#ede9fe', darkBg: '#5b21b6' },
};

export default function FlagsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [page, setPage] = useState(1);

  const { data: flagsData, isLoading, error, refetch } = useQueryFlags({
    page,
    status: statusFilter,
    severity: severityFilter,
    search: searchTerm,
  });

  const flags = flagsData?.flags || [];
  const totalPages = flagsData?.totalPages || 1;

  if (error)
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar heading="Event Flags" />
        <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
          <div className="max-w-7xl mx-auto">
            <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
              <p className="text-red-800 dark:text-red-200">
                Failed to load flags. Try again.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Event Flags" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Event Flags
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and investigate flagged events
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Flags
              </div>
              <div className="text-3xl font-bold text-red-600 mt-2">
                {flagsData?.totalCount || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Open
              </div>
              <div className="text-3xl font-bold text-orange-600 mt-2">
                {flags.filter(f => f.status === 'open').length}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Critical
              </div>
              <div className="text-3xl font-bold text-red-700 mt-2">
                {flags.filter(f => f.severity === 'critical').length}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Resolved
              </div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {flags.filter(f => f.status === 'resolved').length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex gap-4 flex-wrap items-end">
              <div className="flex-1 min-w-xs">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severity
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) => {
                    setSeverityFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="all">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Flags List */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : flags.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <AlertTriangle className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 dark:text-gray-400">No flags found</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Great! No suspicious events to investigate right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {flags.map((flag) => (
                <Link
                  key={flag._id}
                  href={`/admin/governance/flags/${flag._id}`}
                  className="block"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {flag.eventId?.name || 'Unknown Event'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {flag.reason}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {new Date(flag.timestamp).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <span
                          className="px-2 py-1 text-xs font-semibold rounded"
                          style={{ 
                            backgroundColor: severityConfig[flag.severity]?.bg, 
                            color: severityConfig[flag.severity]?.text 
                          }}
                        >
                          {flag.severity.toUpperCase()}
                        </span>
                        <span
                          className="px-2 py-1 text-xs font-semibold rounded"
                          style={{ 
                            backgroundColor: statusConfig[flag.status]?.bg, 
                            color: statusConfig[flag.status]?.color 
                          }}
                        >
                          {statusConfig[flag.status]?.label || flag.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
