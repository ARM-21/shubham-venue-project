"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, ClipboardList, Sparkles, ShieldCheck } from "lucide-react";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import toast from "react-hot-toast";

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
  } catch {
    return "-";
  }
}

function formatDateTime(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

function statusTone(status) {
  switch (status) {
    case "approved":
      return "bg-green-50 text-green-700 border-green-200";
    case "pending":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

export default function OrganizerHubPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState([]);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const statusValue = String(status?.organizerStatus || (user?.isOrganizerEligible ? "approved" : user?.organizerStatus || "none")).toLowerCase();
  const isApproved = status?.isOrganizerEligible || statusValue === "approved" || user?.isOrganizerEligible;

  useEffect(() => {
    let ignore = false;
    async function fetchStatus() {
      try {
        setStatusLoading(true);
        const res = await axiosInstance.get(ROUTES.API.ORGANIZER_REQUESTS.ME);
        if (!ignore) setStatus(res.data || null);
      } catch (err) {
        if (!ignore) setStatus(null);
      } finally {
        if (!ignore) setStatusLoading(false);
      }
    }

    if (user) fetchStatus();

    return () => {
      ignore = true;
    };
  }, [user]);

  useEffect(() => {
    let ignore = false;
    async function fetchDashboard() {
      try {
        setDashboardLoading(true);
        const [eventsRes, bookingsRes] = await Promise.all([
          axiosInstance.get(ROUTES.API.ORGANIZER.EVENTS),
          axiosInstance.get(ROUTES.API.ORGANIZER.BOOKINGS, { params: { eligibleForEvent: true } }),
        ]);
        if (!ignore) {
          setEvents(eventsRes.data?.events || []);
          setEligibleBookings(bookingsRes.data?.bookings || []);
        }
      } catch (err) {
        if (!ignore) {
          toast.error(err?.response?.data?.message || "Failed to load organizer dashboard");
        }
      } finally {
        if (!ignore) setDashboardLoading(false);
      }
    }

    if (isApproved) fetchDashboard();

    return () => {
      ignore = true;
    };
  }, [isApproved]);

  const stats = useMemo(() => {
    const total = events.length;
    const published = events.filter((e) => e.status === "PUBLISHED").length;
    const draft = events.filter((e) => e.status === "DRAFT").length;
    return { total, published, draft, eligibleBookings: eligibleBookings.length };
  }, [events, eligibleBookings]);

  async function submitRequest() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = { note: note.trim() };
      const res = await axiosInstance.post(ROUTES.API.ORGANIZER_REQUESTS.ROOT, payload);
      setStatus(res.data || null);
      toast.success("Organizer request submitted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  }

  const recentEvents = events.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500">Organizer Hub</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Manage events, tickets, and check-ins</h1>
            <p className="text-sm text-gray-600 mt-2">Apply for organizer access or jump into your dashboard if approved.</p>
          </div>
          {isApproved && (
            <button
              onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW)}
              className="px-4 py-2.5 bg-[#8B0000] text-white rounded-lg text-sm font-semibold hover:bg-[#A52A2A] transition"
            >
              Create Event
            </button>
          )}
        </div>
      </div>

      <div className={`border rounded-2xl p-6 ${statusTone(statusValue)}`}>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Organizer Request Status</h2>
            {statusLoading ? (
              <p className="text-sm mt-2">Checking your status...</p>
            ) : (
              <p className="text-sm mt-2">
                {statusValue === "approved"
                  ? "You are approved as an organizer. You can create events and manage tickets."
                  : statusValue === "pending"
                  ? "Your organizer request is under review. You will be notified once approved."
                  : statusValue === "rejected"
                  ? "Your organizer request was rejected. You can update your note and resubmit."
                  : "Submit a request to become an organizer."}
              </p>
            )}

            {status?.organizerNote && statusValue !== "approved" && (
              <div className="mt-3 text-sm text-gray-700">
                <span className="font-semibold">Note:</span> {status.organizerNote}
              </div>
            )}

            {status?.organizerRequestedAt && statusValue !== "approved" ? (
              <div className="mt-2 text-xs text-gray-600">
                Requested on {formatDateTime(status.organizerRequestedAt)}
              </div>
            ) : null}

            {!isApproved && (
              <div className="mt-4">
                <label className="text-sm font-medium">Tell us about your event experience</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B0000]/20"
                  placeholder="Describe the kind of events you want to organize..."
                  disabled={statusValue === "pending"}
                />
                <button
                  onClick={submitRequest}
                  disabled={submitting || statusValue === "pending"}
                  className="mt-3 px-4 py-2 bg-[#8B0000] text-white rounded-lg text-sm font-semibold hover:bg-[#A52A2A] transition disabled:opacity-60"
                >
                  {statusValue === "pending" ? "Request Pending" : submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isApproved && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Eligible bookings</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardLoading ? "..." : stats.eligibleBookings}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Total events</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardLoading ? "..." : stats.total}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Published</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardLoading ? "..." : stats.published}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Drafts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{dashboardLoading ? "..." : stats.draft}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Events</h3>
                <p className="text-sm text-gray-600">Quick access to your latest events.</p>
              </div>
              <button
                onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)}
                className="text-sm font-semibold text-[#8B0000] hover:underline"
              >
                View all
              </button>
            </div>

            {dashboardLoading ? (
              <div className="text-sm text-gray-600">Loading events...</div>
            ) : recentEvents.length === 0 ? (
              <div className="text-sm text-gray-600">No events yet. Create your first event.</div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event._id} className="border border-gray-100 rounded-lg p-4 flex flex-wrap gap-4 justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{event.name}</p>
                      <p className="text-sm text-gray-600">{event.type || "Event"} · {event.isPublic ? "Public" : "Private"}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Status: <span className="font-semibold">{event.status}</span></p>
                      <p>{event.startDateTime ? formatDate(event.startDateTime) : "-"}</p>
                    </div>
                    <button
                      onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_DETAIL(event._id))}
                      className="text-sm font-semibold text-[#8B0000] hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-gray-700">
                <CalendarCheck className="w-5 h-5" />
                <h4 className="font-semibold">Create events</h4>
              </div>
              <p className="text-sm text-gray-600 mt-2">Use a confirmed booking to launch a new event.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-gray-700">
                <ClipboardList className="w-5 h-5" />
                <h4 className="font-semibold">Manage tickets</h4>
              </div>
              <p className="text-sm text-gray-600 mt-2">Create ticket tiers, set pricing, and control capacity.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2 text-gray-700">
                <Sparkles className="w-5 h-5" />
                <h4 className="font-semibold">Check-in guests</h4>
              </div>
              <p className="text-sm text-gray-600 mt-2">Validate tickets instantly during the event.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
