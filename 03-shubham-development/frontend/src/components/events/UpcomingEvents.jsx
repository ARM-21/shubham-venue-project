"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "config/routes";
import { useQueryEventsPublic } from '@queries/customer/events-public';
import { AlertCircle, Calendar, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { SiteButton, SiteCard, SiteEmptyState, SiteSectionHeader, resolveImage } from "components/site/SitePrimitives.jsx";

export default function UpcomingEvents() {
  const { data: eventsData = {}, isLoading, error } = useQueryEventsPublic({ limit: 4 });
  
  const events = eventsData?.events || [];

  return (
    <div>
      <SiteSectionHeader
        eyebrow="Featured Experiences"
        title="Upcoming Events"
        description="Discover curated experiences and public gatherings hosted in Shubham Venue spaces."
        action={
          events.length > 0 ? (
            <SiteButton href={ROUTES.SITE.EVENTS} variant="secondary" icon={Sparkles}>
              View all events
            </SiteButton>
          ) : null
        }
      />

      {error ? (
        <div className="mb-8 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          We could not load upcoming events right now. Please try again in a moment.
        </div>
      ) : null}

      {isLoading ? (
        <EventSkeleton />
      ) : events.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {events.map((event) => {
            const date = new Date(event.startDateTime);
            const day = Number.isNaN(date.getTime()) ? '--' : date.getDate();
            const month = Number.isNaN(date.getTime()) ? 'TBA' : date.toLocaleString('default', { month: 'short' });
            const isRegistrationOpen = event.registrationStartDate 
              ? new Date(event.registrationStartDate) <= new Date()
              : true;
            const isEventEnded = event.endDateTime 
              ? new Date(event.endDateTime) < new Date()
              : false;
            const href = ROUTES.SITE.EVENT_DETAIL(event._id);

            return (
              <SiteCard
                key={event._id}
                as="article"
                className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-champagne)]"
              >
                <Link href={href} className="flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-champagne)]">
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-[var(--color-pearl)]">
                    <Image
                      src={resolveImage(event.bannerUrl, '/assets/business-images/placeholder1.png')}
                      alt={event.name || "Event"}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/85 via-[#3a1224]/25 to-transparent" />
                    <div className="absolute left-4 top-4 z-10 flex h-16 w-14 flex-col items-center justify-center rounded-2xl border border-white/80 bg-white/95 shadow-xl backdrop-blur-md">
                      <span className="text-2xl font-black leading-none text-[var(--color-wine)]">{day}</span>
                      <span className="mt-1 text-[9px] font-black uppercase tracking-widest text-[var(--color-champagne)]">{month}</span>
                    </div>

                    <div className="absolute right-4 top-4 z-10 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] text-[var(--color-wine)] backdrop-blur-md">
                      {isEventEnded ? 'Ended' : isRegistrationOpen ? event.type || 'Public' : 'Coming soon'}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                      <h3 className="line-clamp-2 text-xl font-black leading-tight tracking-normal text-white transition-colors group-hover:text-[var(--color-champagne)]">
                        {event.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div className="flex items-center gap-2 text-[var(--color-stone)]">
                      <MapPin size={15} className="shrink-0 text-[var(--color-champagne)]" aria-hidden="true" />
                      <p className="truncate text-xs font-black uppercase tracking-[0.14em]">{event.hallId?.name || "Venue"}</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between border-t border-[var(--color-sand)] pt-5">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">
                          {isEventEnded ? "Event finished" : isRegistrationOpen ? "Get tickets" : "Registration opens"}
                        </p>
                        <p className="mt-1 text-xs font-black uppercase text-[var(--color-wine)]">
                          {isEventEnded ? "View details" : isRegistrationOpen ? "View details" : "Coming soon"}
                        </p>
                      </div>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-champagne)] text-[var(--color-wine)]">
                        <ArrowRight size={16} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              </SiteCard>
            );
          })}
        </div>
      ) : (
        <SiteEmptyState
          icon={Calendar}
          title="No events scheduled yet"
          description="Upcoming public events will appear here once organizers publish them."
          action={<SiteButton href={ROUTES.SITE.EVENTS} variant="secondary">Explore events</SiteButton>}
        />
      )}
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4" aria-label="Loading upcoming events">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="overflow-hidden rounded-2xl border border-[var(--color-sand)] bg-white shadow-[var(--shadow-soft)]">
          <div className="aspect-[4/5] animate-pulse bg-[var(--color-pearl)]" />
          <div className="space-y-4 p-5">
            <div className="h-4 w-2/3 animate-pulse rounded-full bg-[var(--color-pearl)]" />
            <div className="h-10 animate-pulse rounded-full bg-[var(--color-ivory)]" />
          </div>
        </div>
      ))}
    </div>
  );
}
