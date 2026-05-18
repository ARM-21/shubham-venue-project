"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "config/routes";
import { useQueryEventsPublic } from "@queries/customer/events-public";
import { AlertCircle, ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { SiteButton, SiteSectionHeader, resolveImage } from "components/site/SitePrimitives.jsx";

const FALLBACK_IMAGE = "/assets/business-images/placeholder1.png";
const MAX_EVENTS = 4;

export default function UpcomingEvents() {
  const { data: eventsData = {}, isLoading, error } = useQueryEventsPublic({
    limit: MAX_EVENTS,
  });

  const events = Array.isArray(eventsData?.events) ? eventsData.events : [];

  if (isLoading) return <EventSkeleton />;
  if (error) return <EventError />;
  if (!events.length) return <EventEmptyState />;

  const [primary, ...secondary] = events;

  return (
    <div>
      <SiteSectionHeader
        eyebrow="Featured Experiences"
        title="Upcoming Events"
        action={<SiteButton href={ROUTES.SITE.EVENTS} variant="secondary" icon={null}>View all events</SiteButton>}
      />
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {primary && <MainEvent event={primary} />}
        {secondary.length > 0 && (
          <div className="grid content-start gap-4">
            {secondary.map((event) => (
              <SecondaryEvent key={event?._id || event?.name} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MainEvent({ event }) {
  const eventName = event?.name || "Upcoming event";
  const href = ROUTES.SITE.EVENT_DETAIL(event._id);
  const date = getEventDateParts(event?.startDateTime);
  const status = getEventStatus(event);
  const venueName = event?.hallId?.name || "Shubham Venue";

  return (
    <Link
      href={href}
      className="group grid overflow-hidden border border-[var(--color-sand)] bg-white transition hover:border-[var(--color-champagne)] md:grid-cols-[1fr_280px]"
    >
      <div className="relative min-h-[340px] overflow-hidden bg-[var(--color-pearl)] md:min-h-full">
        <Image
          src={resolveImage(event.bannerUrl, FALLBACK_IMAGE)}
          alt={`${eventName} event banner`}
          fill
          priority
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute left-0 top-6 bg-white px-4 py-2 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)]">
            {status.label}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-between p-6 md:p-8">
        <div>
          <DateBlock date={date} />
          <h3 className="mt-6 text-2xl font-black leading-tight text-[var(--color-wine)] lg:text-3xl">
            {eventName}
          </h3>
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm font-semibold text-[var(--color-wine)]">
              <MapPin className="h-4 w-4 text-[var(--color-champagne)]" aria-hidden="true" />
              {venueName}
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-[var(--color-wine)]">
              <CalendarDays className="h-4 w-4 text-[var(--color-champagne)]" aria-hidden="true" />
              {date.full}
            </div>
          </div>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-wine)] transition-colors group-hover:text-[var(--color-champagne)]">
          {status.cta}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

function SecondaryEvent({ event }) {
  const eventName = event?.name || "Upcoming event";
  const href = ROUTES.SITE.EVENT_DETAIL(event._id);
  const date = getEventDateParts(event?.startDateTime);
  const status = getEventStatus(event);

  return (
    <Link
      href={href}
      className="group flex gap-5 border border-[var(--color-sand)] bg-white p-3 transition hover:border-[var(--color-champagne)]"
    >
      <div className="relative h-28 w-32 shrink-0 overflow-hidden bg-[var(--color-pearl)]">
        <Image
          src={resolveImage(event.bannerUrl, FALLBACK_IMAGE)}
          alt={`${eventName} event banner`}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="136px"
        />
        <div className="absolute inset-x-0 bottom-0 bg-white/95 px-2 py-1 text-center backdrop-blur-sm">
          <p className="text-[9px] font-black uppercase tracking-[0.1em] text-[var(--color-wine)]">
            {date.day} {date.month}
          </p>
        </div>
      </div>

      <div className="flex min-w-0 flex-col justify-center py-2 pr-3">
        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[var(--color-champagne)]">
          {status.label}
        </span>
        <h3 className="mt-1 line-clamp-2 text-base font-black leading-tight text-[var(--color-wine)]">
          {eventName}
        </h3>
        <p className="mt-2 truncate text-xs text-[var(--color-stone)]">
          {date.full}
        </p>
      </div>
    </Link>
  );
}

function DateBlock({ date }) {
  return (
    <div className="flex w-fit items-center gap-4">
      <span className="text-4xl font-black leading-none text-[var(--color-wine)]">{date.day}</span>
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-champagne)]">
          {date.month}
        </span>
        <span className="text-xs font-bold text-[var(--color-stone)]">
          {date.year}
        </span>
      </div>
    </div>
  );
}

function EventError() {
  return (
    <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>We could not load upcoming events right now. Please try again in a moment.</p>
    </div>
  );
}

function EventEmptyState() {
  return (
    <div className="border border-dashed border-[var(--color-sand)] p-12 text-center">
      <p className="text-sm font-semibold text-[var(--color-stone)]">
        Upcoming public events will appear here once organizers publish them.
      </p>
    </div>
  );
}

function EventSkeleton() {
  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-4">
          <div className="h-4 w-32 animate-pulse bg-[var(--color-ivory)]" />
          <div className="h-8 w-64 animate-pulse bg-[var(--color-pearl)]" />
        </div>
        <div className="h-10 w-32 animate-pulse bg-[var(--color-ivory)]" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid border border-[var(--color-sand)] bg-white md:grid-cols-[1fr_280px]">
          <div className="min-h-[340px] animate-pulse bg-[var(--color-pearl)]" />
          <div className="p-8">
            <div className="mb-6 h-12 w-16 animate-pulse bg-[var(--color-ivory)]" />
            <div className="mb-8 h-16 animate-pulse bg-[var(--color-pearl)]" />
            <div className="space-y-3">
              <div className="h-4 w-1/2 animate-pulse bg-[var(--color-ivory)]" />
              <div className="h-4 w-1/3 animate-pulse bg-[var(--color-ivory)]" />
            </div>
          </div>
        </div>
        <div className="grid content-start gap-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex h-[138px] gap-5 border border-[var(--color-sand)] bg-white p-3">
              <div className="h-28 w-32 shrink-0 animate-pulse bg-[var(--color-pearl)]" />
              <div className="flex flex-col justify-center py-2 pr-3">
                <div className="mb-2 h-3 w-16 animate-pulse bg-[var(--color-ivory)]" />
                <div className="mb-3 h-10 w-48 animate-pulse bg-[var(--color-pearl)]" />
                <div className="h-3 w-24 animate-pulse bg-[var(--color-ivory)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getEventDateParts(dateValue) {
  const date = new Date(dateValue);
  if (!dateValue || Number.isNaN(date.getTime())) {
    return { day: "--", month: "TBA", year: "----", full: "Date to be announced" };
  }
  return {
    day: date.getDate(),
    month: date.toLocaleString("default", { month: "short" }),
    year: date.getFullYear(),
    full: date.toLocaleDateString("default", { day: "numeric", month: "short", year: "numeric" }),
  };
}

function getEventStatus(event) {
  const now = new Date();
  const registrationOpen = event?.registrationStartDate ? new Date(event.registrationStartDate) <= now : true;
  const eventEnded = event?.endDateTime ? new Date(event.endDateTime) < now : false;

  if (eventEnded) return { label: "Ended", cta: "View details" };
  if (registrationOpen) return { label: event?.type || "Public", cta: "View details" };
  return { label: "Coming soon", cta: "Notify me" };
}
