'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Users, CheckCircle, Clock, TrendingDown } from 'lucide-react';
import { useQueryFlagDashboard, useQuerySuspensionStats, useQueryPendingReviewEvents } from '@queries/admin/governance.queries';
import { GovStatCard, FlagCard } from 'components/admin/governance/GovernanceComponents';
import AdminTopbar from 'components/admin/dashboard/AdminTopbar';

export default function GovernanceDashboard() {
  const { data: flagStats, isLoading: flagsLoading } = useQueryFlagDashboard();
  const { data: suspensionStats, isLoading: statsLoading } = useQuerySuspensionStats();
  const { data: pendingEvents, isLoading: pendingLoading } = useQueryPendingReviewEvents(1, 5);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Event Governance" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Governance Dashboard</h1>
              <p className="text-gray-600">Monitor organizer events, flag suspicious activity, and manage reputation</p>
            </div>

            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {flagsLoading ? (
                <>
                  <div className="bg-white rounded-lg p-6 animate-pulse h-32"></div>
                  <div className="bg-white rounded-lg p-6 animate-pulse h-32"></div>
                  <div className="bg-white rounded-lg p-6 animate-pulse h-32"></div>
                  <div className="bg-white rounded-lg p-6 animate-pulse h-32"></div>
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
              {/* Suspension Stats Card */}
              {statsLoading ? (
                <div className="bg-white rounded-lg p-6 animate-pulse h-40"></div>
              ) : (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-red-500" />
                    Suspension Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Suspended:</span>
                      <span className="font-bold text-red-600">{suspensionStats?.stats?.totalSuspended || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temporary:</span>
                      <span className="font-bold text-yellow-600">{suspensionStats?.stats?.temporary || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Permanent:</span>
                      <span className="font-bold text-red-700">{suspensionStats?.stats?.permanent || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiring Soon (7 days):</span>
                      <span className="font-bold text-orange-600">{suspensionStats?.stats?.expiringSoon || 0}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <Link
                    href="/admin/governance/flags"
                    className="block px-4 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition text-sm font-medium"
                  >
                    → View All Flags
                  </Link>
                  <Link
                    href="/admin/governance/organizer-events/pending"
                    className="block px-4 py-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition text-sm font-medium"
                  >
                    → Review Pending Events
                  </Link>
                  <Link
                    href="/admin/governance/organizers"
                    className="block px-4 py-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition text-sm font-medium"
                  >
                    → Manage Organizers
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600 text-sm">All systems operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600 text-sm">Audit logging active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-600 text-sm">API responding normally</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Flags */}
            {flagsLoading ? (
              <div className="bg-white rounded-lg p-6 shadow animate-pulse h-64"></div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Recent Flags
                  </h3>
                  <Link href="/admin/governance/flags" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All →
                  </Link>
                </div>
                <div className="space-y-3">
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
                    <p className="text-gray-500 text-center py-8">No recent flags</p>
                  )}
                </div>
              </div>
            )}

            {/* Pending Events */}
            {pendingLoading ? (
              <div className="bg-white rounded-lg p-6 shadow animate-pulse h-64"></div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Pending Review ({pendingEvents?.pagination?.total || 0})
                  </h3>
                  <Link href="/admin/governance/organizer-events/pending" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View All →
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Event</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Organizer</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Submitted</th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-900">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pendingEvents?.events?.slice(0, 5).map((event) => (
                        <tr key={event._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-900">{event.name}</td>
                          <td className="px-4 py-2 text-gray-600">{event.organizerId?.email}</td>
                          <td className="px-4 py-2 text-gray-600">
                            {new Date(event.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            <Link
                              href={`/admin/governance/organizer-events/${event._id}`}
                              className="text-blue-600 hover:text-blue-700 font-medium"
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
        </div>
      </div>
    </div>
  );
}
