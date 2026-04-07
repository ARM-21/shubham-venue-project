'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useQueryEventReports, useQueryReportStats } from '@queries/admin/event-reports.queries';
import { AlertCircle, Search, AlertTriangle, AlertOctagon, CheckCircle, RefreshCw } from 'lucide-react';
import ReportReviewModal from 'components/governance/ReportReviewModal';
import AdminTopbar from 'components/admin/dashboard/AdminTopbar';

const STATUS_BADGES = {
  pending: { label: 'Pending', color: '#eab308', bg: '#fef3c7', darkBg: '#78350f', borderColor: '#fde047' },
  reviewing: { label: 'Reviewing', color: '#3b82f6', bg: '#dbeafe', darkBg: '#1e3a8a', borderColor: '#93c5fd' },
  resolved: { label: 'Resolved', color: '#10b981', bg: '#dcfce7', darkBg: '#15803d', borderColor: '#86efac' },
  dismissed: { label: 'Dismissed', color: '#8b5cf6', bg: '#ede9fe', darkBg: '#5b21b6', borderColor: '#d8b4fe' },
};

const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

const REPORT_REASONS = {
  suspicious_activity: 'Suspicious Activity',
  false_content: 'False Content',
  policy_violation: 'Policy Violation',
  spam: 'Spam',
  fraud: 'Fraud',
  inappropriate_content: 'Inappropriate Content',
  discrimination: 'Discrimination',
  other: 'Other',
};

