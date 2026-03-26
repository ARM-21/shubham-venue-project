"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminTopbar from "components/admin/dashboard/AdminTopbar";
import toast from "react-hot-toast";
import { ROUTES } from "config/routes";
import axiosInstance from "lib/axios";
import { ChevronRight, Plus } from "lucide-react";

export default function EventStaffPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      // Fetch ALL upcoming events from admin endpoint (system-wide)
      const response = await axiosInstance.get(ROUTES.API.ADMIN.EVENTS_ALL);
      const allEvents = response.data.events || [];
      
      // Map governance endpoint response to expected structure
      const mappedEvents = allEvents.map((event) => ({
        _id: event._id,
        eventName: event.name,
        eventType: event.type,
        eventDate: event.eventDate || event.bookingId?.date || event.startDateTime,
        totalGuests: event.expectedAttendees || 0,
        hallName: event.hallId?.name || 'N/A',
        organizer: event.organizerId ? {
          first_name: event.organizerId.firstName,
          last_name: event.organizerId.lastName,
          email: event.organizerId.email,
        } : {},
      }));
      
      // Filter for upcoming events only
      const upcoming = mappedEvents.filter((event) => {
        const eventDate = event.eventDate ? new Date(event.eventDate) : null;
        return eventDate && eventDate > new Date();
      }).sort((a, b) => {
        const dateA = new Date(a.eventDate);
        const dateB = new Date(b.eventDate);
        return dateA - dateB;
      });

      setEvents(upcoming);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Event Staff Management" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto">
          {/* Header with refresh */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Manage Event Scanners
              </h2>
              <p className="text-[var(--admin-muted)]">
                Assign staff members to scan tickets at all system events
              </p>
              <p className="text-xs text-[var(--admin-muted)] mt-2">
                💡 Shows all upcoming events created by organizers. Click an event to assign scanner staff with specific gate access.
              </p>
            </div>
            <button
              onClick={fetchEvents}
              className="px-4 py-2 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/90 text-white rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin">
                <div className="h-8 w-8 border-4 border-[var(--admin-primary)] border-t-transparent rounded-full"></div>
              </div>
              <p className="text-[var(--admin-muted)] mt-4">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-[var(--admin-surface)] rounded-lg">
              <p className="text-[var(--admin-muted)] mb-4">
                No upcoming events found
              </p>
              <button
                onClick={() =>
                  router.push(ROUTES.SITE.ORGANIZER_EVENTS)
                }
                className="text-[var(--admin-primary)] hover:underline"
              >
                Create an event
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onManage={() =>
                    router.push(
                      ROUTES.ADMIN.EVENT_STAFF_DETAIL(event._id)
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, onManage }) {
  const guests = event.totalGuests || 0;
  const organizer = event.organizer || {};
  const eventDate = new Date(event.eventDate);
  const isToday = eventDate.toDateString() === new Date().toDateString();
  const isSoon =
    (eventDate - new Date()) / (1000 * 60 * 60) < 24;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-lg overflow-hidden hover:border-[var(--admin-primary)]/50 transition-colors">
      {/* Card Header */}
      <div className="p-4 border-b border-[#3a1a1a] bg-gradient-to-r from-[var(--admin-primary)]/10 to-transparent">
        <h3 className="text-lg font-bold text-white truncate">
          {event.eventName}
        </h3>
        <p className="text-sm text-[var(--admin-muted)] mt-1">
          {event.eventType}
        </p>
        {organizer?.first_name && (
          <p className="text-xs text-[var(--admin-muted)] mt-2">
            📧 {organizer.first_name} {organizer.last_name}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-[var(--admin-muted)] uppercase tracking-wide">
            Event Details
          </p>
          <p className="text-sm text-white mt-1">
            📅 {formatDate(event.eventDate)} at{" "}
            {formatTime(event.eventDate)}
          </p>
          <p className="text-sm text-white mt-1">
            👥 {guests} guests
          </p>
          {event.hallName && (
            <p className="text-sm text-white mt-1">
              📍 {event.hallName}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex gap-2">
          {isToday && (
            <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-200 rounded">
              Today
            </span>
          )}
          {isSoon && !isToday && (
            <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-200 rounded">
              Within 24h
            </span>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-[#1a0a0a]/50 border-t border-[#3a1a1a]">
        <button
          onClick={onManage}
          className="w-full flex items-center justify-between px-3 py-2 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary)]/90 text-white rounded transition-colors text-sm font-medium group"
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Manage Staff
          </span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
