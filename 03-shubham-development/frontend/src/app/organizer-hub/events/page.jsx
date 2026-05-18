"use client";

import {
  CalendarDays,
  CheckSquare,
  ChevronRight,
  ClipboardList,
  Copy,
  Download,
  Fingerprint,
  Plus,
  Square,
  Ticket,
  Users,
} from "lucide-react";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import toast from "react-hot-toast";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import EventSearchFilter from "components/organizer/EventSearchFilter";
import BulkActionsToolbar from "components/organizer/BulkActionsToolbar";
import EmptyState from "components/organizer/EmptyState";
import { HelpToast } from "components/organizer/Tooltip";
import { exportEvents } from "lib/organizerUtils";
import { eventDuplicateMutator } from "@api/organizer/event-duplicate-mutator";
import { eventDeleteMutator } from "@api/organizer/event-delete-mutator";
import { useQueryOrganizerStatus } from "@queries/organizer/status";
import { useQueryOrganizerEvents } from "@queries/organizer/events";

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      weekday: "short",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

function statusTone(status) {
  switch (status?.toUpperCase()) {
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

function cleanStatus(status) {
  return String(status || "unknown").toLowerCase().replace(/_/g, " ");
}

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [showFirstTimeHelpToast, setShowFirstTimeHelpToast] = useState(false);

  const { data: statusData, isLoading: statusLoading } = useQueryOrganizerStatus({ enabled: !!user });
  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useQueryOrganizerEvents({
    params: statusFilter !== "all" ? { status: statusFilter } : undefined,
    enabled: !!statusData?.isOrganizerEligible,
  });

  const duplicateEventMutation = useMutation({
    mutationFn: eventDuplicateMutator,
    onSuccess: () => {
      toast.success("Event duplicated");
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      refetchEvents();
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to duplicate event"),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids) => {
      if (!Array.isArray(ids) || ids.length === 0) throw new Error("Event IDs array required");
      return Promise.all(ids.map((id) => eventDeleteMutator(id)));
    },
    onSuccess: () => {
      toast.success("Event deleted");
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ["organizer-events"] });
      refetchEvents();
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Failed to delete event"),
  });

  const events = eventsData?.events || [];
  const loading = statusLoading || eventsLoading;
  const statusValue = String(statusData?.organizerStatus || (user?.isOrganizerEligible ? "approved" : user?.organizerStatus || "none")).toLowerCase();
  const isApproved = statusData?.isOrganizerEligible || statusValue === "approved" || user?.isOrganizerEligible;

  const filteredEvents = useMemo(() => {
    let filtered = events;
    if (statusFilter !== "all") filtered = filtered.filter((event) => event.status?.toUpperCase() === statusFilter.toUpperCase());
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((event) => event.name?.toLowerCase().includes(q) || event.type?.toLowerCase().includes(q));
    }
    return filtered;
  }, [events, statusFilter, searchQuery]);

  const counts = useMemo(() => {
    const published = events.filter((event) => event.status === "PUBLISHED").length;
    const draft = events.filter((event) => event.status === "DRAFT").length;
    const review = events.filter((event) => event.status === "PENDING_REVIEW").length;
    const cancelled = events.filter((event) => event.status === "CANCELLED").length;
    const guests = events.reduce((sum, event) => sum + Number(event.expectedAttendees || event.maxAttendees || 0), 0);
    return { total: events.length, published, draft, review, cancelled, guests };
  }, [events]);

  const nextEvent = useMemo(() => {
    const now = Date.now();
    return [...events]
      .filter((event) => {
        const date = new Date(event.startDateTime || event.bookingId?.date).getTime();
        return Number.isFinite(date) && date >= now;
      })
      .sort((a, b) => new Date(a.startDateTime || a.bookingId?.date) - new Date(b.startDateTime || b.bookingId?.date))[0];
  }, [events]);

  const toggleSelect = (eventId) => {
    const next = new Set(selected);
    if (next.has(eventId)) next.delete(eventId);
    else next.add(eventId);
    setSelected(next);
  };

  const selectAll = () => setSelected(new Set(filteredEvents.map((event) => event._id)));
  const clearSelection = () => setSelected(new Set());

  const handleDuplicate = () => {
    const selectedArray = Array.from(selected);
    if (selectedArray.length !== 1) {
      toast.error("Select one event to duplicate");
      return;
    }
    duplicateEventMutation.mutate(selectedArray[0]);
  };

  const handleBulkDelete = () => {
    if (selected.size === 0) {
      toast.error("Select at least one event");
      return;
    }
    if (!confirm(`Delete ${selected.size} event(s)? This cannot be undone.`)) return;
    bulkDeleteMutation.mutate(Array.from(selected));
  };

  const handleExport = () => {
    const selectedArray = Array.from(selected);
    const eventsToExport = selectedArray.length > 0 ? events.filter((event) => selected.has(event._id)) : filteredEvents;
    if (eventsToExport.length === 0) {
      toast.error("No events to export");
      return;
    }
    exportEvents(eventsToExport);
    toast.success(`Exported ${eventsToExport.length} event(s)`);
  };

  useEffect(() => {
    if (!eventsLoading && events.length === 0) {
      const hasSeenHelp = localStorage.getItem("organizer-events-help-shown");
      if (!hasSeenHelp) {
        setShowFirstTimeHelpToast(true);
        localStorage.setItem("organizer-events-help-shown", "true");
      }
    }
  }, [events.length, eventsLoading]);

  if (!isApproved) {
    return (
      <div className="mx-auto max-w-2xl py-16">
        <div className="border border-[#e8dcc8] bg-white p-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-[#e8dcc8] bg-[#fbf8f2]">
            <Fingerprint className="h-7 w-7 text-[#3a1224]" />
          </div>
          <h2 className="text-2xl font-black text-[#3a1224]">Verification required</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#3a1224]/60">
            You need verified organizer access before managing event listings.
          </p>
          <button onClick={() => router.push(ROUTES.SITE.ORGANIZER)} className="mt-7 bg-[#3a1224] px-6 py-3 text-sm font-bold text-white hover:bg-[#4b1830]">
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 pb-10">
      {showFirstTimeHelpToast && events.length === 0 && (
        <HelpToast
          title="Create your first event"
          message="Events are built from confirmed hall bookings. Start with a booking, then add ticket inventory and publication details."
          onDismiss={() => setShowFirstTimeHelpToast(false)}
          autoClose={8000}
        />
      )}

      <section className="overflow-hidden border border-[#e8dcc8] bg-white">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="px-5 py-6 sm:px-7 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">Event operations</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-[#3a1224] sm:text-4xl">My events</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#3a1224]/58">
              Manage live listings, draft work, ticket capacity, and event-day readiness from one register.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW)} className="inline-flex h-11 items-center justify-center gap-2 bg-[#3a1224] px-5 text-sm font-bold text-white hover:bg-[#4b1830]">
                <Plus className="h-4 w-4" />
                Create event
              </button>
              <button onClick={handleExport} disabled={filteredEvents.length === 0} className="inline-flex h-11 items-center justify-center gap-2 border border-[#e8dcc8] bg-white px-5 text-sm font-bold text-[#3a1224] hover:bg-[#fbf8f2] disabled:opacity-45">
                <Download className="h-4 w-4" />
                Export list
              </button>
            </div>
          </div>

          <div className="border-t border-[#e8dcc8] bg-[#fbf8f2] p-5 lg:border-l lg:border-t-0 lg:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/42">Next scheduled</p>
            {nextEvent ? (
              <button onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_DETAIL(nextEvent._id))} className="mt-4 block w-full border border-[#e8dcc8] bg-white p-4 text-left hover:bg-[#fffdf9]">
                <p className="truncate text-base font-black text-[#3a1224]">{nextEvent.name}</p>
                <p className="mt-2 text-sm font-bold text-[#3a1224]/55">{formatDate(nextEvent.startDateTime || nextEvent.bookingId?.date)}</p>
                <span className={`mt-4 inline-flex border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${statusTone(nextEvent.status)}`}>
                  {cleanStatus(nextEvent.status)}
                </span>
              </button>
            ) : (
              <div className="mt-4 border border-dashed border-[#e8dcc8] bg-white p-5">
                <CalendarDays className="h-6 w-6 text-[#3a1224]/25" />
                <p className="mt-3 text-sm font-black text-[#3a1224]">No upcoming event</p>
                <p className="mt-1 text-xs leading-5 text-[#3a1224]/45">Published or scheduled events will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total" value={counts.total} helper="All event records" icon={ClipboardList} loading={loading} emphasis />
        <MetricCard label="Published" value={counts.published} helper="Visible to guests" icon={CalendarDays} loading={loading} />
        <MetricCard label="Draft" value={counts.draft} helper="Needs finishing" icon={Ticket} loading={loading} />
        <MetricCard label="In review" value={counts.review} helper="Waiting approval" icon={CheckSquare} loading={loading} />
        <MetricCard label="Guest capacity" value={counts.guests} helper="Expected total" icon={Users} loading={loading} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="border border-[#e8dcc8] bg-white p-4">
          <EventSearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            onClear={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            hasActiveFilters={searchQuery !== "" || statusFilter !== "all"}
          />
        </div>

        <div className="border border-[#e8dcc8] bg-white p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/40">Showing</p>
          <p className="mt-2 text-2xl font-black text-[#3a1224]">{filteredEvents.length}</p>
          <p className="mt-1 text-xs text-[#3a1224]/45">of {events.length} event{events.length !== 1 ? "s" : ""}</p>
        </div>
      </section>

      <section className="overflow-hidden border border-[#e8dcc8] bg-white">
        <div className="flex items-center justify-between border-b border-[#e8dcc8] px-5 py-4">
          <div>
            <h2 className="text-base font-black text-[#3a1224]">Event register</h2>
            <p className="mt-1 text-xs text-[#3a1224]/45">Select rows for bulk actions. Open an event for ticket and check-in management.</p>
          </div>
          {selected.size > 0 && <span className="border border-[#e8dcc8] bg-[#fbf8f2] px-3 py-1 text-xs font-black text-[#3a1224]">{selected.size} selected</span>}
        </div>

        {loading ? (
          <LoadingRows />
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            type={searchQuery !== "" || statusFilter !== "all" ? "NO_RESULTS" : "NO_EVENTS"}
            onCtaClick={() => {
              if (searchQuery !== "" || statusFilter !== "all") {
                setSearchQuery("");
                setStatusFilter("all");
              } else {
                router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW);
              }
            }}
            ctaText={searchQuery !== "" || statusFilter !== "all" ? "Clear filters" : "Create event"}
          />
        ) : (
          <div className="divide-y divide-[#e8dcc8]">
            <div className="hidden grid-cols-[34px_minmax(0,1.45fr)_140px_120px_135px_96px] gap-4 bg-[#fbf8f2] px-5 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/35 lg:grid">
              <span />
              <span>Event</span>
              <span>Date</span>
              <span>Guests</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            {filteredEvents.map((event) => (
              <EventRow
                key={event._id}
                event={event}
                isSelected={selected.has(event._id)}
                onToggle={() => toggleSelect(event._id)}
                onOpen={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_DETAIL(event._id))}
                onDuplicate={() => duplicateEventMutation.mutate(event._id)}
              />
            ))}
          </div>
        )}
      </section>

      {selected.size > 0 && (
        <BulkActionsToolbar
          selectedCount={selected.size}
          totalCount={filteredEvents.length}
          onSelectAll={selectAll}
          onClear={clearSelection}
          onExport={handleExport}
          onDuplicate={handleDuplicate}
          onDelete={handleBulkDelete}
        />
      )}
    </main>
  );
}

