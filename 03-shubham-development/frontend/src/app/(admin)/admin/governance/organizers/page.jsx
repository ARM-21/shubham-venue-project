'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import {
  useQueryOrganizersReputation,
} from '@queries/admin/governance.queries';
import { suspendOrganizerEvent } from '@api/governance/organizer-events-api';
import AdminTopbar from 'components/admin/dashboard/AdminTopbar';
import {
  TrustScoreBadge,
} from 'components/admin/governance/GovernanceComponents';
import { toast } from 'sonner';
import { Search, Filter, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export default function OrganizersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, suspended
  const [trustFilter, setTrustFilter] = useState('all'); // all, excellent(4+), good(3-3.9), fair(2-2.9), poor(<2)
  const [sortBy, setSortBy] = useState('trustScore'); // trustScore, eventsCreated, flags, name
  const [page, setPage] = useState(1);

  const { data: organizersData, isLoading, error, refetch } = useQueryOrganizersReputation({
    page,
    search: searchTerm,
    status: statusFilter,
  });

  const suspendMutation = useMutation({
    mutationFn: (organizerId) => suspendOrganizerEvent(organizerId),
    onSuccess: () => {
      toast.success('Organizer suspended successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to suspend organizer');
    },
  });

  // Filter and sort organizers
  const filteredOrganizers = useMemo(() => {
    if (!organizersData?.organizers) return [];

    let filtered = [...organizersData.organizers];

    // Trust score filter
    if (trustFilter !== 'all') {
      filtered = filtered.filter((org) => {
        const score = org.trustMetrics?.trustScore || 0;
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
      switch (sortBy) {
        case 'trustScore':
          return (
            (b.trustMetrics?.trustScore || 0) -
            (a.trustMetrics?.trustScore || 0)
          );
        case 'eventsCreated':
          return (
            (b.trustMetrics?.eventsCreated || 0) -
            (a.trustMetrics?.eventsCreated || 0)
          );
        case 'flags':
          return (
            (b.trustMetrics?.currentFlags || 0) -
            (a.trustMetrics?.currentFlags || 0)
          );
        case 'name':
          return (a.fullName || 'Unknown').localeCompare(
            b.fullName || 'Unknown'
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [organizersData?.organizers, trustFilter, sortBy]);

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

  if (error)
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
        <p className="text-red-800 dark:text-red-200">
          Failed to load organizers. Try again.
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
      <AdminTopbar heading="Organizers" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
          {/* Header */}
          <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Organizers
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage event organizers and their trust scores
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Organizers
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {organizersData?.totalCount || 0}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Excellent Trust (4+)
          </div>
          <div className="text-3xl font-bold text-green-600 mt-2">
            {
              filteredOrganizers.filter(
                (o) => (o.trustMetrics?.trustScore || 0) >= 4
              ).length
            }
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Low Trust (&lt;2)
          </div>
          <div className="text-3xl font-bold text-red-600 mt-2">
            {
              filteredOrganizers.filter(
                (o) => (o.trustMetrics?.trustScore || 0) < 2
              ).length
            }
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Currently Suspended
          </div>
          <div className="text-3xl font-bold text-orange-600 mt-2">
            {
              filteredOrganizers.filter(
                (o) => o.suspendedUntil && new Date(o.suspendedUntil) > new Date()
              ).length
            }
          </div>
        </div>
      </div>

      {/* Search & Filters */}
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
                placeholder="Search by name or email..."
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
              Trust Level
            </label>
            <select
              value={trustFilter}
              onChange={(e) => setTrustFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All</option>
              <option value="excellent">Excellent (4+)</option>
              <option value="good">Good (3-3.9)</option>
              <option value="fair">Fair (2-2.9)</option>
              <option value="poor">Poor (&lt;2)</option>
            </select>
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
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="trustScore">Trust Score</option>
              <option value="eventsCreated">Events Created</option>
              <option value="flags">Flags</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organizers Table */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : filteredOrganizers.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600 dark:text-gray-400">
            No organizers found matching your filters
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrganizers.map((organizer) => {
            const isSuspended =
              organizer.suspendedUntil &&
              new Date(organizer.suspendedUntil) > new Date();

            return (
              <div
                key={organizer._id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {organizer.fullName || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {organizer.email}
                        </p>
                      </div>

                      {isSuspended && (
                        <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-300 text-xs font-medium">
                          Suspended
                        </div>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-5 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Trust Score
                        </span>
                        <div className="mt-1">
                          <TrustScoreBadge
                            score={organizer.trustMetrics?.trustScore || 0}
                          />
                        </div>
                      </div>

                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Events Created
                        </span>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                          {organizer.trustMetrics?.eventsCreated || 0}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Events Approved
                        </span>
                        <p className="text-lg font-semibold text-green-600 mt-1">
                          {organizer.trustMetrics?.eventsApproved || 0}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Current Flags
                        </span>
                        <p className="text-lg font-semibold text-red-600 mt-1">
                          {organizer.trustMetrics?.currentFlags || 0}
                        </p>
                      </div>

                      <div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Suspensions
                        </span>
                        <p className="text-lg font-semibold text-orange-600 mt-1">
                          {organizer.trustMetrics?.suspensions || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/governance/organizers/${organizer._id}`}
                      className="px-4 py-2 bg-yellow-500 dark:bg-yellow-600 text-white rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-700 text-sm font-medium transition"
                    >
                      View Profile
                    </Link>

                    <button
                      onClick={() =>
                        handleSuspend(
                          organizer._id,
                          organizer.fullName || 'Organizer'
                        )
                      }
                      disabled={suspendMutation.isPending || isSuspended}
                      className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSuspended ? 'Suspended' : 'Suspend'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {organizersData?.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
            Page {page} of {organizersData?.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(organizersData?.totalPages, page + 1))}
            disabled={page === organizersData?.totalPages}
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
