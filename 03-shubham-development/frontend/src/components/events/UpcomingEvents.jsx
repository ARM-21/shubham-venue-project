"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "config/routes";
import { useQueryEventsPublic } from "@queries/customer/events-public";
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CalendarDays,
  MapPin,
  Sparkles,
  Ticket,
} from "lucide-react";
import {
  SiteButton,
  SiteCard,
  SiteEmptyState,
  SiteSectionHeader,
  resolveImage,
} from "components/site/SitePrimitives.jsx";

const FALLBACK_IMAGE = "/assets/business-images/placeholder1.png";
const MAX_EVENTS = 4;

export default function UpcomingEvents() {
  const { data: eventsData = {}, isLoading, error } = useQueryEventsPublic({
    limit: MAX_EVENTS,
  });

  const events = Array.isArray(eventsData?.events) ? eventsData.events : [];

  if (isLoading) {
    return <EventTeaserSkeleton />;
  }

  return (
    <section className="relative overflow-hidden" aria-label="Upcoming events">
      {error ? <EventError /> : null}

      {events.length ? (
        <>
          <SiteSectionHeader
            eyebrow="Featured Experiences"
            title="Upcoming Events"
            description="Discover public gatherings, workshops, and special experiences hosted in Shubham venue spaces."
            action={
              <SiteButton href={ROUTES.SITE.EVENTS} variant="secondary" icon={ArrowRight}>
                View all events
              </SiteButton>
            }
          />

          <div className="rounded-3xl border border-[var(--color-sand)] bg-white p-4 shadow-[0_24px_70px_-58px_rgba(58,18,36,0.55)] sm:p-5 lg:p-6">
            <div className="grid gap-5 xl:grid-cols-[1.35fr_0.75fr]">
              <MainLandingEvent event={events[0]} />

              {events.length > 1 ? (
                <div className="grid content-start gap-3">
                  {events.slice(1, 4).map((event) => (
                    <MiniLandingEvent
                      key={event?._id || event?.name}
                      event={event}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <SiteEmptyState
          icon={Calendar}
          title="No events scheduled yet"
          description="Upcoming public events will appear here once organizers publish them."
          action={
            <SiteButton href={ROUTES.SITE.EVENTS} variant="secondary">
              Explore events
            </SiteButton>
          }
        />
      )}
    </section>
  );
}

function MainLandingEvent({ event }) {
  if (!event) return null;

  const eventName = event?.name || "Upcoming event";
  const href = ROUTES.SITE.EVENT_DETAIL(event._id);
  const date = getEventDateParts(event?.startDateTime);
  const status = getEventStatus(event);
  const venueName = event?.hallId?.name || "Shubham Venue";

  return (
    <SiteCard
      as="article"
      className="group overflow-hidden rounded-2xl border border-[var(--color-sand)] bg-white shadow-[0_20px_60px_-46px_rgba(58,18,36,0.72)]"
    >
      <Link
        href={href}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-champagne)]"
        aria-label={`View details for ${eventName}`}
      >
        <div className="grid min-h-[360px] md:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-[260px] overflow-hidden bg-[var(--color-pearl)] md:min-h-full">
            <Image
              src={resolveImage(event.bannerUrl, FALLBACK_IMAGE)}
              alt={`${eventName} event banner`}
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 42vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/55 via-transparent to-transparent" />
            <DateBadge date={date} className="absolute left-5 top-5" />
          </div>

          <div className="flex flex-col justify-between p-6 md:p-7">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[var(--color-ivory)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-wine)]">
                  Highlighted event
                </span>
                <span className="rounded-full border border-[var(--color-sand)] bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">
                  {status.label}
                </span>
              </div>

              <h3 className="mt-5 max-w-xl text-3xl font-black leading-tight text-[var(--color-wine)] md:text-4xl">
                {eventName}
              </h3>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <EventMetric icon={MapPin} label="Venue" value={venueName} />
                <EventMetric icon={CalendarDays} label="Date" value={date.full} />
                <EventMetric
                  icon={Ticket}
                  label="Access"
                  value={event?.type || "Public"}
                />
              </div>
            </div>

            <div className="mt-7 inline-flex w-fit items-center gap-3 rounded-full bg-[var(--color-wine)] px-5 py-3 text-sm font-black text-white transition-all duration-300 group-hover:bg-[var(--color-champagne)] group-hover:text-[var(--color-wine)]">
              {status.cta}
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </Link>
    </SiteCard>
  );
}

function MiniLandingEvent({ event }) {
  const eventName = event?.name || "Upcoming event";
  const href = ROUTES.SITE.EVENT_DETAIL(event._id);
  const date = getEventDateParts(event?.startDateTime);
  const status = getEventStatus(event);

  return (
    <SiteCard
      as="article"
      className="group overflow-hidden rounded-2xl border border-[var(--color-sand)] bg-white shadow-[0_16px_44px_-40px_rgba(58,18,36,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-champagne)]"
    >
      <Link
        href={href}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-champagne)]"
        aria-label={`View details for ${eventName}`}
      >
        <div className="grid grid-cols-[112px_1fr] sm:grid-cols-[136px_1fr]">
          <div className="relative min-h-[132px] overflow-hidden bg-[var(--color-pearl)]">
            <Image
              src={resolveImage(event.bannerUrl, FALLBACK_IMAGE)}
              alt={`${eventName} event banner`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="136px"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/35 via-transparent to-transparent" />
            <DateBadge date={date} compact className="absolute left-3 top-3" />
          </div>

          <div className="flex min-w-0 flex-col justify-between p-4">
            <div>
              <span className="inline-flex rounded-full bg-[var(--color-ivory)] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)]">
                {status.label}
              </span>
              <h3 className="mt-3 line-clamp-2 text-base font-black leading-tight text-[var(--color-wine)]">
                {eventName}
              </h3>
              <p className="mt-2 truncate text-xs font-semibold text-[var(--color-stone)]">
                {date.full}
              </p>
            </div>

            <span className="mt-4 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-stone)]">
              {status.cta}
              <ArrowRight className="h-3.5 w-3.5 text-[var(--color-champagne)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </SiteCard>
  );
}

function EventMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] p-3">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-stone)]">
        <Icon
          className="h-4 w-4 text-[var(--color-champagne)]"
          aria-hidden="true"
        />
        {label}
      </div>

      <p className="mt-1 truncate text-sm font-black text-[var(--color-wine)]" title={value}>
        {value}
      </p>
    </div>
  );
}