function MetricCard({ label, value, helper, icon: Icon, loading, emphasis = false }) {
  return (
    <div className={`border p-5 ${emphasis ? "border-[#3a1224] bg-[#3a1224] text-white" : "border-[#e8dcc8] bg-white text-[#3a1224]"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${emphasis ? "text-white/55" : "text-[#3a1224]/40"}`}>{label}</p>
          <p className="mt-3 text-3xl font-black">{loading ? "-" : value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center border ${emphasis ? "border-white/15 bg-white/10" : "border-[#e8dcc8] bg-[#fbf8f2]"}`}>
          <Icon className={`h-5 w-5 ${emphasis ? "text-[#C0A04C]" : "text-[#3a1224]/45"}`} />
        </div>
      </div>
      <p className={`mt-3 text-xs leading-5 ${emphasis ? "text-white/60" : "text-[#3a1224]/45"}`}>{helper}</p>
    </div>
  );
}

function EventRow({ event, isSelected, onToggle, onOpen, onDuplicate }) {
  return (
    <div className={`grid gap-4 px-5 py-4 transition hover:bg-[#fbf8f2] lg:grid-cols-[34px_minmax(0,1.45fr)_140px_120px_135px_96px] lg:items-center ${isSelected ? "bg-[#C0A04C]/10" : ""}`}>
      <button onClick={onToggle} className="flex h-7 w-7 items-center justify-center border border-[#e8dcc8] text-[#3a1224]/55 hover:bg-white" aria-label={isSelected ? "Deselect event" : "Select event"}>
        {isSelected ? <CheckSquare className="h-4 w-4 text-[#C0A04C]" /> : <Square className="h-4 w-4" />}
      </button>

      <button onClick={onOpen} className="min-w-0 text-left">
        <p className="truncate text-sm font-black text-[#3a1224]">{event.name}</p>
        <p className="mt-1 truncate text-xs capitalize text-[#3a1224]/45">{event.type || event.eventCategory || "Event"}</p>
      </button>

      <p className="text-xs font-bold text-[#3a1224]/55">{formatDate(event.startDateTime || event.bookingId?.date)}</p>
      <p className="text-xs font-bold text-[#3a1224]/55">{event.expectedAttendees || event.maxAttendees || 0} guests</p>
      <span className={`w-fit border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${statusTone(event.status)}`}>
        {cleanStatus(event.status)}
      </span>

      <div className="flex justify-start gap-2 lg:justify-end">
        <button onClick={onDuplicate} className="flex h-8 w-8 items-center justify-center border border-[#e8dcc8] text-[#3a1224]/55 hover:bg-white" title="Duplicate event">
          <Copy className="h-3.5 w-3.5" />
        </button>
        <button onClick={onOpen} className="flex h-8 w-8 items-center justify-center bg-[#3a1224] text-white hover:bg-[#4b1830]" title="Open event">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="divide-y divide-[#e8dcc8]">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid grid-cols-[34px_minmax(0,1fr)_120px] gap-4 px-5 py-4">
          <div className="h-5 w-5 animate-pulse bg-[#3a1224]/10" />
          <div>
            <div className="h-4 w-56 max-w-full animate-pulse bg-[#3a1224]/10" />
            <div className="mt-2 h-3 w-32 animate-pulse bg-[#3a1224]/10" />
          </div>
          <div className="h-6 animate-pulse bg-[#3a1224]/10" />
        </div>
      ))}
    </div>
  );
}
