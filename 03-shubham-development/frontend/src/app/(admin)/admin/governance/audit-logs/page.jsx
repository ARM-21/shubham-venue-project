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

  // Calculate stats from logs
  const stats = useMemo(() => {
    if (!logsData?.logs) {
      return { today: 0, week: 0, total: 0 };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let todayCount = 0;
    let weekCount = 0;

    logsData.logs.forEach((log) => {
      const logDate = new Date(log.createdAt);
      if (logDate >= today) todayCount++;
      if (logDate >= weekAgo) weekCount++;
    });

    return {
      today: todayCount,
      week: weekCount,
      total: logsData?.pagination?.total || 0,
    };
  }, [logsData]);

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
      new Date(log.createdAt).toLocaleString(),
      log.entityType,
      log.entityId,
      log.action,
      typeof log.performedBy === 'object'
        ? (log.performedBy?.firstName + ' ' + log.performedBy?.lastName).trim()
        : 'System',
      log.performedByRole || 'system',
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
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
        <p className="text-red-400">
          Failed to load audit logs. Try again.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
          <h1 className="text-4xl font-bold text-white">
            Audit Trail
          </h1>
          <p className="text-[#9ca3af] mt-1">
            Complete forensic log of all system actions
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={isExporting || filteredLogs.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
        >
          <FileDown size={18} />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
          <div className="text-sm font-medium text-[#9ca3af]">
            Total Actions
          </div>
          <div className="text-3xl font-bold text-white mt-2">
            {stats.total}
          </div>
        </div>

        <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
          <div className="text-sm font-medium text-[#9ca3af]">
            Today
          </div>
          <div className="text-3xl font-bold text-emerald-400 mt-2">
            {stats.today}
          </div>
        </div>

        <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
          <div className="text-sm font-medium text-[#9ca3af]">
            This Week
          </div>
          <div className="text-3xl font-bold text-blue-400 mt-2">
            {stats.week}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[var(--admin-surface)] rounded-xl p-6 border border-[#3a1a1a] space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-xs">
            <label className="block text-sm font-medium text-white mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-[#9ca3af]" size={18} />
              <input
                type="text"
                placeholder="Search by entity ID, user, IP..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent"
              />
            </div>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-white mb-2">
              Entity Type
            </label>
            <select
              value={entityTypeFilter}
              onChange={(e) => {
                setEntityTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent"
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
            <label className="block text-sm font-medium text-white mb-2">
              Action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent"
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
            <label className="block text-sm font-medium text-white mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => {
                setDateRange(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent"
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
      {/* Column Legend */}
      <div className="bg-[#1a0808]/50 rounded-xl border border-[#3a1a1a] p-4 mb-6">
        <details className="cursor-pointer">
          <summary className="flex items-center gap-2 text-sm font-semibold text-[#9ca3af] hover:text-white transition">
            <Database size={16} className="text-[var(--admin-primary)]" />
            <span>Column Legend & Field Descriptions</span>
          </summary>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <p className="font-medium text-white text-sm">📅 Timestamp</p>
                <p className="text-xs text-[#9ca3af]">Date and time when the action occurred</p>
              </div>
              <div>
                <p className="font-medium text-white text-sm">📦 Entity Type</p>
                <p className="text-xs text-[#9ca3af]">Type of resource affected (event, organizer, flag, user, admin, system)</p>
              </div>
              <div>
                <p className="font-medium text-white text-sm">🆔 Entity ID</p>
                <p className="text-xs text-[#9ca3af]">Unique identifier of the resource that was modified</p>
              </div>
              <div>
                <p className="font-medium text-white text-sm">⚡ Action</p>
                <p className="text-xs text-[#9ca3af]">What happened: created, updated, deleted, flagged, suspended, approved, rejected, status_changed, etc.</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="font-medium text-white text-sm">👤 Performed By</p>
                <p className="text-xs text-[#9ca3af]">Name of the user or system that triggered the action</p>
              </div>
              <div>
                <p className="font-medium text-white text-sm">🔐 Role</p>
                <p className="text-xs text-[#9ca3af]">User's role when action was performed (admin, organizer, system, etc.)</p>
              </div>
              <div>
                <p className="font-medium text-white text-sm">🌐 IP Address</p>
                <p className="text-xs text-[#9ca3af]">Network address of the request origin (::1 = localhost/your machine)</p>
              </div>
              <div>
                <p className="font-medium text-white text-sm">📝 Changes</p>
                <p className="text-xs text-[#9ca3af]">Specific field values that were modified (empty if no data fields changed)</p>
              </div>
            </div>
          </div>
        </details>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 bg-[#3a1a1a] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-12 bg-[var(--admin-surface)] rounded-xl border border-[#3a1a1a]">
          <Filter className="mx-auto text-[#9ca3af] mb-3" size={48} />
          <p className="text-[#9ca3af]">
            No logs found matching your filters
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log._id}
              className="bg-[#0f0606] rounded-xl border border-[#3a1a1a] overflow-hidden hover:border-[var(--admin-primary)]/50 transition-all shadow-lg"
            >
              {/* Header Section */}
              <div className="border-l-4 border-l-[var(--admin-primary)] bg-gradient-to-r from-[#1a0808] to-[var(--admin-surface)] px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Time & Action */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Clock className="text-[var(--admin-primary)]" size={14} />
                        <span className="text-[#9ca3af]">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          ENTITY_COLORS[log.entityType] || ENTITY_COLORS.system
                        }`}
                      >
                        {log.entityType?.toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          ACTION_COLORS[log.action] || ACTION_COLORS.updated
                        }`}
                      >
                        {log.action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Right: Performer */}
                  <div className="text-right">
                    <p className="text-xs text-[#9ca3af] mb-1 uppercase tracking-wide">
                      Performed By
                    </p>
                    <div className="flex items-center justify-end gap-1.5">
                      <User className="text-[var(--admin-primary)]" size={16} />
                      <div>
                        <p className="font-semibold text-white text-sm">
                          {typeof log.performedBy === 'object'
                            ? (log.performedBy?.firstName + ' ' + log.performedBy?.lastName).trim()
                            : 'System'}
                        </p>
                        <p className="text-xs text-[#9ca3af] capitalize">
                          {log.performedByRole || 'system'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Section */}
              <div className="px-6 py-4 bg-[#0f0606]/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Entity ID */}
                  <div>
                    <p className="text-xs text-[#9ca3af] mb-1.5 uppercase font-semibold tracking-wide">
                      Entity ID
                    </p>
                    <p className="text-sm font-mono text-[#e0e0e0] break-all">
                      {log.entityId}
                    </p>
                  </div>

                  {/* IP Address */}
                  <div>
                    <p className="text-xs text-[#9ca3af] mb-1.5 uppercase font-semibold tracking-wide">
                      IP Address
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--admin-primary)]/50"></div>
                      <p className="text-sm font-mono text-[#e0e0e0]">
                        {log.ipAddress === '::1' ? 'Localhost' : log.ipAddress || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Changes Count */}
                  <div>
                    <p className="text-xs text-[#9ca3af] mb-1.5 uppercase font-semibold tracking-wide">
                      Changes
                    </p>
                    {log.changes && Object.keys(log.changes).length > 0 ? (
                      <p className="text-sm font-medium text-[#10b981]">
                        {Object.keys(log.changes).length} field{Object.keys(log.changes).length !== 1 ? 's' : ''} modified
                      </p>
                    ) : (
                      <p className="text-sm text-[#9ca3af] italic">
                        No field changes
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata/Details Section */}
              {(log.metadata || (log.changes && Object.keys(log.changes).length > 0)) && (
                <details className="border-t border-[#3a1a1a]">
                  <summary className="px-6 py-3 cursor-pointer text-sm font-semibold text-[var(--admin-primary)] hover:bg-[#1a0808] transition flex items-center gap-2">
                    <span>▸</span> View Full Details
                  </summary>
                  <div className="px-6 py-4 bg-[#0f0606]/30 space-y-4">
                    {log.metadata && (
                      <div>
                        <p className="text-xs text-[#9ca3af] mb-2 uppercase font-semibold tracking-wide">
                          Metadata
                        </p>
                        <div className="bg-[#1a0808] border border-[#3a1a1a] rounded-lg p-3">
                          <p className="text-xs font-mono text-[#d1d5db] whitespace-pre-wrap">
                            {JSON.stringify(log.metadata, null, 2)}
                          </p>
                        </div>
                      </div>
                    )}

                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div>
                        <p className="text-xs text-[#9ca3af] mb-2 uppercase font-semibold tracking-wide">
                          Detailed Changes
                        </p>
                        <div className="bg-[#1a0808] border border-[#3a1a1a] rounded-lg p-3">
                          <p className="text-xs font-mono text-[#d1d5db] whitespace-pre-wrap">
                            {JSON.stringify(log.changes, null, 2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {logsData?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-[#3a1a1a] rounded-lg text-white hover:bg-[#1a0808] disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-[#9ca3af]">
            Page {page} of {logsData?.pagination?.pages}
          </span>
          <button
            onClick={() =>
              setPage(Math.min(logsData?.pagination?.pages, page + 1))
            }
            disabled={page === logsData?.pagination?.pages}
            className="px-4 py-2 border border-[#3a1a1a] rounded-lg text-white hover:bg-[#1a0808] disabled:opacity-50 disabled:cursor-not-allowed transition"
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
