"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import { submitOrganizerRequestMutator } from "@api/organizer/organizer-request-submit-mutator";
import { useQueryOrganizerStatus } from "@queries/organizer/status";
import { useQueryOrganizerEvents } from "@queries/organizer/events";
import { useQueryOrganizerBookings } from "@queries/organizer/bookings";
import { useQueryOrganizerAnalytics } from "@queries/organizer/analytics";
import { useQueryOrganizerReputation } from "@queries/organizer/reputation";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ClipboardCheck,
  Plus,
  ShieldCheck,
  Ticket,
  Users,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

function statusLabel(status) {
  const value = String(status || "").toLowerCase().replace(/_/g, " ");
  return value || "unknown";
}

function StatusPill({ status }) {
  const value = String(status || "none").toLowerCase();
  const classes = {
    approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    rejected: "border-red-200 bg-red-50 text-red-700",
    none: "border-[#eadfcb] bg-[#fdfaf6] text-[#3a1224]/60",
  };
  return (
    <span className={`inline-flex border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${classes[value] || classes.none}`}>
      {value === "approved" ? "Approved" : value === "pending" ? "Under review" : value === "rejected" ? "Action needed" : "Not applied"}
    </span>
  );
}

function eventStatusTone(status) {
  switch (String(status).toUpperCase()) {
    case "PUBLISHED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "DRAFT":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "CANCELLED":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "PENDING_REVIEW":
      return "border-sky-200 bg-sky-50 text-sky-700";
    default:
      return "border-[#e8dcc8] bg-[#fbf8f2] text-[#3a1224]/60";
  }
}