function DateBadge({ date, compact = false, className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-white/75 bg-white/95 shadow-xl backdrop-blur-md ${
        compact ? "h-12 w-11" : "h-16 w-14"
      } ${className}`}
    >
      <span
        className={`font-black leading-none text-[var(--color-wine)] ${
          compact ? "text-lg" : "text-2xl"
        }`}
      >
        {date.day}
      </span>
      <span className="mt-1 text-[8px] font-black uppercase tracking-widest text-[var(--color-champagne)]">
        {date.month}
      </span>
    </div>
  );
}

function EventError() {
  return (
    <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p>
        We could not load upcoming events right now. Please try again in a
        moment.
      </p>
    </div>
  );
}

function EventTeaserSkeleton() {
  return (
    <section
      className="rounded-3xl border border-[var(--color-sand)] bg-white/80 p-5"
      aria-label="Loading upcoming events"
    >
      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.75fr]">
        <div className="min-h-[390px] animate-pulse rounded-2xl bg-[var(--color-pearl)] lg:min-h-[410px]" />
        <div className="grid gap-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl bg-[var(--color-pearl)]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function getEventDateParts(dateValue) {
  const date = new Date(dateValue);

  if (!dateValue || Number.isNaN(date.getTime())) {
    return {
      day: "--",
      month: "TBA",
      full: "Date to be announced",
    };
  }

  return {
    day: date.getDate(),
    month: date.toLocaleString("default", { month: "short" }),
    full: date.toLocaleDateString("default", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };
}

function getEventStatus(event) {
  const now = new Date();

  const registrationOpen = event?.registrationStartDate
    ? new Date(event.registrationStartDate) <= now
    : true;

  const eventEnded = event?.endDateTime
    ? new Date(event.endDateTime) < now
    : false;

  if (eventEnded) {
    return {
      label: "Ended",
      cta: "View details",
    };
  }

  if (registrationOpen) {
    return {
      label: event?.type || "Public",
      cta: "View details",
    };
  }

  return {
    label: "Coming soon",
    cta: "Notify me",
  };
}