const PRIORITY_BADGES = {
  low: { label: 'Low', color: '#3b82f6', bg: '#dbeafe', darkBg: '#1e3a8a', borderColor: '#93c5fd' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fef3c7', darkBg: '#92400e', borderColor: '#fce7a5' },
  high: { label: 'High', color: '#ef4444', bg: '#fee2e2', darkBg: '#7f1d1d', borderColor: '#fca5a5' },
  critical: { label: 'Critical', color: '#dc2626', bg: '#fecaca', darkBg: '#991b1b', borderColor: '#fca5a5' },
};

export default function EventReportsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    page: 1,
    limit: 10,
    search: '',
  });

  const [selectedReport, setSelectedReport] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: reports, isLoading: reportsLoading } = useQueryEventReports(filters);
  const { data: stats, isLoading: statsLoading } = useQueryReportStats();

  const handleStatusFilter = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? '' : status,
      page: 1,
    }));
  };

  const handlePriorityFilter = (priority) => {
    setFilters((prev) => ({
      ...prev,
      priority: prev.priority === priority ? '' : priority,
      page: 1,
    }));
  };

  const handleSearch = (e) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
      page: 1,
    }));
  };

  const handleReportClick = (report) => {
    setSelectedReport(report);
    setShowReviewModal(true);
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo(0, 0);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['eventReports'] }),
        queryClient.invalidateQueries({ queryKey: ['reportStats'] }),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Event Reports" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white">Event Reports</h1>
              <p className="text-[#9ca3af] mt-1">Review and manage community event reports</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`w-12 h-12 flex items-center justify-center rounded-full border border-[#3a1a1a] bg-[var(--admin-surface)] hover:border-[var(--admin-primary)]/50 transition-all group ${
                isRefreshing ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#1a0808]'
              }`}
              title="Refresh reports"
            >
              <RefreshCw
                size={20}
                className={`text-[var(--admin-primary)] group-hover:text-[var(--admin-primary)] transition-transform ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
            </button>
          </div>

          {/* Stats */}
          {!statsLoading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
                <div className="text-sm font-medium text-[#9ca3af]">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Total Reports
                </div>
                <div className="text-3xl font-bold text-white mt-2">{stats.total || 0}</div>
              </div>

              <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
                <div className="text-sm font-medium text-[#9ca3af]">
                  <AlertOctagon className="w-4 h-4 inline mr-2" />
                  Pending
                </div>
                <div className="text-3xl font-bold text-yellow-400 mt-2">{stats.pending || 0}</div>
              </div>

              <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
                <div className="text-sm font-medium text-[#9ca3af]">
                  <AlertTriangle className="w-4 h-4 inline mr-2" />
                  Critical
                </div>
                <div className="text-3xl font-bold text-red-400 mt-2">{stats.critical || 0}</div>
              </div>

              <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
                <div className="text-sm font-medium text-[#9ca3af]">
                  <AlertCircle className="w-4 h-4 inline mr-2" />
                  Reviewing
                </div>
                <div className="text-3xl font-bold text-blue-400 mt-2">{stats.reviewing || 0}</div>
              </div>

              <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
                <div className="text-sm font-medium text-[#9ca3af]">
                  <CheckCircle className="w-4 h-4 inline mr-2" />
                  Resolved
                </div>
                <div className="text-3xl font-bold text-emerald-400 mt-2">{stats.resolved || 0}</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-[var(--admin-surface)] rounded-xl p-6 border border-[#3a1a1a] space-y-4">
            <div className="flex gap-4 flex-wrap items-end">
              <div className="flex-1 min-w-xs">
                <label className="block text-sm font-medium text-white mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-[#9ca3af]" size={18} />
                  <input
                    type="text"
                    placeholder="Search by event name or reporter email..."
                    value={filters.search}
                    onChange={handleSearch}
                    className="w-full pl-10 pr-4 py-2 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="w-40">
                <label className="block text-sm font-medium text-white mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent font-medium"
                >
                  <option value="">All</option>
                  <option value="pending">Pending</option>
                  <option value="reviewing">Reviewing</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div className="w-40">
                <label className="block text-sm font-medium text-white mb-2">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handlePriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent font-medium"
                >
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {reportsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--admin-primary)]" />
                <p className="text-[#9ca3af] mt-3">Loading reports...</p>
              </div>
            ) : !reports || reports.length === 0 ? (
              <div className="text-center py-12 bg-[var(--admin-surface)] rounded-lg border border-[#3a1a1a]">
                <p className="text-[#9ca3af]">No reports found</p>
              </div>
            ) : (
              reports.map((report) => (
                <div
                  key={report._id}
                  onClick={() => setSelectedReport(report)}
                  className="bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-lg p-5 hover:border-[var(--admin-primary)]/50 transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-white">{report.eventName}</h3>
                      <p className="text-sm text-[#9ca3af] mt-1">
                        Reported by: <span className="text-white font-medium">{report.reporterEmail}</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className="px-3 py-1 rounded-lg text-xs font-medium border"
                        style={{
                          backgroundColor: STATUS_BADGES[report.status]?.darkBg || '#1a0808',
                          color: STATUS_BADGES[report.status]?.color || '#9ca3af',
                          borderColor: STATUS_BADGES[report.status]?.borderColor || '#3a1a1a',
                        }}
                      >
                        {STATUS_BADGES[report.status]?.label || report.status}
                      </span>
                      <span
                        className="px-3 py-1 rounded-lg text-xs font-medium border"
                        style={{
                          backgroundColor: PRIORITY_BADGES[report.priority]?.darkBg || '#1a0808',
                          color: PRIORITY_BADGES[report.priority]?.color || '#9ca3af',
                          borderColor: PRIORITY_BADGES[report.priority]?.borderColor || '#3a1a1a',
                        }}
                      >
                        {PRIORITY_BADGES[report.priority]?.label || report.priority}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-[#9ca3af] line-clamp-2 mb-3">{report.description}</p>

                  <div className="flex justify-between items-center text-xs text-[#9ca3af]">
                    <div className="flex gap-4">
                      <span>Reason: {REPORT_REASONS[report.reason] || report.reason}</span>
                      <span>Events: {report.eventCount || 1}</span>
                    </div>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <ReportReviewModal
          report={selectedReport}
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          onReportUpdated={() => {
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
}
