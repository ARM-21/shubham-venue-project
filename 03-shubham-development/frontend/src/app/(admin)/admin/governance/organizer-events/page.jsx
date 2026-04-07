'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  useQueryOrganizerEventsReview,
} from '@queries/admin/governance.queries';
import {
  approveOrganizerEvent,
  rejectOrganizerEvent,
  suspendOrganizerEvent,
} from '@api/governance/organizer-events-api';
import { EventStatusBadge, TrustScoreBadge, ActionBadge } from 'components/admin/governance/GovernanceComponents';
import { toast } from 'sonner';
import AdminTopbar from 'components/admin/dashboard/AdminTopbar';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  RefreshCw,
} from 'lucide-react';

// Helper function to get organizer name
const getOrganizerName = (organizer) => {
  if (!organizer) return 'Unknown Organizer';
  if (organizer.firstName && organizer.lastName) {
    return `${organizer.firstName} ${organizer.lastName}`;
  }
  return organizer.email || 'Unknown Organizer';
};

// Helper function to safely format date
const formatDate = (dateString) => {
  if (!dateString) return 'Invalid Date';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

export default function OrganizerEventsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, PENDING_REVIEW, PUBLISHED, CANCELLED, SUSPENDED
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, eventDate, organizer
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(''); // approve, reject, suspend
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Convert statusFilter to API parameter (undefined for 'all')
  const statusParam = statusFilter === 'all' ? undefined : statusFilter;

  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
  } = useQueryOrganizerEventsReview({
    page,
    status: statusParam,
    search: searchTerm,
  });

  // Calculate event stats by counting events by status
  const eventStats = useMemo(() => {
    if (!eventsData?.events) {
      return {
        pending: 0,
        published: 0,
        suspended: 0,
        total: 0,
      };
    }

    const events = eventsData.events;
    const pending = events.filter((e) => e.status === 'PENDING_REVIEW' || e.status === 'DRAFT').length;
    const published = events.filter((e) => e.status === 'PUBLISHED').length;
    const suspended = events.filter((e) => e.status === 'SUSPENDED').length;
    const total = events.length;

    return {
      pending,
      published,
      suspended,
      total,
    };
  }, [eventsData?.events]);

  const approveMutation = useMutation({
    mutationFn: (eventId) => approveOrganizerEvent(eventId),
    onSuccess: () => {
      toast.success('Event approved successfully');
      setShowModal(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to approve event');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (eventId) => rejectOrganizerEvent(eventId),
    onSuccess: () => {
      toast.success('Event rejected successfully');
      setShowModal(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to reject event');
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (eventId) => suspendOrganizerEvent(eventId),
    onSuccess: () => {
      toast.success('Event suspended successfully');
      setShowModal(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to suspend event');
    },
  });

  const sortedEvents = useMemo(() => {
    if (!eventsData?.events) return [];

    let sorted = [...eventsData.events];

    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'createdAt':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'eventDate':
          return new Date(a.eventDate || a.startDateTime) - new Date(b.eventDate || b.startDateTime);
        case 'organizer':
          return (
            getOrganizerName(a.organizerId).localeCompare(
              getOrganizerName(b.organizerId)
            )
          );
        default:
          return 0;
      }
    });

    return sorted;
  }, [eventsData?.events, sortBy]);

  const handleAction = (event, action) => {
    setSelectedEvent(event);
    setModalAction(action);
    setShowModal(true);
  };

  const executeAction = async () => {
    try {
      switch (modalAction) {
        case 'approve':
          approveMutation.mutate(selectedEvent._id);
          break;
        case 'reject':
          rejectMutation.mutate(selectedEvent._id);
          break;
        case 'suspend':
          suspendMutation.mutate(selectedEvent._id);
          break;
      }
    } catch (error) {
      toast.error('An error occurred while processing the action');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetch(),
        queryClient.invalidateQueries({ queryKey: ['organizerEventsReview'] }),
      ]);
      toast.success('Data refreshed successfully');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (error)
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
        <p className="text-red-400 font-medium">
          Failed to load events. Try again.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Event Management" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
          {/* Header */}
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Event Management
                </h1>
                <p className="text-[#9ca3af] mt-2">
                  Review organizer events pending approval or address flagged concerns
                </p>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`w-12 h-12 flex items-center justify-center rounded-full border border-[#3a1a1a] bg-[var(--admin-surface)] hover:border-[var(--admin-primary)]/50 transition-all ${
                  isRefreshing ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[#1a0808]'
                }`}
                title="Refresh data"
              >
                <RefreshCw
                  size={20}
                  className={`text-[var(--admin-primary)] transition-transform ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 border border-yellow-500/30 hover:border-yellow-400/60 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-yellow-100 group-hover:text-yellow-50 transition">
                    Pending Review
                  </div>
                  <div className="text-4xl font-bold text-white mt-2">
                    {eventStats.pending}
                  </div>
                </div>
                <Clock className="w-12 h-12 opacity-20 group-hover:opacity-30 transition" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 border border-emerald-500/30 hover:border-emerald-400/60 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-emerald-100 group-hover:text-emerald-50 transition">
                    Published
                  </div>
                  <div className="text-4xl font-bold text-white mt-2">
                    {eventStats.published}
                  </div>
                </div>
                <CheckCircle className="w-12 h-12 opacity-20 group-hover:opacity-30 transition" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 border border-red-500/30 hover:border-red-400/60 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-red-100 group-hover:text-red-50 transition">
                    Suspended
                  </div>
                  <div className="text-4xl font-bold text-white mt-2">
                    {eventStats.suspended}
                  </div>
                </div>
                <AlertTriangle className="w-12 h-12 opacity-20 group-hover:opacity-30 transition" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 border border-blue-500/30 hover:border-blue-400/60 transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-blue-100 group-hover:text-blue-50 transition">
                    Total Events
                  </div>
                  <div className="text-4xl font-bold text-white mt-2">
                    {eventStats.total}
                  </div>
                </div>
                <Zap className="w-12 h-12 opacity-20 group-hover:opacity-30 transition" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[var(--admin-surface)] rounded-xl p-5 border border-[#3a1a1a] space-y-4">
            <div className="flex gap-3 flex-wrap items-end">
              <div className="flex-1 min-w-xs">
                <label className="block text-sm font-medium text-white mb-2">
                  Search Events
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-[#6b7280]" size={18} />
                  <input
                    type="text"
                    placeholder="Event name or organizer..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2.5 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white placeholder-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent transition"
                  />
                </div>
              </div>

              <div className="w-44">
                <label className="block text-sm font-medium text-white mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2.5 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent transition cursor-pointer"
                >
                  <option value="all">All Events</option>
                  <option value="PENDING_REVIEW">Pending Review</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="CANCELLED">Rejected</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>

              <div className="w-44">
                <label className="block text-sm font-medium text-white mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#3a1a1a] rounded-lg bg-[#1a0808] text-white focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:border-transparent transition cursor-pointer"
                >
                  <option value="createdAt">Recently Created</option>
                  <option value="eventDate">Event Date</option>
                  <option value="organizer">Organizer Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Events Table */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-[var(--admin-surface)] rounded-xl border border-[#3a1a1a] animate-pulse"
                />
              ))}
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="text-center py-12 bg-[var(--admin-surface)] rounded-xl border border-[#3a1a1a]">
              <Filter className="mx-auto text-[#6b7280] mb-3" size={48} />
              <p className="text-[#9ca3af] font-medium">No events found</p>
              <p className="text-sm text-[#6b7280] mt-1">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-[var(--admin-surface)] rounded-xl border border-[#3a1a1a] p-5 hover:border-[var(--admin-primary)]/50 transition-all"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Event Info */}
                    <div className="md:col-span-4">
                      <Link href={`/events/${event._id}`} target="_blank">
                        <h3 className="font-semibold text-white hover:text-[var(--admin-primary)] cursor-pointer line-clamp-2 transition">
                          {event.name}
                        </h3>
                      </Link>

                      <div className="space-y-1.5 mt-3 text-sm">
                        <div className="flex items-center gap-2 text-[#9ca3af]">
                          <Users size={16} className="flex-shrink-0" />
                          <span className="line-clamp-1">
                            {getOrganizerName(event.organizerId)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[#9ca3af]">
                          <MapPin size={16} className="flex-shrink-0" />
                          <span className="line-clamp-1">{event.hallId?.name || 'Unknown Hall'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[#9ca3af]">
                          <Calendar size={16} className="flex-shrink-0" />
                          <span>
                            {formatDate(event.eventDate || event.startDateTime)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trust Score */}
                    <div className="md:col-span-2">
                      <p className="text-xs text-[#9ca3af] mb-2 font-medium">
                        Organizer Trust
                      </p>
                      <TrustScoreBadge
                        score={
                          event.organizerId?.trustMetrics?.trustScore || 3
                        }
                      />
                    </div>

                    {/* Status & Meta */}
                    <div className="md:col-span-2 space-y-2">
                      <div>
                        <p className="text-xs text-[#9ca3af] mb-1.5 font-medium">
                          Status
                        </p>
                        <EventStatusBadge status={event.status} />
                      </div>

                      <div>
                        <p className="text-xs text-[#9ca3af] mb-1.5 font-medium">
                          Created
                        </p>
                        <p className="text-sm text-white">
                          {formatDate(event.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-4 flex gap-2">
                      {event.status === 'PENDING_REVIEW' && (
                        <>
                          <button
                            onClick={() => handleAction(event, 'approve')}
                            className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                          >
                            <CheckCircle size={16} />
                            Approve
                          </button>

                          <button
                            onClick={() => handleAction(event, 'reject')}
                            className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </>
                      )}

                      {event.status === 'PUBLISHED' && (
                        <button
                          onClick={() => handleAction(event, 'suspend')}
                          className="flex-1 px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition flex items-center justify-center gap-1"
                        >
                          <AlertTriangle size={16} />
                          Suspend
                        </button>
                      )}

                      <Link
                        href={`/admin/governance/flags?eventId=${event._id}`}
                        className="px-3 py-2 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 hover:bg-[#2a1010] rounded-lg text-sm font-medium transition text-[#9ca3af] hover:text-white"
                      >
                        Flags
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {eventsData?.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 hover:bg-[#2a1010] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-[#9ca3af] hover:text-white font-medium transition"
              >
                ← Previous
              </button>
              <span className="px-4 py-2 text-[#9ca3af] font-medium text-sm">
                Page {page} of {eventsData?.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage(Math.min(eventsData?.totalPages, page + 1))
                }
                disabled={page === eventsData?.totalPages}
                className="px-4 py-2 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 hover:bg-[#2a1010] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-[#9ca3af] hover:text-white font-medium transition"
              >
                Next →
              </button>
            </div>
          )}

          {/* Confirmation Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[var(--admin-surface)] rounded-xl p-6 w-96 space-y-4 shadow-2xl border border-[#3a1a1a]">
                <ActionBadge action={modalAction} />

                <p className="text-white font-medium text-sm">
                  {selectedEvent?.name}
                </p>

                <p className="text-sm text-[#9ca3af] leading-relaxed">
                  {modalAction === 'approve' &&
                    'This event will be published immediately and become visible to all customers.'}
                  {modalAction === 'reject' &&
                    'This event will be rejected and the organizer will be notified. The booking will remain active.'}
                  {modalAction === 'suspend' &&
                    'This event will be suspended and customers cannot book it. The organizer will be notified.'}
                </p>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={approveMutation.isPending || rejectMutation.isPending || suspendMutation.isPending}
                    className="flex-1 px-4 py-2.5 border border-[#3a1a1a] hover:border-[var(--admin-primary)]/50 hover:bg-[#2a1010] rounded-lg text-[#9ca3af] hover:text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeAction}
                    disabled={approveMutation.isPending || rejectMutation.isPending || suspendMutation.isPending}
                    className={`flex-1 px-4 py-2.5 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition ${
                      modalAction === 'approve'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : modalAction === 'reject'
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-orange-600 hover:bg-orange-700'
                    }`}
                  >
                    {(approveMutation.isPending || rejectMutation.isPending || suspendMutation.isPending)
                      ? 'Processing...'
                      : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
