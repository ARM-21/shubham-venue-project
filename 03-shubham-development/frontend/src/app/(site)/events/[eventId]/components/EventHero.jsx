import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, MapPin } from "lucide-react";
import { ROUTES } from "config/routes";
import { resolveImage } from "components/site/SitePrimitives";

function formatDate(value) {
  if (!value) return "Date to be announced";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "Date to be announced";
  }
}

function formatTime(value) {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

function getTicketSummary(ticketTypes = []) {
  if (!ticketTypes.length) return "Tickets updating";
  const prices = ticketTypes
    .map((t) => Number(t.price || 0))
    .filter((p) => Number.isFinite(p));
  if (!prices.length) return "Tickets available";
  const min = Math.min(...prices);
  return min > 0 ? `From NPR ${min.toLocaleString()}` : "Free entry";
}

export function EventHero({ event, banner, ticketTypes = [], eventEnded = false }) {
  const eventDate = event.startDateTime || event.eventDate || event.bookingId?.date;
  const venueName = event.hallId?.name || "Venue";
  const startTime = formatTime(event.startDateTime);
  const endTime = formatTime(event.endDateTime);
  const timeDisplay = startTime && endTime ? `${startTime} – ${endTime}` : startTime;
  const imageSrc = resolveImage(banner, "/assets/business-images/placeholder2.jpg");
  const category = event.type || event.eventCategory;

  return (
    <section
      className="relative isolate overflow-hidden bg-[#3a1224] text-white"
      style={{ paddingTop: "calc(41px + 64px + 28px)" }}
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={imageSrc}
          alt={event.name || "Event banner"}
          fill
          priority
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(58,18,36,0.98)_40%,rgba(58,18,36,0.85))]" />
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pb-0 pt-8 lg:px-8">
        <div className="grid items-end gap-8 pb-12 lg:grid-cols-[1fr_1fr] lg:pb-16">

          {/* Left: text */}
          <div>
            {/* Category + status */}
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {category && (
                <span className="rounded-full border border-[#C0A04C]/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#C0A04C]">
                  {String(category).replace(/_/g, " ")}
                </span>
              )}
              {eventEnded && (
                <span className="rounded-full border border-white/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                  Ended
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              {event.name}
            </h1>

            {/* Metadata */}
            <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
              <span className="flex items-center gap-2 text-[13px] font-medium text-white/60">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#C0A04C]" />
                {formatDate(eventDate)}
              </span>
              {timeDisplay && (
                <span className="flex items-center gap-2 text-[13px] font-medium text-white/60">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[#C0A04C]" />
                  {timeDisplay}
                </span>
              )}
              <span className="flex items-center gap-2 text-[13px] font-medium text-white/60">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C0A04C]" />
                {venueName}
              </span>
            </div>

            {/* Price + CTA */}
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/30">Tickets</p>
                <p className="mt-0.5 text-xl font-black text-white">{getTicketSummary(ticketTypes)}</p>
              </div>
              {!eventEnded && (
                <a
                  href="#tickets"
                  className="inline-flex h-11 items-center rounded-2xl bg-[#C0A04C] px-6 text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224] transition hover:bg-[#d8bc64]"
                >
                  Get tickets
                </a>
              )}
              <Link
                href={ROUTES.SITE.EVENTS}
                className="text-[11px] font-bold text-white/40 underline-offset-4 transition hover:text-white/70 hover:underline"
              >
                Browse all events
              </Link>
            </div>
          </div>

          {/* Right: banner image */}
          <div className="relative overflow-hidden rounded-2xl bg-[#2a0d1a]" style={{ aspectRatio: '4/3' }}>
            <Image
              src={imageSrc}
              alt={event.name || "Event banner"}
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
