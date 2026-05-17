"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Search,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { ROUTES } from "config/routes";
import { useQueryEventsPublic } from "@queries/customer/events-public";
import {
  SiteButton,
  SiteEmptyState,
  resolveImage,
} from "components/site/SitePrimitives.jsx";

const PAGE_SIZE = 9;
const FALLBACK_IMAGE = "/assets/business-images/placeholder2.jpg";

function getDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDateTime(value) {
  const date = getDate(value);
  if (!date) return "Date to be announced";

  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatTime(value) {
  const date = getDate(value);
  if (!date) return "Time TBA";

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getDateParts(value) {
  const date = getDate(value);
  if (!date) return { day: "TBA", month: "Soon", weekday: "Date" };

  return {
    day: new Intl.DateTimeFormat("en-GB", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date),
    weekday: new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date),
  };
}

function getMonthLabel(value) {
  const date = getDate(value);
  if (!date) return "Date to be announced";

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getEventTimestamp(event) {
  return getDate(event?.startDateTime)?.getTime() || Number.MAX_SAFE_INTEGER;
}

function isEventCompleted(event, now = Date.now()) {
  const startsAt = getDate(event?.startDateTime)?.getTime() || null;
  const endsAt = getDate(event?.endDateTime)?.getTime() || null;

  if (endsAt) return endsAt < now;
  return startsAt ? startsAt < now : false;
}

function getHighlightEvents(events) {
  const now = Date.now();
  const currentOrUpcoming = events.filter((event) => !isEventCompleted(event, now));
  const highlightPool = currentOrUpcoming.length ? currentOrUpcoming : events;
  return {
    featured: highlightPool[0] || null,
    agenda: highlightPool.slice(1, 4),
  };
}

function getEventStatus(event) {
  const now = Date.now();
  const startsAt = getDate(event?.startDateTime)?.getTime() || null;
  const endsAt = getDate(event?.endDateTime)?.getTime() || null;

  if (endsAt && endsAt < now) return { label: "Ended", tone: "ended", cta: "View details" };
  if (startsAt && startsAt <= now && (!endsAt || endsAt >= now)) {
    return { label: "Happening now", tone: "live", cta: "View tickets" };
  }
  return { label: "Upcoming", tone: "open", cta: "View event" };
}

function getEventType(event) {
  return event?.eventCategory?.replaceAll("_", " ") || event?.type || "Event";
}

function getVenueName(event) {
  return event?.hallId?.name || "Shubham Venue";
}

function getCapacity(event) {
  const capacity = event?.maxAttendees || event?.hallId?.capacity;
  if (!capacity) return "Capacity varies";
  return `${capacity} guests`;
}

function groupEventsByMonth(events) {
  return events.reduce((groups, event) => {
    const label = getMonthLabel(event?.startDateTime);
    const current = groups.get(label) || [];
    current.push(event);
    groups.set(label, current);
    return groups;
  }, new Map());
}

export default function EventsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: eventsData, isLoading, error } = useQueryEventsPublic({
    page,
    limit: PAGE_SIZE,
    q: searchTerm || undefined,
  });

  const events = Array.isArray(eventsData?.events) ? eventsData.events : [];
  const total = Number(eventsData?.total || 0);
  const pages = Number(eventsData?.pages || 1);
  const canPrev = page > 1;
  const canNext = page < pages;
  const firstResult = total ? (page - 1) * PAGE_SIZE + 1 : 0;
  const lastResult = total ? Math.min(page * PAGE_SIZE, total) : 0;

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => getEventTimestamp(a) - getEventTimestamp(b)),
    [events]
  );
  const { featured: featuredEvent, agenda: agendaEvents } = useMemo(
    () => getHighlightEvents(sortedEvents),
    [sortedEvents]
  );
  const groupedEvents = useMemo(() => groupEventsByMonth(sortedEvents), [sortedEvents]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearchTerm(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-[var(--color-ivory)] selection:bg-[var(--color-champagne)]/30">
      <section className="relative overflow-hidden border-b border-[var(--color-sand)] bg-[var(--color-wine)] pt-40 pb-14 text-white sm:pb-16 lg:pt-44">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_18%_12%,rgba(192,160,76,0.22),transparent_28%),linear-gradient(135deg,#3a1224_0%,#2a0d1a_52%,#16070d_100%)]" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 z-0 h-48 bg-gradient-to-b from-[#17080d]/90 via-[#17080d]/45 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-t from-[var(--color-ivory)]/12 to-transparent" aria-hidden="true" />

        <div className="site-container relative z-10">
          <EventsHeroMagazine
            featuredEvent={featuredEvent}
            agendaEvents={agendaEvents}
            isLoading={isLoading}
          />

          <SearchCommandBar
            searchInput={searchInput}
            searchTerm={searchTerm}
            onInputChange={setSearchInput}
            onSubmit={handleSearch}
            onClear={handleClearSearch}
          />
        </div>
      </section>

      <section className="site-container py-10 lg:py-14">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="site-eyebrow mb-3">Event Timeline</p>
            <h2 className="text-3xl font-black leading-tight tracking-normal text-[var(--color-wine)] sm:text-4xl">
              {searchTerm ? `Search results for "${searchTerm}"` : "Upcoming Events"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
              {total ? `Showing ${firstResult}-${lastResult} of ${total} published events.` : "Published events will appear here as organizers open them to guests."}
            </p>
          </div>

          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[var(--color-sand)] bg-white shadow-[var(--shadow-soft)]">
            <TimelineStat label="Page" value={`${page}/${pages}`} />
            <TimelineStat label="Visible" value={String(events.length)} />
            <TimelineStat label="Total" value={String(total)} />
          </div>
        </div>

        {error ? <EventsError message={error?.response?.data?.message || error?.message} /> : null}

        {isLoading ? (
          <EventsSkeleton />
        ) : sortedEvents.length ? (
          <>
            <EventTimeline groupedEvents={groupedEvents} />
            <Pagination
              page={page}
              pages={pages}
              canPrev={canPrev}
              canNext={canNext}
              onPrev={() => canPrev && setPage((current) => current - 1)}
              onNext={() => canNext && setPage((current) => current + 1)}
            />
          </>
        ) : (
          <EventsEmptyState searchTerm={searchTerm} onClear={handleClearSearch} />
        )}
      </section>
    </main>
  );
}

function EventsHeroMagazine({ featuredEvent, agendaEvents, isLoading }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_420px]">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 text-white shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="site-eyebrow mb-3">Events at Shubham</p>
            <h1 className="max-w-4xl text-4xl font-black leading-tight tracking-normal sm:text-5xl lg:text-6xl">
              Find upcoming events and ticket details.
            </h1>
          </div>
          <p className="max-w-sm text-sm leading-6 text-white/68">
            Check the date, venue, capacity, and status before opening an event.
          </p>
        </div>

        <FeaturedEventPoster event={featuredEvent} isLoading={isLoading} />
      </div>

      <AgendaRail events={agendaEvents} isLoading={isLoading} />
    </div>
  );
}

