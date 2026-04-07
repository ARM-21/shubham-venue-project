'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Users, CheckCircle, Clock, TrendingDown, Flag } from 'lucide-react';
import { useQueryFlagDashboard, useQuerySuspensionStats, useQueryPendingReviewEvents } from '@queries/admin/governance.queries';
import { useQueryReportStats } from '@queries/admin/event-reports.queries';
import { GovStatCard, FlagCard } from 'components/admin/governance/GovernanceComponents';
import AdminTopbar from 'components/admin/dashboard/AdminTopbar';

export default function GovernanceDashboard() {
  const { data: flagStats, isLoading: flagsLoading } = useQueryFlagDashboard();
  const { data: suspensionStats, isLoading: statsLoading } = useQuerySuspensionStats();
  const { data: pendingEvents, isLoading: pendingLoading } = useQueryPendingReviewEvents(1, 5);
  const { data: reportStats, isLoading: reportStatsLoading } = useQueryReportStats();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Event Governance" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Page Header - Professional */}
            <div className="mb-8">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h1 className="text-5xl font-bold text-white mb-2">Governance</h1>
                  <p className="text-[#d1d5db] text-sm">Monitor compliance, manage flags, and protect platform integrity</p>
                </div>
                <div className="h-1 flex-1 mx-6 bg-gradient-to-r from-[var(--gold-accent)]/20 to-transparent rounded-full"></div>
              </div>
            </div>

            {/* Key Stats - Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {flagsLoading ? (
                <>
                  <div className="bg-gradient-to-br from-[var(--admin-surface)] to-[#1a0808] rounded-xl p-6 animate-pulse h-40 border border-[#3a1a1a]"></div>
                  <div className="bg-gradient-to-br from-[var(--admin-surface)] to-[#1a0808] rounded-xl p-6 animate-pulse h-40 border border-[#3a1a1a]"></div>
                  <div className="bg-gradient-to-br from-[var(--admin-surface)] to-[#1a0808] rounded-xl p-6 animate-pulse h-40 border border-[#3a1a1a]"></div>
                  <div className="bg-gradient-to-br from-[var(--admin-surface)] to-[#1a0808] rounded-xl p-6 animate-pulse h-40 border border-[#3a1a1a]"></div>
                </>
              ) : (
                <>
                  <GovStatCard
                    icon={AlertTriangle}
                    label="Active Flags"
                    value={flagStats?.stats?.activeFlags || 0}
                    color="red"
                  />
                  <GovStatCard
                    icon={AlertTriangle}
                    label="High Priority"
                    value={flagStats?.stats?.highPriority || 0}
                    color="yellow"
                  />
                  <GovStatCard
                    icon={Clock}
                    label="Under Investigation"
                    value={flagStats?.stats?.investigating || 0}
                    color="blue"
                  />
                  <GovStatCard
                    icon={CheckCircle}
                    label="Resolved This Month"
                    value={flagStats?.stats?.totalResolved || 0}
                    color="green"
                  />
                </>
              )}
            </div>

            {/* Suspension Stats & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Suspension Stats Card - Professional */}
              {statsLoading ? (
                <div className="bg-gradient-to-br from-[var(--admin-surface)] to-[#1a0808] rounded-xl p-6 animate-pulse h-48 border border-[#3a1a1a]"></div>
              ) : (
                <div className="bg-gradient-to-br from-[var(--admin-surface)] to-[#1a0808] rounded-xl border border-[#3a1a1a] p-6 hover:border-[var(--gold-accent)]/30 transition-all">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#3a1a1a]">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-[var(--gold-accent)]" />
                      Suspension Status
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between group cursor-default">
                      <span className="text-[#9ca3af] text-sm font-medium">Total Suspended</span>
                      <span className="text-2xl font-bold text-red-400">{suspensionStats?.stats?.totalSuspended || 0}</span>
                    </div>
                    <div className="h-px bg-[#3a1a1a]"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#9ca3af] text-sm">Active Temporary</span>
                      <span className="font-bold text-yellow-400">{suspensionStats?.stats?.temporary || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#9ca3af] text-sm">Permanent</span>
                      <span className="font-bold text-red-500">{suspensionStats?.stats?.permanent || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#9ca3af] text-sm">Expiring Soon</span>
                      <span className="font-bold text-orange-400">{suspensionStats?.stats?.expiringSoon || 0}</span>
                    </div>
                    {suspensionStats?.stats?.expiredTemporary > 0 && (
                      <>
                        <div className="h-px bg-[#3a1a1a]"></div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[#9ca3af] text-sm">Needs Action</span>
                          <span className="font-bold text-[var(--gold-accent)] bg-[var(--gold-accent)]/10 px-2.5 py-1 rounded-full text-sm">{suspensionStats?.stats?.expiredTemporary}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions - Professional */}
              <div className="bg-gradient-to-br from-[var(--admin-surface)] to-[#1a0808] rounded-xl border border-[#3a1a1a] p-6">
                <h3 className="text-lg font-semibold text-white mb-5 pb-4 border-b border-[#3a1a1a] flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[var(--gold-accent)]" />
                  Quick Links
                </h3>
                <div className="space-y-2.5">
                  <Link
                    href="/admin/governance/flags"
                    className="block px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 hover:border-red-400/50 transition text-sm font-medium"
                  >
                    → View All Flags
                  </Link>
                  <Link
                    href="/admin/governance/reports"
                    className="block px-4 py-3 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-lg hover:bg-orange-500/20 hover:border-orange-400/50 transition text-sm font-medium"
                  >
                    → Event Reports
                  </Link>
                  <Link
                    href="/admin/governance/organizer-events"
                    className="block px-4 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 hover:border-blue-400/50 transition text-sm font-medium"
                  >
                    → Pending Review
                  </Link>
                  <Link
                    href="/admin/governance/organizers"
                    className="block px-4 py-3 bg-[var(--gold-accent)]/10 border border-[var(--gold-accent)]/30 text-[var(--gold-accent)] rounded-lg hover:bg-[var(--gold-accent)]/20 hover:border-[var(--gold-accent)]/50 transition text-sm font-medium"
                  >
                    → Manage Organizers
                  </Link>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gradient-to-br from-[var(--admin-surface)] to-[#1a0808] rounded-xl border border-[#3a1a1a] p-6">
                <h3 className="text-lg font-semibold text-white mb-5 pb-4 border-b border-[#3a1a1a] flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-[var(--gold-accent)]" />
                  Overview
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-[#9ca3af] uppercase font-semibold mb-1">Total Flags</p>
                    <p className="text-3xl font-bold text-white">{flagStats?.stats?.activeFlags || 0}</p>
                  </div>
                  <div className="h-px bg-[#3a1a1a]"></div>
                  <div>
                    <p className="text-xs text-[#9ca3af] uppercase font-semibold mb-1">Pending Reports</p>
                    <p className="text-2xl font-bold text-orange-400">{reportStats?.pending || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Flags */}
            {flagsLoading ? (
              <div className="bg-[var(--admin-surface)] rounded-xl p-6 border border-[#3a1a1a] animate-pulse h-64"></div>
            ) : (
              <div className="bg-[var(--admin-surface)] rounded-xl border border-[#3a1a1a] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    Recent Flags
                  </h3>
                  <Link href="/admin/governance/flags" className="text-[var(--admin-primary)] hover:text-[var(--admin-primary)]/80 text-sm font-medium">
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {flagStats?.recentFlags?.slice(0, 5).map((flag) => (
                    <Link
                      key={flag._id}
                      href={`/admin/governance/flags/${flag._id}`}
                      className="block hover:opacity-75 transition"
                    >
                      <FlagCard flag={flag} />
                    </Link>
                  ))}
                  {!flagStats?.recentFlags || flagStats.recentFlags.length === 0 && (
                    <p className="text-[#9ca3af] text-center py-8">No recent flags</p>
                  )}
                </div>
              </div>
            )}

            {/* Pending Events */}
            {pendingLoading ? (
              <div className="bg-[var(--admin-surface)] rounded-xl p-6 border border-[#3a1a1a] animate-pulse h-64"></div>
            ) : (
              <div className="bg-[var(--admin-surface)] rounded-xl border border-[#3a1a1a] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Pending Review ({pendingEvents?.pagination?.total || 0})
                  </h3>
                  <Link href="/admin/governance/organizer-events" className="text-[var(--admin-primary)] hover:text-[var(--admin-primary)]/80 text-sm font-medium">
                    View All →
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#0f0606] border-b border-[#3a1a1a]">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-white">Event</th>
                        <th className="px-4 py-2 text-left font-semibold text-white">Organizer</th>
                        <th className="px-4 py-2 text-left font-semibold text-white">Submitted</th>
                        <th className="px-4 py-2 text-left font-semibold text-white">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3a1a1a]">
                      {pendingEvents?.events?.slice(0, 5).map((event) => (
                        <tr key={event._id} className="hover:bg-[#1a0808]">
                          <td className="px-4 py-2 font-medium text-white">{event.name}</td>
                          <td className="px-4 py-2 text-[#9ca3af]">{event.organizerId?.email}</td>
                          <td className="px-4 py-2 text-[#9ca3af]">
                            {new Date(event.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            <Link
                              href={`/admin/governance/organizer-events/${event._id}`}
                              className="text-[var(--admin-primary)] hover:text-[var(--admin-primary)]/80 font-medium"
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!pendingEvents?.events || pendingEvents.events.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No pending events</p>
                  )}
                </div>
              </div>
            )}

            {/* Recent Reports */}
            {reportStatsLoading ? (
              <div className="bg-[var(--admin-surface)] rounded-xl p-6 border border-[#3a1a1a] animate-pulse h-64"></div>
            ) : (
              <div className="bg-[var(--admin-surface)] rounded-xl border border-[#3a1a1a] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Flag className="w-5 h-5 text-orange-400" />
                    Community Reports ({reportStats?.total || 0})
                  </h3>
                  <Link href="/admin/governance/reports" className="text-[var(--admin-primary)] hover:text-[var(--admin-primary)]/80 text-sm font-medium">
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-[#1a0808] border border-[#3a1a1a] rounded-lg p-3">
                    <p className="text-xs text-[#9ca3af] mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{reportStats?.pending || 0}</p>
                  </div>
                  <div className="bg-[#1a0808] border border-[#3a1a1a] rounded-lg p-3">
                    <p className="text-xs text-[#9ca3af] mb-1">Reviewing</p>
                    <p className="text-2xl font-bold text-blue-400">{reportStats?.reviewing || 0}</p>
                  </div>
                  <div className="bg-[#1a0808] border border-[#3a1a1a] rounded-lg p-3">
                    <p className="text-xs text-[#9ca3af] mb-1">Resolved</p>
                    <p className="text-2xl font-bold text-emerald-400">{reportStats?.resolved || 0}</p>
                  </div>
                  <div className="bg-[#1a0808] border border-[#3a1a1a] rounded-lg p-3">
                    <p className="text-xs text-[#9ca3af] mb-1">Critical</p>
                    <p className="text-2xl font-bold text-red-400">{reportStats?.critical || 0}</p>
                  </div>
                </div>
                {!reportStats?.recentReports || reportStats.recentReports.length === 0 ? (
                  <p className="text-[#9ca3af] text-center py-8">No recent reports</p>
                ) : (
                  <div className="space-y-3">
                    {reportStats?.recentReports?.slice(0, 5).map((report) => (
                      <Link
                        key={report._id}
                        href="/admin/governance/reports"
                        className="flex items-center justify-between p-3 bg-[#1a0808] border border-[#3a1a1a] rounded-lg hover:border-[var(--admin-primary)]/50 transition"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium">{report.eventId?.name || 'Event'}</p>
                          <p className="text-xs text-[#9ca3af] mt-1">{report.reason}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                          report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                          report.status === 'reviewing' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                          report.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                          'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}>
                          {report.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
