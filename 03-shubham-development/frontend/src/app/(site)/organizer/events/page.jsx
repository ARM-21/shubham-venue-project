"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, PlusCircle } from "lucide-react";
import axiosInstance from "@/lib/axios";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/contexts/AuthProvider";
import toast from "react-hot-toast";

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
  } catch {
    return "-";
  }
}

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const isOrganizer = Boolean(user?.isOrganizerEligible) || user?.role?.toLowerCase?.() === "admin";

  useEffect(() => {
    let ignore = false;
    async function fetchEvents() {
      try {
        setLoading(true);
        const params = statusFilter !== "all" ? { status: statusFilter } : undefined;
        const res = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENTS, { params });
        if (!ignore) setEvents(res.data?.events || []);
      } catch (err) {
        if (!ignore) toast.error(err?.response?.data?.message || "Failed to load events");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (isOrganizer) fetchEvents();

    return () => {
      ignore = true;
    };
  }, [statusFilter, isOrganizer]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return events;
    return events.filter((event) => event.status === statusFilter);
  }, [events, statusFilter]);

  if (!isOrganizer) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900">Organizer access required</h2>
        <p className="text-sm text-gray-600 mt-2">Submit your organizer request to unlock event management.</p>
        <button
          onClick={() => router.push(ROUTES.SITE.ORGANIZER)}
          className="mt-4 px-4 py-2 bg-[#8B0000] text-white rounded-lg text-sm font-semibold"
        >
          Go to Organizer Hub
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500">Organizer</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">My Events</h1>
          <p className="text-sm text-gray-600">Manage your event listings and ticketing.</p>
        </div>
        <button
          onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW)}
          className="px-4 py-2.5 bg-[#8B0000] text-white rounded-lg text-sm font-semibold hover:bg-[#A52A2A] transition flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Create Event
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button
          onClick={() => setStatusFilter("all")}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          Reset
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-sm text-gray-600">Loading events...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-sm text-gray-600">No events found.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((event) => (
            <div key={event._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-600">{event.type || "Event"}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                  {event.status}
                </span>
              </div>
              <div className="mt-4 text-sm text-gray-600 space-y-1">
                <p>Visibility: {event.isPublic ? "Public" : "Private"}</p>
                <p>Start: {event.startDateTime ? formatDate(event.startDateTime) : "-"}</p>
                <p>Hall: {event.hallId?.name || "-"}</p>
                <p>Booking: {event.bookingId?.date ? formatDate(event.bookingId.date) : "-"}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CalendarCheck className="w-4 h-4" />
                  {event.bookingId?.status || "-"}
                </div>
                <button
                  onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_DETAIL(event._id))}
                  className="text-sm font-semibold text-[#8B0000] hover:underline"
                >
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