function FeaturedEventPoster({ event, isLoading }) {
  if (isLoading) {
    return (
      <div className="min-h-[430px] animate-pulse rounded-[1.5rem] bg-white/10" />
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-[430px] flex-col justify-between rounded-[1.5rem] border border-white/12 bg-white/8 p-6">
        <div>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[var(--color-champagne)]">
            <CalendarDays className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="max-w-lg text-3xl font-black leading-tight">Events are opening soon.</h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/68">
            Once organizers publish public events, the featured agenda appears here.
          </p>
        </div>
        <SiteButton href={ROUTES.SITE.VENUES()} variant="gold">
          Browse venues
        </SiteButton>
      </div>
    );
  }

  const status = getEventStatus(event);
  const date = getDateParts(event.startDateTime);

  return (
    <Link
      href={ROUTES.SITE.EVENT_DETAIL(event._id)}
      className="group relative block min-h-[430px] overflow-hidden rounded-[1.5rem] border border-white/12 bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-champagne)]"
      aria-label={`View details for ${event.name || "featured event"}`}
    >
      <Image
        src={resolveImage(event.bannerUrl, FALLBACK_IMAGE)}
        alt={`${event.name || "Featured event"} banner`}
        fill
        priority
        className="object-cover opacity-82 transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 1024px) 100vw, 900px"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-wine)]/92 via-[var(--color-wine)]/52 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--color-wine)] via-[var(--color-wine)]/65 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-champagne)]">
              Featured Event
            </p>
            <p className="mt-1 text-sm font-bold text-white/82">{formatDateTime(event.startDateTime)}</p>
          </div>
          <DateBadge date={date} />
        </div>

        <div className="max-w-2xl">
          <StatusPill status={status} dark />
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-normal text-white sm:text-5xl">
            {event.name || "Featured event"}
          </h2>
          <div className="mt-5 grid gap-3 text-sm font-semibold text-white/82 sm:grid-cols-3">
            <PosterFact icon={MapPin} label={getVenueName(event)} />
            <PosterFact icon={Clock3} label={formatTime(event.startDateTime)} />
            <PosterFact icon={Users} label={getCapacity(event)} />
          </div>
          <span className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--color-champagne)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-wine)] transition-all group-hover:bg-[var(--color-champagne-light)]">
            {status.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function AgendaRail({ events, isLoading }) {
  return (
    <aside className="rounded-[2rem] border border-white/12 bg-[var(--color-ivory)] p-5 text-[var(--color-wine)] shadow-[var(--shadow-card)]">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="site-eyebrow mb-2">Next Events</p>
          <h2 className="text-2xl font-black leading-tight text-[var(--color-wine)]">
            Next up
          </h2>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[var(--color-champagne)] shadow-[var(--shadow-soft)]">
          <Ticket className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      ) : events.length ? (
        <div className="space-y-3">
          {events.map((event) => (
            <AgendaRailItem key={event._id} event={event} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[var(--color-sand)] bg-white p-5">
          <p className="text-sm font-bold text-[var(--color-wine)]">No additional events on this page.</p>
          <p className="mt-2 text-sm leading-6 text-[var(--color-stone)]">
            Use pagination or search to discover more public events.
          </p>
        </div>
      )}
    </aside>
  );
}

function AgendaRailItem({ event }) {
  const date = getDateParts(event.startDateTime);
  const status = getEventStatus(event);

  return (
    <Link
      href={ROUTES.SITE.EVENT_DETAIL(event._id)}
      className="group grid grid-cols-[64px_1fr] gap-3 rounded-2xl border border-[var(--color-sand)] bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-[var(--color-champagne)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-champagne)]"
    >
      <DateBlock date={date} />
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-champagne)]">
          {formatTime(event.startDateTime)}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-black leading-tight text-[var(--color-wine)]">
          {event.name || "Upcoming event"}
        </h3>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="truncate text-xs font-bold text-[var(--color-stone)]">{getVenueName(event)}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-champagne)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>
        <span className="sr-only">{status.cta}</span>
      </div>
    </Link>
  );
}

