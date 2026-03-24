'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import {
  useQueryOrganizerEventsReview,
} from '@queries/admin/governance.queries';
import {
  approveOrganizerEvent,
  rejectOrganizerEvent,
  suspendOrganizerEvent,
} from '@api/governance/organizer-events-api';
import { EventStatusBadge, TrustScoreBadge } from 'components/admin/governance/GovernanceComponents';
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
} from 'lucide-react';

export default function OrganizerEventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // pending, published, rejected, suspended
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, eventDate, organizer
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(''); // approve, reject, suspend

  const {
    data: eventsData,
    isLoading,
    error,
    refetch,
  } = useQueryOrganizerEventsReview({
    page,
    status: statusFilter,
    search: searchTerm,
  });

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
          return new Date(a.eventDate) - new Date(b.eventDate);
        case 'organizer':
          return (
            (a.organizer?.fullName || 'Unknown') -
            (b.organizer?.fullName || 'Unknown')
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

  if (error)
    return (
      <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg">
        <p className="text-red-800 dark:text-red-200">
          Failed to load events. Try again.
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
      <AdminTopbar heading="Event Management" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Event Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Review and approve organizer events
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Review
              </div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {eventsData?.stats?.pending || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Published
              </div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {eventsData?.stats?.published || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Suspended
              </div>
              <div className="text-3xl font-bold text-red-600 mt-2">
                {eventsData?.stats?.suspended || 0}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Events
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {eventsData?.totalCount || 0}
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
                    placeholder="Search by event name or organizer..."
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
                  <option value="pending">Pending Review</option>
                  <option value="published">Published</option>
                  <option value="rejected">Rejected</option>
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
                  <option value="createdAt">Recently Created</option>
                  <option value="eventDate">Event Date</option>
                  <option value="organizer">Organizer Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Events Table */}
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <Filter className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600 dark:text-gray-400">No events found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                    {/* Event Info */}
                    <div className="md:col-span-4">
                      <Link href={`/events/${event._id}`} target="_blank">
                        <h3 className="font-semibold text-gray-900 dark:text-white hover:text-yellow-600 cursor-pointer">
                          {event.name}
                        </h3>
                      </Link>

                      <div className="space-y-1 mt-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Users size={16} />
                          <span>
                            {event.organizer?.fullName || 'Unknown Organizer'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <MapPin size={16} />
                          <span>{event.hall?.name || 'Unknown Hall'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar size={16} />
                          <span>
                            {new Date(event.eventDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Trust Score */}
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Organizer Trust
                      </p>
                      <TrustScoreBadge
                        score={
                          event.organizer?.trustMetrics?.trustScore || 0
                        }
                      />
                    </div>

                    {/* Status & Meta */}
                    <div className="md:col-span-2 space-y-2">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Status
                        </p>
                        <EventStatusBadge status={event.status} />
                      </div>

                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Created
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(event.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-4 flex gap-2">
                      {event.status === 'pending_review' && (
                        <>
                          <button
                            onClick={() => handleAction(event, 'approve')}
                            className="flex-1 px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-800 text-sm font-medium transition"
                          >
                            <CheckCircle size={16} className="inline mr-1" />
                            Approve
                          </button>

                          <button
                            onClick={() => handleAction(event, 'reject')}
                            className="flex-1 px-3 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 text-sm font-medium transition"
                          >
                            <XCircle size={16} className="inline mr-1" />
                            Reject
                          </button>
                        </>
                      )}

                      {event.status === 'published' && (
                        <button
                          onClick={() => handleAction(event, 'suspend')}
                          className="flex-1 px-3 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-lg hover:bg-orange-700 dark:hover:bg-orange-800 text-sm font-medium transition"
                        >
                          <AlertTriangle size={16} className="inline mr-1" />
                          Suspend
                        </button>
                      )}

                      <Link
                        href={`/admin/governance/flags?eventId=${event._id}`}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium transition"
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
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Page {page} of {eventsData?.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage(Math.min(eventsData?.totalPages, page + 1))
                }
                disabled={page === eventsData?.totalPages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* Confirmation Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {modalAction === 'approve' && 'Approve Event?'}
                  {modalAction === 'reject' && 'Reject Event?'}
                  {modalAction === 'suspend' && 'Suspend Event?'}
                </h3>

                <p className="text-gray-600 dark:text-gray-400">
                  {selectedEvent?.name}
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {modalAction === 'approve' &&
                    'Event will be published and visible to customers.'}
                  {modalAction === 'reject' &&
                    'Event will be rejected and organizer will be notified.'}
                  {modalAction === 'suspend' &&
                    'Event will be suspended and customers cannot book it.'}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    disabled={approveMutation.isPending || rejectMutation.isPending || suspendMutation.isPending}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeAction}
                    disabled={approveMutation.isPending || rejectMutation.isPending || suspendMutation.isPending}
                    className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                      modalAction === 'approve'
                        ? 'bg-green-600 hover:bg-green-700'
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
