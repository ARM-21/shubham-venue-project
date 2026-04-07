'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import AdminTopbar from 'components/admin/dashboard/AdminTopbar';
import {
  TrustScoreBadge,
} from 'components/admin/governance/GovernanceComponents';
import { useQueryOrganizersReputation } from '@queries/admin/governance.queries';
import { suspendOrganizer, unsuspendOrganizer, recalculateMetrics } from '@api/governance/organizers-api';
import { toast } from 'sonner';
import { Search, Filter, AlertTriangle, CheckCircle, Clock, Star, Zap, RefreshCw } from 'lucide-react';

export default function OrganizersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, suspended
  const [trustFilter, setTrustFilter] = useState('all'); // all, excellent(4+), good(3-3.9), fair(2-2.9), poor(<2)
  const [sortBy, setSortBy] = useState('eventsCreated'); // trustScore, eventsCreated, flags, name
  const [page, setPage] = useState(1);

  // Convert statusFilter to API parameter
  const suspendedParam = statusFilter === 'all' ? undefined : statusFilter === 'suspended';

  // Fetch data from API
  const { data: organizersData, isLoading, error, refetch } = useQueryOrganizersReputation({
    suspended: suspendedParam,
    page,
    limit: 20,
  });

  // Suspend organizer mutation
  const suspendMutation = useMutation({
    mutationFn: (organizerId) => suspendOrganizer(organizerId, { reason: 'Policy violation' }),
    onSuccess: () => {
      toast.success('Organizer suspended successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to suspend organizer');
    },
  });

  // Unsuspend organizer mutation
  const unsuspendMutation = useMutation({
    mutationFn: (organizerId) => unsuspendOrganizer(organizerId),
    onSuccess: () => {
      toast.success('Organizer unsuspended successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to unsuspend organizer');
    },
  });

  // Recalculate metrics mutation
  const recalculateMutation = useMutation({
    mutationFn: () => recalculateMetrics(),
    onSuccess: (data) => {
      toast.success(`Metrics recalculated successfully! (${data.result?.succeeded || 0} organizers updated)`);
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to recalculate metrics');
    },
  });

  // Helper function to get full name and safe data access
  const getOrganizerFullName = (org) => {
    if (org.firstName && org.lastName) {
      return `${org.firstName} ${org.lastName}`;
    }
    return org.email || 'Unknown Organizer';
  };

  const getOrganizerMetrics = (org) => {
    return {
      trustScore: org.trustMetrics?.trustScore || 0,
      eventsCreated: org.trustMetrics?.eventsCreated || 0,
      eventsApproved: org.trustMetrics?.eventsApproved || 0,
      currentFlags: org.trustMetrics?.currentFlags || 0,
      suspensions: org.trustMetrics?.suspensionCount || 0,
    };
  };

  const isSuspended = (org) => {
    return org.suspensionStatus && org.suspensionStatus !== 'none';
  };

  // Filter and sort organizers
  const filteredOrganizers = useMemo(() => {
    if (!organizersData?.organizers) return [];

    let filtered = [...organizersData.organizers];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((org) => 
        getOrganizerFullName(org).toLowerCase().includes(searchLower) ||
        org.email.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((org) => {
        const suspended = isSuspended(org);
        return statusFilter === 'suspended' ? suspended : !suspended;
      });
    }

    // Trust score filter
    if (trustFilter !== 'all') {
      filtered = filtered.filter((org) => {
        const score = getOrganizerMetrics(org).trustScore;
        switch (trustFilter) {
          case 'excellent':
            return score >= 4;
          case 'good':
            return score >= 3 && score < 4;
          case 'fair':
            return score >= 2 && score < 3;
          case 'poor':
            return score < 2;
          default:
            return true;
        }
      });
    }

    // Sort
    filtered.sort((a, b) => {
      const aMetrics = getOrganizerMetrics(a);
      const bMetrics = getOrganizerMetrics(b);
      
      switch (sortBy) {
        case 'trustScore':
          return bMetrics.trustScore - aMetrics.trustScore;
        case 'eventsCreated':
          return bMetrics.eventsCreated - aMetrics.eventsCreated;
        case 'flags':
          return bMetrics.currentFlags - aMetrics.currentFlags;
        case 'name':
          return getOrganizerFullName(a).localeCompare(getOrganizerFullName(b));
        default:
          return 0;
      }
    });

    return filtered;
  }, [organizersData?.organizers, searchTerm, statusFilter, trustFilter, sortBy]);

  const handleSuspend = (organizerId, organizerName) => {
    if (
      !confirm(
        `Are you sure you want to suspend ${organizerName}? They won't be able to create events.`
      )
    ) {
      return;
    }

    suspendMutation.mutate(organizerId);
  };

  const handleUnsuspend = (organizerId, organizerName) => {
    if (
      !confirm(
        `Are you sure you want to unsuspend ${organizerName}? They will be able to create events again.`
      )
    ) {
      return;
    }

    unsuspendMutation.mutate(organizerId);
  };

  if (error)
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
        <p className="text-red-400">
          Failed to load organizers. Try again.
        </p>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Organizers" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
          {/* Header */}
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Organizers
                </h1>
                <p className="text-[#9ca3af] mt-1">
                  Manage event organizers and their trust scores
                </p>
              </div>
              <button
                onClick={() => recalculateMutation.mutate()}
                disabled={recalculateMutation.isPending}
                className="px-4 py-2 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition flex items-center gap-2"
              >
                <RefreshCw size={16} className={recalculateMutation.isPending ? 'animate-spin' : ''} />
                {recalculateMutation.isPending ? 'Recalculating...' : 'Recalculate Metrics'}
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
              <div className="text-sm font-medium text-[#9ca3af]">
                Total Organizers
              </div>
              <div className="text-3xl font-bold text-white mt-2">
                {organizersData?.pagination?.total || 0}
              </div>
            </div>

            <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
              <div className="text-sm font-medium text-[#9ca3af]">
                Excellent Trust (4+)
              </div>
              <div className="text-3xl font-bold text-green-400 mt-2">
                {
                  organizersData?.organizers?.filter(
                    (o) => getOrganizerMetrics(o).trustScore >= 4
                  ).length || 0
                }
              </div>
            </div>

            <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
              <div className="text-sm font-medium text-[#9ca3af]">
                Low Trust (&lt;2)
              </div>
              <div className="text-3xl font-bold text-red-400 mt-2">
                {
                  organizersData?.organizers?.filter(
                    (o) => getOrganizerMetrics(o).trustScore < 2
                  ).length || 0
                }
              </div>
            </div>

            <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 transition-all">
              <div className="text-sm font-medium text-[#9ca3af]">
                Currently Suspended
              </div>
              <div className="text-3xl font-bold text-orange-400 mt-2">
                {
                  organizersData?.organizers?.filter(
                    (o) => isSuspended(o)
                  ).length || 0
                }
              </div>
            </div>
          </div>

      {/* Search & Filters */}
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
                placeholder="Search by name or email..."
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
              Trust Level
            </label>
            <select
              value={trustFilter}
              onChange={(e) => setTrustFilter(e.target.value)}
              className="w-full px-3 py-2 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="excellent">Excellent (4+)</option>
              <option value="good">Good (3-3.9)</option>
              <option value="fair">Fair (2-2.9)</option>
              <option value="poor">Poor (&lt;2)</option>
            </select>
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
              className="w-full px-3 py-2 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-white mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent"
            >
              <option value="eventsCreated">Events Created</option>
              <option value="trustScore">Trust Score</option>
              <option value="flags">Flags</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organizers Table */}
      {isLoading || recalculateMutation.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-[#3a1a1a] rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : filteredOrganizers.length === 0 ? (
        <div className="text-center py-12 bg-[var(--admin-surface)] rounded-xl border border-[#3a1a1a]">
          <Filter className="mx-auto text-[#9ca3af] mb-3" size={48} />
          <p className="text-[#9ca3af]">
            No organizers found matching your filters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrganizers.map((organizer) => {
            const suspended = isSuspended(organizer);
            const metrics = getOrganizerMetrics(organizer);
            const fullName = getOrganizerFullName(organizer);

            return (
              <div
                key={organizer._id}
                className="bg-[var(--admin-surface)] rounded-xl border border-[#3a1a1a] p-6 hover:border-[var(--admin-primary)]/50 transition-all"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-white text-lg">
                          {fullName}
                        </h3>
                        <p className="text-sm text-[#9ca3af]">
                          {organizer.email}
                        </p>
                      </div>

                      {suspended && (
                        <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-xs font-medium">
                          Suspended
                        </div>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-4 text-sm">
                      <div>
                        <span className="text-[#9ca3af] block mb-2">
                          Trust Score
                        </span>
                        <div>
                          <TrustScoreBadge
                            score={metrics.trustScore}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-[#9ca3af] block mb-2">
                          Events Created
                        </span>
                        <p className="text-lg font-semibold text-white">
                          {metrics.eventsCreated}
                        </p>
                      </div>

                      <div>
                        <span className="text-[#9ca3af] block mb-2">
                          Events Approved
                        </span>
                        <p className="text-lg font-semibold text-green-400">
                          {metrics.eventsApproved}
                        </p>
                      </div>

                      <div>
                        <span className="text-[#9ca3af] block mb-2">
                          Current Flags
                        </span>
                        <p className="text-lg font-semibold text-red-400">
                          {metrics.currentFlags}
                        </p>
                      </div>

                      <div>
                        <span className="text-[#9ca3af] block mb-2">
                          Suspensions
                        </span>
                        <p className="text-lg font-semibold text-orange-400">
                          {metrics.suspensions}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/governance/organizers/${organizer._id}`}
                      className="px-4 py-2 bg-[var(--admin-primary)] text-white rounded-lg hover:bg-[var(--admin-primary)]/90 text-sm font-medium transition"
                    >
                      View Profile
                    </Link>

                    <button
                      onClick={() =>
                        suspended
                          ? handleUnsuspend(
                              organizer._id,
                              fullName
                            )
                          : handleSuspend(
                              organizer._id,
                              fullName
                            )
                      }
                      disabled={suspendMutation.isPending || unsuspendMutation.isPending}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
                    >
                      {suspendMutation.isPending || unsuspendMutation.isPending
                        ? 'Processing...'
                        : suspended
                          ? 'Unsuspend'
                          : 'Suspend'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {organizersData?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-[#3a1a1a] rounded-lg hover:bg-[#1a0808] disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-[#9ca3af]">
            Page {page} of {organizersData?.pagination?.pages}
          </span>
          <button
            onClick={() => setPage(Math.min(organizersData?.pagination?.pages, page + 1))}
            disabled={page === organizersData?.pagination?.pages}
            className="px-4 py-2 border border-[#3a1a1a] rounded-lg hover:bg-[#1a0808] disabled:opacity-50 disabled:cursor-not-allowed text-white transition"
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