function SearchCommandBar({
  searchInput,
  searchTerm,
  onInputChange,
  onSubmit,
  onClear,
}) {
  return (
    <form onSubmit={onSubmit} className="-mb-16 mt-6 rounded-[1.5rem] border border-[var(--color-sand)] bg-white p-3 shadow-[var(--shadow-card)] lg:mx-10">
      <label htmlFor="event-search" className="sr-only">
        Search public events
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl bg-[var(--color-ivory)] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[var(--color-champagne)]" aria-hidden="true" />
          <input
            id="event-search"
            type="search"
            value={searchInput}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder="Search by event name or type"
            className="w-full bg-transparent text-sm font-semibold text-[var(--color-wine)] placeholder:text-[var(--color-stone)]/70 focus:outline-none"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={onClear}
              className="rounded-full p-1 text-[var(--color-stone)] transition hover:bg-white hover:text-[var(--color-wine)]"
              aria-label="Clear event search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-wine)] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--color-wine-hover)]"
        >
          Search events
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

function EventTimeline({ groupedEvents }) {
  return (
    <div className="space-y-10 pt-10">
      {Array.from(groupedEvents.entries()).map(([month, events]) => (
        <section key={month} aria-labelledby={`events-${month.replaceAll(" ", "-").toLowerCase()}`}>
          <div className="mb-4 flex items-center gap-4">
            <div className="h-px flex-1 bg-[var(--color-sand)]" />
            <h3
              id={`events-${month.replaceAll(" ", "-").toLowerCase()}`}
              className="rounded-full border border-[var(--color-sand)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-wine)] shadow-[var(--shadow-soft)]"
            >
              {month}
            </h3>
            <div className="h-px flex-1 bg-[var(--color-sand)]" />
          </div>

          <div className="space-y-4">
            {events.map((event) => (
              <EventTicketRow key={event._id} event={event} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function EventTicketRow({ event }) {
  const date = getDateParts(event.startDateTime);
  const status = getEventStatus(event);

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-[var(--color-sand)] bg-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-champagne)] hover:shadow-[0_28px_70px_-50px_rgba(58,18,36,0.65)]">
      <Link
        href={ROUTES.SITE.EVENT_DETAIL(event._id)}
        className="grid gap-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-champagne)] lg:grid-cols-[112px_220px_minmax(0,1fr)_170px]"
        aria-label={`View details for ${event.name || "event"}`}
      >
        <div className="flex items-center gap-4 border-b border-[var(--color-sand)] bg-[var(--color-ivory)] p-4 lg:flex-col lg:items-center lg:justify-center lg:border-b-0 lg:border-r">
          <DateBlock date={date} large />
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-stone)] lg:text-center">
            {formatTime(event.startDateTime)}
          </p>
        </div>

        <div className="relative min-h-[180px] overflow-hidden bg-[var(--color-pearl)] lg:min-h-full">
          <Image
            src={resolveImage(event.bannerUrl, FALLBACK_IMAGE)}
            alt={`${event.name || "Event"} banner`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 220px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-wine)]/55 via-transparent to-transparent" />
          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--color-wine)]">
            {getEventType(event)}
          </span>
        </div>

        <div className="min-w-0 p-5 lg:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={status} />
            <span className="rounded-full border border-[var(--color-sand)] bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--color-stone)]">
              Public
            </span>
          </div>
          <h3 className="mt-4 text-2xl font-black leading-tight text-[var(--color-wine)]">
            {event.name || "Upcoming event"}
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <EventFact icon={MapPin} label="Venue" value={getVenueName(event)} />
            <EventFact icon={Users} label="Capacity" value={getCapacity(event)} />
            <EventFact icon={Ticket} label="Access" value={event.type || "Public event"} />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-sand)] p-5 lg:flex-col lg:items-start lg:justify-center lg:border-l lg:border-t-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">
              Event Details
            </p>
            <p className="mt-2 text-sm font-black text-[var(--color-wine)]">{status.cta}</p>
          </div>
          <span className="mt-0 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-wine)] text-white transition-colors group-hover:bg-[var(--color-champagne)] group-hover:text-[var(--color-wine)] lg:mt-6">
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </article>
  );
}

