'use client';

import { useState, useMemo } from 'react';
import { useQueryAuditLogs } from '@queries/admin/governance.queries';
import { toast } from 'sonner';
import AdminTopbar from 'components/admin/dashboard/AdminTopbar';
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Database,
  Clock,
  FileDown,
} from 'lucide-react';

const ACTION_COLORS = {
  created: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  updated: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  deleted: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  published: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  flagged: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  suspended: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  unsuspended: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
};

const ENTITY_COLORS = {
  event: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
  organizer: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
  flag: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200',
  user: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
  admin: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
  system: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200',
};

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all'); // all, today, week, month
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const {
    data: logsData,
    isLoading,
    error,
    refetch,
  } = useQueryAuditLogs({
    page,
    search: searchTerm,
    entityType: entityTypeFilter,
    action: actionFilter,
    dateRange,
  });

  // Filter and format logs
  const filteredLogs = useMemo(() => {
    if (!logsData?.logs) return [];
    return logsData.logs;
  }, [logsData?.logs]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Generate CSV
      const csvContent = generateCSV();

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success('Audit logs exported successfully');
    } catch (error) {
      toast.error('Failed to export audit logs');
    } finally {
      setIsExporting(false);
    }
  };

  const generateCSV = () => {
    const headers = [
      'Timestamp',
      'Entity Type',
      'Entity ID',
      'Action',
      'Performed By',
      'Role',
      'IP Address',
      'Changes',
    ];

    const rows = filteredLogs.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.entityType,
      log.entityId,
      log.action,
      log.performedBy?.fullName || 'Unknown',
      log.performedByRole,
      log.ipAddress || 'N/A',
      JSON.stringify(log.changes || {}),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(',')
      ),
    ].join('\n');

    return csvContent;
  };

  if (error)
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
        <p className="text-red-800 dark:text-red-200">
          Failed to load audit logs. Try again.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Audit Trail" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
          {/* Header */}
          <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Audit Trail
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete forensic log of all system actions
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || filteredLogs.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 dark:bg-yellow-600 text-white rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileDown size={18} />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Actions
          </div>
          <div className="text-3xl font-bold text-blue-600 mt-2">
            {logsData?.totalCount || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Today
          </div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {logsData?.stats?.today || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            This Week
          </div>
          <div className="text-3xl font-bold text-purple-600 mt-2">
            {logsData?.stats?.week || 0}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-xs">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search by entity ID, user, IP..."
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
              Entity Type
            </label>
            <select
              value={entityTypeFilter}
              onChange={(e) => {
                setEntityTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All</option>
              <option value="event">Event</option>
              <option value="organizer">Organizer</option>
              <option value="flag">Flag</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All</option>
              <option value="created">Created</option>
              <option value="updated">Updated</option>
              <option value="deleted">Deleted</option>
              <option value="flagged">Flagged</option>
              <option value="suspended">Suspended</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Filter className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600 dark:text-gray-400">
            No logs found matching your filters
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => (
            <div
              key={log._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 hover:shadow-lg transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                {/* Timestamp */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="text-gray-400" size={16} />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Entity & Action */}
                <div className="md:col-span-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          ENTITY_COLORS[log.entityType] || ENTITY_COLORS.system
                        }`}
                      >
                        {log.entityType?.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          ACTION_COLORS[log.action] || ACTION_COLORS.updated
                        }`}
                      >
                        {log.action}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      ID: {log.entityId}
                    </p>
                  </div>
                </div>

                {/* Actor */}
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2">
                    <User className="text-gray-400" size={16} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.performedBy?.fullName || 'System'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {log.performedByRole}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Changes */}
                <div className="md:col-span-3">
                  {log.changes && Object.keys(log.changes).length > 0 ? (
                    <div className="text-xs space-y-1">
                      {Object.entries(log.changes).slice(0, 2).map(([key, val]) => (
                        <p
                          key={key}
                          className="text-gray-600 dark:text-gray-400 truncate"
                        >
                          <span className="font-medium">{key}:</span>{' '}
                          {JSON.stringify(val).substring(0, 30)}...
                        </p>
                      ))}
                      {Object.keys(log.changes).length > 2 && (
                        <p className="text-yellow-600 dark:text-yellow-400 font-medium">
                          +{Object.keys(log.changes).length - 2} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      No changes
                    </p>
                  )}
                </div>

                {/* IP Address */}
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {log.ipAddress || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Details Row (Hidden by default) */}
              {log.metadata && (
                <details className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <summary className="cursor-pointer font-medium">
                    View Details
                  </summary>
                  <pre className="mt-2 bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {logsData?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            Page {page} of {logsData?.totalPages}
          </span>
          <button
            onClick={() =>
              setPage(Math.min(logsData?.totalPages, page + 1))
            }
            disabled={page === logsData?.totalPages}
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
