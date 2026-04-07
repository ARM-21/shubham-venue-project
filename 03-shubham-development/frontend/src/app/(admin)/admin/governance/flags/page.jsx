'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Filter, AlertTriangle, AlertCircle, AlertOctagon, Check } from 'lucide-react';
import {
  useQueryFlags,
} from '@queries/admin/governance.queries';
import { FlagCard } from 'components/admin/governance/GovernanceComponents';
import AdminTopbar from 'components/admin/dashboard/AdminTopbar';
import { toast } from 'sonner';

const severityConfig = {
  critical: { label: 'Critical', icon: AlertTriangle, text: '#7f1d1d', bg: '#fee2e2', darkText: '#fca5a5', darkBg: '#7f1d1d', borderColor: '#fecaca' },
  high: { label: 'High', text: '#92400e', bg: '#fef3c7', darkText: '#fcd34d', darkBg: '#78350f', borderColor: '#fde047' },
  medium: { label: 'Medium', text: '#1e40af', bg: '#dbeafe', darkText: '#93c5fd', darkBg: '#1e3a8a', borderColor: '#93c5fd' },
  low: { label: 'Low', text: '#166534', bg: '#dcfce7', darkText: '#86efac', darkBg: '#15803d', borderColor: '#86efac' },
};

const statusConfig = {
  open: { label: 'Open', color: '#ef4444', bg: '#fee2e2', darkBg: '#7f1d1d', borderColor: '#fecaca' },
  investigating: { label: 'Investigating', color: '#f59e0b', bg: '#fef3c7', darkBg: '#78350f', borderColor: '#fde047' },
  resolved: { label: 'Resolved', color: '#10b981', bg: '#dcfce7', darkBg: '#15803d', borderColor: '#86efac' },
  dismissed: { label: 'Dismissed', color: '#8b5cf6', bg: '#ede9fe', darkBg: '#5b21b6', borderColor: '#d8b4fe' },
};

export default function FlagsPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const organizerId = searchParams.get('organizerId');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Convert 'all' to undefined for API
  const statusParam = statusFilter === 'all' ? undefined : statusFilter;
  const severityParam = severityFilter === 'all' ? undefined : severityFilter;

  const { data: flagsData, isLoading, error, refetch } = useQueryFlags({
    page,
    status: statusParam,
    severity: severityParam,
    eventId,
    organizerId,
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
            <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-red-400">
                Failed to load flags. Try again.
              </p>
              <button
                onClick={() => refetch()}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
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
            <h1 className="text-4xl font-bold text-white">
              Event Flags
            </h1>
            <p className="text-[#9ca3af] mt-1">
              Review and investigate flagged events
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
              <div className="text-sm font-medium text-[#9ca3af]">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Total Flags
              </div>
              <div className="text-3xl font-bold text-white mt-2">
                {flagsData?.totalCount || 0}
              </div>
            </div>

            <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
              <div className="text-sm font-medium text-[#9ca3af]">
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Open
              </div>
              <div className="text-3xl font-bold text-orange-400 mt-2">
                {flags.filter(f => f.status === 'open').length}
              </div>
            </div>

            <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
              <div className="text-sm font-medium text-[#9ca3af]">
                <AlertOctagon className="w-4 h-4 inline mr-2" />
                Critical
              </div>
              <div className="text-3xl font-bold text-red-400 mt-2">
                {flags.filter(f => f.severity === 'critical').length}
              </div>
            </div>

            <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
              <div className="text-sm font-medium text-[#9ca3af]">
                <Check className="w-4 h-4 inline mr-2" />
                Resolved
              </div>
              <div className="text-3xl font-bold text-emerald-400 mt-2">
                {flags.filter(f => f.status === 'resolved').length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[var(--admin-surface)] rounded-xl p-6 border border-[#3a1a1a] space-y-4">
            <div className="flex gap-4 flex-wrap items-end">
              <div className="flex-1 min-w-xs">
                <label className="block text-sm font-medium text-white mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-[#9ca3af]" size={18} />
                  <input
                    type="text"
                    placeholder="Search events or reasons..."
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
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent font-medium"
                >
                  <option value="all">All</option>
                  <option value="open">Open</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div className="w-40">
                <label className="block text-sm font-medium text-white mb-2">
                  Severity
                </label>
                <select
                  value={severityFilter}
                  onChange={(e) => {
                    setSeverityFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent font-medium"
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
                  className="h-24 bg-[#3a1a1a] rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : flags.length === 0 ? (
            <div className="text-center py-16 bg-[var(--admin-surface)] rounded-xl border border-[#3a1a1a]">
              <AlertTriangle className="mx-auto text-[#9ca3af] mb-4" size={48} />
              <p className="text-lg font-semibold text-white">No flags found</p>
              <p className="text-sm text-[#9ca3af] mt-2">
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
                  <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white hover:text-[var(--admin-primary)] transition truncate">
                          {flag.eventId?.name || 'Unknown Event'}
                        </h3>
                        <p className="text-sm text-[#9ca3af] mt-1 capitalize">
                          {flag.reason.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-[#6b7280] mt-2">
                          Flagged {new Date(flag.flaggedAt || flag.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div className="flex gap-2 flex-shrink-0">
                        <span
                          className="px-3 py-1 text-xs font-semibold rounded-lg border transition whitespace-nowrap"
                          style={{ 
                            backgroundColor: severityConfig[flag.severity]?.bg, 
                            color: severityConfig[flag.severity]?.text,
                            borderColor: severityConfig[flag.severity]?.borderColor,
                          }}
                        >
                          {flag.severity.toUpperCase()}
                        </span>
                        <span
                          className="px-3 py-1 text-xs font-semibold rounded-lg border transition whitespace-nowrap"
                          style={{ 
                            backgroundColor: statusConfig[flag.status]?.bg, 
                            color: statusConfig[flag.status]?.color,
                            borderColor: statusConfig[flag.status]?.borderColor,
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
                className="px-4 py-2 border border-[#3a1a1a] rounded-lg text-white hover:bg-[#1a0808] disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-[#9ca3af] font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 border border-[#3a1a1a] rounded-lg text-white hover:bg-[#1a0808] disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
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