function DateBadge({ date }) {
  return (
    <div className="flex h-16 w-14 flex-col items-center justify-center rounded-xl border border-white/75 bg-white/95 text-center shadow-xl backdrop-blur-md">
      <span className="text-lg font-black leading-none text-[var(--color-wine)]">{date.day}</span>
      <span className="mt-1 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-champagne)]">
        {date.month}
      </span>
    </div>
  );
}

function DateBlock({ date, large = false }) {
  return (
    <div className={`flex shrink-0 flex-col items-center justify-center rounded-2xl border border-[var(--color-sand)] bg-white text-center shadow-[var(--shadow-soft)] ${large ? "h-20 w-20" : "h-16 w-16"}`}>
      <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-champagne)]">
        {date.weekday}
      </span>
      <span className={`${large ? "text-2xl" : "text-xl"} font-black leading-none text-[var(--color-wine)]`}>
        {date.day}
      </span>
      <span className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--color-stone)]">
        {date.month}
      </span>
    </div>
  );
}

function PosterFact({ icon: Icon, label }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-md">
      <Icon className="h-4 w-4 shrink-0 text-[var(--color-champagne)]" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function EventFact({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-2xl bg-[var(--color-ivory)] p-3">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-[var(--color-stone)]">
        <Icon className="h-4 w-4 shrink-0 text-[var(--color-champagne)]" aria-hidden="true" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-black text-[var(--color-wine)]" title={value}>
        {value}
      </p>
    </div>
  );
}

function StatusPill({ status, dark = false }) {
  const tones = {
    open: dark
      ? "border border-[var(--color-champagne)]/50 bg-[var(--color-champagne)]/18 text-white"
      : "border border-[var(--color-champagne)]/45 bg-[var(--color-champagne)]/16 text-[var(--color-wine)]",
    live: "border border-[var(--color-champagne)] bg-[var(--color-champagne)] text-[var(--color-wine)]",
    ended: dark
      ? "border border-white/18 bg-white/10 text-white/78"
      : "border border-[var(--color-sand)] bg-[var(--color-pearl)] text-[var(--color-stone)]",
  };
  const dots = {
    open: "bg-[var(--color-champagne)]",
    live: "bg-[var(--color-wine)]",
    ended: "bg-[var(--color-stone)]",
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${tones[status.tone] || tones.open}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dots[status.tone] || dots.open}`} aria-hidden="true" />
      {status.label}
    </span>
  );
}

function TimelineStat({ label, value }) {
  return (
    <div className="min-w-[88px] border-r border-[var(--color-sand)] px-4 py-3 text-center last:border-r-0">
      <p className="text-lg font-black leading-none text-[var(--color-wine)]">{value}</p>
      <p className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--color-stone)]">
        {label}
      </p>
    </div>
  );
}

function Pagination({ page, pages, canPrev, canNext, onPrev, onNext }) {
  if (pages <= 1) return null;

  return (
    <div className="mt-10 flex flex-col gap-4 border-t border-[var(--color-sand)] pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">
        Page {page} of {pages}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--color-sand)] bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-wine)] transition-all hover:-translate-y-0.5 hover:border-[var(--color-champagne)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canNext}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--color-wine)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--color-wine-hover)] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Next
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function EventsError({ message }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message || "Unable to load events right now. Please try again shortly."}</span>
    </div>
  );
}

function EventsEmptyState({ searchTerm, onClear }) {
  return (
    <SiteEmptyState
      icon={CalendarDays}
      title={searchTerm ? "No matching events found" : "No events published yet"}
      description={searchTerm ? "Try a shorter keyword or clear the search to see all public events." : "Check back soon for workshops, gatherings, and hosted celebrations."}
      action={
        searchTerm ? (
          <SiteButton type="button" variant="secondary" onClick={onClear} icon={X}>
            Clear search
          </SiteButton>
        ) : null
      }
    />
  );
}

function EventsSkeleton() {
  return (
    <div className="space-y-4 pt-10">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="grid overflow-hidden rounded-[1.5rem] border border-[var(--color-sand)] bg-white shadow-[var(--shadow-soft)] lg:grid-cols-[112px_220px_minmax(0,1fr)_170px]">
          <div className="h-24 animate-pulse bg-[var(--color-ivory)] lg:h-auto" />
          <div className="h-44 animate-pulse bg-[var(--color-pearl)] lg:h-auto" />
          <div className="space-y-4 p-5">
            <div className="h-5 w-1/4 animate-pulse rounded-full bg-[var(--color-ivory)]" />
            <div className="h-8 w-3/4 animate-pulse rounded-full bg-[var(--color-pearl)]" />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="h-16 animate-pulse rounded-2xl bg-[var(--color-ivory)]" />
              <div className="h-16 animate-pulse rounded-2xl bg-[var(--color-ivory)]" />
              <div className="h-16 animate-pulse rounded-2xl bg-[var(--color-ivory)]" />
            </div>
          </div>
          <div className="h-24 animate-pulse bg-[var(--color-ivory)] lg:h-auto" />
        </div>
      ))}
    </div>
  );
}