export default function OrganizerHubPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  const { data: statusData, isLoading: statusLoading } = useQueryOrganizerStatus({ enabled: !!user });
  const { data: eventsData, isLoading: eventsLoading } = useQueryOrganizerEvents({ enabled: !!statusData?.isOrganizerEligible });
  const { data: bookingsData, isLoading: bookingsLoading } = useQueryOrganizerBookings({ params: { eligibleForEvent: true }, enabled: !!statusData?.isOrganizerEligible });
  const { data: analyticsData, isLoading: analyticsLoading } = useQueryOrganizerAnalytics({ enabled: !!statusData?.isOrganizerEligible });
  const { data: reputationData, isLoading: reputationLoading } = useQueryOrganizerReputation({ enabled: !!statusData?.isOrganizerEligible });

  const submitRequestMutation = useMutation({
    mutationFn: submitOrganizerRequestMutator,
    onSuccess: () => {
      toast.success("Application submitted successfully");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["organizer-status"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to submit application");
    },
  });

  const status = statusData;
  const events = Array.isArray(eventsData?.events) ? eventsData.events : [];
  const eligibleBookings = Array.isArray(bookingsData?.bookings) ? bookingsData.bookings : [];
  const analytics = analyticsData?.stats || analyticsData || {};
  const statusValue = String(status?.organizerStatus || (user?.isOrganizerEligible ? "approved" : user?.organizerStatus || "none")).toLowerCase();
  const isApproved = status?.isOrganizerEligible || statusValue === "approved" || user?.isOrganizerEligible;
  const dashboardLoading = eventsLoading || bookingsLoading || analyticsLoading;

  const trustScore = reputationData?.reputation?.trustScore ?? null;
  const approvalRate = reputationData?.eventStats?.approvalRate ?? null;
  const openFlags = reputationData?.flags?.open ?? 0;

  const stats = useMemo(() => {
    const published = events.filter((event) => event.status === "PUBLISHED").length;
    const draft = events.filter((event) => event.status === "DRAFT").length;
    const inReview = events.filter((event) => event.status === "PENDING_REVIEW").length;
    return { total: events.length, published, draft, inReview, bookings: eligibleBookings.length };
  }, [events, eligibleBookings]);

  const recentEvents = events.slice(0, 5);
  const bookingPreview = eligibleBookings.slice(0, 3);
  const publishedRatio = stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0;

  function submitRequest() {
    if (submitRequestMutation.isPending || statusValue === "pending") return;
    submitRequestMutation.mutate({ note: note.trim() });
  }

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-6 pb-8">
      {!isApproved ? (
        <UnapprovedDashboard
          statusValue={statusValue}
          status={status}
          note={note}
          setNote={setNote}
          submitRequest={submitRequest}
          isSubmitting={submitRequestMutation.isPending || statusLoading}
        />
      ) : (
        <>
          <section className="overflow-hidden border border-[#e8dcc8] bg-white">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="px-5 py-6 sm:px-7 lg:px-8 lg:py-8">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">Organizer workspace</p>
                  <StatusPill status={statusValue} />
                </div>
                <div className="mt-5 max-w-3xl">
                  <h1 className="text-3xl font-black leading-tight text-[#3a1224] sm:text-4xl">
                    Good to see you, {user?.first_name || "Organizer"}.
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#3a1224]/58">
                    Keep an eye on events, bookings, guest flow, and reputation from one working dashboard.
                  </p>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW)}
                    className="inline-flex h-11 items-center justify-center gap-2 bg-[#3a1224] px-5 text-sm font-bold text-white transition hover:bg-[#4b1830]"
                  >
                    <Plus className="h-4 w-4" />
                    Create event
                  </button>
                  <button
                    onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)}
                    className="inline-flex h-11 items-center justify-center gap-2 border border-[#e8dcc8] bg-white px-5 text-sm font-bold text-[#3a1224] transition hover:bg-[#fbf8f2]"
                  >
                    Review events
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-[#e8dcc8] bg-[#fbf8f2] p-5 lg:border-l lg:border-t-0 lg:p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/42">Current readiness</p>
                <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden border border-[#e8dcc8] bg-[#e8dcc8]">
                  <ReadinessCell label="Trust" value={reputationLoading ? "-" : trustScore != null ? trustScore : "N/A"} helper="score" />
                  <ReadinessCell label="Approval" value={reputationLoading ? "-" : approvalRate != null ? `${approvalRate}%` : "N/A"} helper="events" />
                </div>
                <div className={`mt-4 border px-4 py-3 ${openFlags > 0 ? "border-rose-200 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
                  <div className="flex items-start gap-3">
                    {openFlags > 0 ? <AlertTriangle className="mt-0.5 h-4 w-4 text-rose-700" /> : <ShieldCheck className="mt-0.5 h-4 w-4 text-emerald-700" />}
                    <div>
                      <p className={`text-sm font-black ${openFlags > 0 ? "text-rose-800" : "text-emerald-800"}`}>
                        {openFlags > 0 ? `${openFlags} open flag${openFlags !== 1 ? "s" : ""}` : "No open flags"}
                      </p>
                      <p className={`mt-0.5 text-xs ${openFlags > 0 ? "text-rose-700/75" : "text-emerald-700/75"}`}>
                        {openFlags > 0 ? "Review issues before publishing more events." : "Your organizer account is in good standing."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Published events"
                value={dashboardLoading ? "-" : stats.published}
                helper={`${stats.draft} draft / ${stats.inReview} in review`}
                icon={CalendarDays}
                emphasis
              />
              <MetricCard
                label="Eligible bookings"
                value={dashboardLoading ? "-" : stats.bookings}
                helper="Can be turned into events"
                icon={ClipboardCheck}
              />
              <MetricCard
                label="Attendees"
                value={dashboardLoading ? "-" : analytics.totalAttendees ?? 0}
                helper="Across all events"
                icon={Users}
              />
              <MetricCard
                label="Check-in rate"
                value={dashboardLoading ? "-" : `${analytics.checkInRate ?? 0}%`}
                helper="From available ticket data"
                icon={Ticket}
              />
            </div>

            <div className="border border-[#e8dcc8] bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/42">Publishing mix</p>
                <span className="text-sm font-black text-[#3a1224]">{publishedRatio}%</span>
              </div>
              <div className="mt-4 h-2 bg-[#f1e8da]">
                <div className="h-full bg-[#3a1224]" style={{ width: `${publishedRatio}%` }} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <StatusCount label="Published" value={stats.published} tone="text-emerald-700" />
                <StatusCount label="Draft" value={stats.draft} tone="text-amber-700" />
                <StatusCount label="Review" value={stats.inReview} tone="text-sky-700" />
              </div>
            </div>
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="overflow-hidden border border-[#e8dcc8] bg-white">
              <div className="flex items-center justify-between border-b border-[#e8dcc8] px-5 py-4 sm:px-6">
                <div>
                  <h2 className="text-base font-black text-[#3a1224]">Recent events</h2>
                  <p className="mt-1 text-xs text-[#3a1224]/45">Open an event to manage tickets, check-in, and publication details.</p>
                </div>
                <button
                  onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)}
                  className="hidden text-sm font-bold text-[#3a1224]/55 hover:text-[#3a1224] sm:inline-flex"
                >
                  View all
                </button>
              </div>

              {recentEvents.length ? (
                <div className="divide-y divide-[#e8dcc8]">
                  <div className="hidden grid-cols-[minmax(0,1fr)_130px_130px_40px] gap-4 bg-[#fbf8f2] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/35 md:grid sm:px-6">
                    <span>Event</span>
                    <span>Date</span>
                    <span>Status</span>
                    <span />
                  </div>
                  {recentEvents.map((event) => (
                    <button
                      key={event._id}
                      onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_DETAIL(event._id))}
                      className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-[#fbf8f2] md:grid-cols-[minmax(0,1fr)_130px_130px_40px] md:items-center sm:px-6"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#3a1224]">{event.name}</p>
                        <p className="mt-1 truncate text-xs capitalize text-[#3a1224]/45">
                          {event.type ? String(event.type).replace(/_/g, " ") : "Event"}
                        </p>
                      </div>
                      <p className="text-xs font-bold text-[#3a1224]/50">{formatDate(event.startDateTime || event.bookingId?.date)}</p>
                      <span className={`w-fit border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${eventStatusTone(event.status)}`}>
                        {statusLabel(event.status)}
                      </span>
                      <ChevronRight className="hidden h-4 w-4 justify-self-end text-[#3a1224]/25 md:block" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-5 py-14 text-center sm:px-6">
                  <CalendarDays className="mx-auto h-8 w-8 text-[#3a1224]/20" />
                  <p className="mt-3 text-sm font-black text-[#3a1224]">No events yet</p>
                  <p className="mt-1 text-sm text-[#3a1224]/45">Start with an eligible booking, then create the public event listing.</p>
                  <button
                    onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW)}
                    className="mt-5 inline-flex h-10 items-center bg-[#3a1224] px-4 text-sm font-bold text-white hover:bg-[#4b1830]"
                  >
                    Create event
                  </button>
                </div>
              )}
            </section>

            <aside className="flex flex-col gap-5">
              <section className="border border-[#e8dcc8] bg-white">
                <div className="border-b border-[#e8dcc8] px-5 py-4">
                  <h2 className="text-base font-black text-[#3a1224]">Next actions</h2>
                </div>
                <div className="divide-y divide-[#e8dcc8]">
                  <ActionButton label="Create an event" helper="Use an eligible booking" onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW)} />
                  <ActionButton label="Manage event list" helper="Edit, duplicate, export" onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)} />
                  <ActionButton label="Open analytics" helper="Review ticket and check-in trends" onClick={() => router.push("/organizer-hub/analytics")} />
                </div>
              </section>

              <section className="border border-[#e8dcc8] bg-white">
                <div className="flex items-center justify-between border-b border-[#e8dcc8] px-5 py-4">
                  <h2 className="text-base font-black text-[#3a1224]">Eligible bookings</h2>
                  <span className="text-xs font-black text-[#3a1224]/40">{stats.bookings}</span>
                </div>
                {bookingPreview.length ? (
                  <div className="divide-y divide-[#e8dcc8]">
                    {bookingPreview.map((booking) => (
                      <button
                        key={booking._id}
                        onClick={() => router.push(`${ROUTES.SITE.ORGANIZER_EVENT_NEW}?bookingId=${booking._id}`)}
                        className="w-full px-5 py-4 text-left hover:bg-[#fbf8f2]"
                      >
                        <p className="truncate text-sm font-black text-[#3a1224]">{booking.hallId?.name || "Venue booking"}</p>
                        <p className="mt-1 text-xs text-[#3a1224]/48">
                          {formatDate(booking.date)} / {booking.guests || 0} guests
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-8">
                    <Clock3 className="h-6 w-6 text-[#3a1224]/22" />
                    <p className="mt-3 text-sm font-bold text-[#3a1224]">No eligible bookings</p>
                    <p className="mt-1 text-xs leading-5 text-[#3a1224]/45">Confirmed venue bookings that can become events will appear here.</p>
                  </div>
                )}
              </section>
            </aside>
          </section>
        </>
      )}
    </main>
  );
}

function UnapprovedDashboard({ statusValue, status, note, setNote, submitRequest, isSubmitting }) {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="border border-[#e8dcc8] bg-white">
        <div className="px-5 py-6 sm:px-7 lg:px-8 lg:py-8">
          <StatusPill status={statusValue} />
          <h1 className="mt-5 max-w-2xl text-3xl font-black leading-tight text-[#3a1224] sm:text-4xl">
            {statusValue === "pending" ? "Your organizer application is being reviewed." : "Apply to start publishing events."}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#3a1224]/58">
            {statusValue === "pending"
              ? "Once approved, this dashboard will unlock event creation, ticket inventory, check-in tools, and performance reporting."
              : "Tell the admin team what you plan to host. Approval keeps event listings reliable for guests and venue partners."}
          </p>

          {status?.organizerNote ? (
            <div className="mt-6 border border-[#eadfcb] bg-[#fbf8f2] p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/42">Application note</p>
              <p className="mt-2 text-sm leading-6 text-[#3a1224]/70">{status.organizerNote}</p>
            </div>
          ) : null}

          {statusValue !== "pending" ? (
            <div className="mt-6">
              <label className="block">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/45">Note for admin</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={5}
                  placeholder="Example: We host corporate workshops and plan to sell tickets for confirmed venue bookings."
                  className="mt-2 w-full resize-none border border-[#e8dcc8] bg-white px-4 py-3 text-sm leading-6 text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15"
                />
              </label>
              <button
                onClick={submitRequest}
                disabled={isSubmitting}
                className="mt-4 h-11 bg-[#3a1224] px-5 text-sm font-bold text-white transition hover:bg-[#4b1830] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Apply for access"}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <aside className="border border-[#e8dcc8] bg-[#fbf8f2] p-5">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/42">After approval</p>
        <div className="mt-5 space-y-4">
          {[
            ["Create events", "Convert confirmed venue bookings into public listings."],
            ["Sell tickets", "Set tiers, inventory, and registration windows."],
            ["Manage entry", "Validate QR codes and monitor attendees."],
            ["Track performance", "Review check-ins, registrations, and trust signals."],
          ].map(([title, helper]) => (
            <div key={title} className="border-l-2 border-[#C0A04C] pl-4">
              <p className="text-sm font-black text-[#3a1224]">{title}</p>
              <p className="mt-1 text-xs leading-5 text-[#3a1224]/50">{helper}</p>
            </div>
          ))}
        </div>
      </aside>
    </section>
  );
}

function ReadinessCell({ label, value, helper }) {
  return (
    <div className="bg-white px-4 py-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">{label}</p>
      <p className="mt-1 text-2xl font-black text-[#3a1224]">{value}</p>
      <p className="mt-0.5 text-xs text-[#3a1224]/40">{helper}</p>
    </div>
  );
}

function MetricCard({ label, value, helper, icon: Icon, emphasis = false }) {
  return (
    <div className={`border p-5 ${emphasis ? "border-[#3a1224] bg-[#3a1224] text-white" : "border-[#e8dcc8] bg-white text-[#3a1224]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${emphasis ? "text-white/55" : "text-[#3a1224]/40"}`}>{label}</p>
          <p className="mt-3 text-3xl font-black">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center border ${emphasis ? "border-white/15 bg-white/10" : "border-[#e8dcc8] bg-[#fbf8f2]"}`}>
          <Icon className={`h-5 w-5 ${emphasis ? "text-[#C0A04C]" : "text-[#3a1224]/45"}`} />
        </div>
      </div>
      <p className={`mt-3 text-xs leading-5 ${emphasis ? "text-white/60" : "text-[#3a1224]/45"}`}>{helper}</p>
    </div>
  );
}

function StatusCount({ label, value, tone }) {
  return (
    <div>
      <p className={`font-black ${tone}`}>{value}</p>
      <p className="mt-0.5 text-[#3a1224]/42">{label}</p>
    </div>
  );
}

function ActionButton({ label, helper, onClick }) {
  return (
    <button onClick={onClick} className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#fbf8f2]">
      <span>
        <span className="block text-sm font-black text-[#3a1224]">{label}</span>
        <span className="mt-1 block text-xs text-[#3a1224]/45">{helper}</span>
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-[#3a1224]/25 group-hover:text-[#3a1224]" />
    </button>
  );
}
