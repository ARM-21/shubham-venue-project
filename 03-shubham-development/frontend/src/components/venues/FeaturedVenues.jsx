"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "config/routes";
import { useQueryHallsPublic } from "@queries/customer/halls-public";
import {
  SiteButton,
  SiteCard,
  SiteEmptyState,
  resolveImage,
} from "components/site/SitePrimitives.jsx";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  MapPin,
  Search,
  Users,
  Wallet,
} from "lucide-react";

const FALLBACK_IMAGE = "/assets/business-images/placeholder2.jpg";
const DEFAULT_LOCATION = "Syangja";
const MAX_FEATURED_VENUES = 3;

export default function FeaturedVenues() {
  const { data: hallsData = {}, isLoading, error } = useQueryHallsPublic();

  const featuredVenues = Array.isArray(hallsData?.halls)
    ? hallsData.halls.slice(0, MAX_FEATURED_VENUES)
    : [];

  if (isLoading) {
    return <VenueFinderSkeleton />;
  }

  return (
    <section className="relative overflow-hidden" aria-label="Featured venues">
      {error ? <VenueError /> : null}

      {featuredVenues.length > 0 ? (
        <div className="rounded-3xl border border-[var(--color-sand)] bg-white p-4 shadow-[0_24px_70px_-58px_rgba(58,18,36,0.55)] sm:p-5 lg:p-6">
          <VenueHighlightsBar venues={featuredVenues} />

          <div className="mt-5 grid gap-5 xl:grid-cols-[1.32fr_0.78fr]">
            <PrimaryVenueCard venue={featuredVenues[0]} />

            <div className="grid content-start gap-3">
              {featuredVenues.slice(1, 3).map((venue) => (
                <SecondaryVenueCard
                  key={venue?._id || venue?.slug || venue?.name}
                  venue={venue}
                />
              ))}

              <AvailabilityPrompt />
            </div>
          </div>
        </div>
      ) : (
        <SiteEmptyState
          icon={Search}
          title="No featured venues yet"
          description="Featured halls will appear here once the venue catalogue is available."
        />
      )}
    </section>
  );
}

function VenueHighlightsBar({ venues }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[var(--color-sand)] bg-[var(--color-ivory)] p-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid gap-3 sm:grid-cols-3">
        <VenueHighlight
          icon={BadgeCheck}
          label="Verified"
          value={`${venues.length}+ featured`}
        />
        <VenueHighlight icon={Users} label="Capacity" value="Shown upfront" />
        <VenueHighlight icon={MapPin} label="Location" value="Syangja area" />
      </div>

      <SiteButton href={ROUTES.SITE.VENUES()} variant="secondary" size="sm">
        Browse all venues
      </SiteButton>
    </div>
  );
}

function VenueHighlight({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-wine)] shadow-[var(--shadow-soft)]">
        <Icon className="h-4 w-4 text-[var(--color-champagne)]" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-stone)]">
          {label}
        </p>
        <p className="truncate text-sm font-black text-[var(--color-wine)]">
          {value}
        </p>
      </div>
    </div>
  );
}

function PrimaryVenueCard({ venue }) {
  if (!venue) return null;

  const venueName = venue?.name || "Premium venue";
  const venueImage = getVenueImage(venue);
  const venueHref = getVenueHref(venue);

  return (
    <SiteCard
      as="article"
      className="group overflow-hidden rounded-2xl border border-[var(--color-sand)] bg-white shadow-[0_20px_60px_-46px_rgba(58,18,36,0.72)]"
    >
      <Link
        href={venueHref}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-champagne)]"
        aria-label={`View details for ${venueName}`}
      >
        <div className="grid min-h-[390px] md:grid-cols-[1.02fr_0.98fr]">
          <div className="relative min-h-[260px] overflow-hidden bg-[var(--color-pearl)] md:min-h-full">
            <Image
              src={resolveImage(venueImage, FALLBACK_IMAGE)}
              alt={`${venueName} venue image`}
              fill
              priority
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 44vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/45 via-transparent to-transparent" />
            <div className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full border border-white/75 bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)] shadow-xl backdrop-blur-md">
              <BadgeCheck
                className="h-3.5 w-3.5 text-[var(--color-champagne)]"
                aria-hidden="true"
              />
              Featured venue
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 md:p-7">
            <div>
              <p className="site-eyebrow mb-3">Recommended First Look</p>
              <h3 className="max-w-xl text-3xl font-black leading-tight text-[var(--color-wine)] md:text-4xl">
                {venueName}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">
                Compare capacity, location, and starting price before you open
                the full venue details.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <VenueMetric
                  icon={Wallet}
                  label="Starting"
                  value={formatPrice(venue?.price)}
                />
                <VenueMetric
                  icon={Users}
                  label="Capacity"
                  value={formatCapacity(venue?.capacity)}
                />
                <VenueMetric
                  icon={MapPin}
                  label="Location"
                  value={formatLocation(venue?.location)}
                />
              </div>
            </div>

            <div className="mt-7 inline-flex w-fit items-center gap-3 rounded-full bg-[var(--color-wine)] px-5 py-3 text-sm font-black text-white transition-all duration-300 group-hover:bg-[var(--color-champagne)] group-hover:text-[var(--color-wine)]">
              View venue details
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

function SecondaryVenueCard({ venue }) {
  const venueName = venue?.name || "Premium venue";
  const venueImage = getVenueImage(venue);
  const venueHref = getVenueHref(venue);

  return (
    <SiteCard
      as="article"
      className="group overflow-hidden rounded-2xl border border-[var(--color-sand)] bg-white shadow-[0_16px_44px_-40px_rgba(58,18,36,0.65)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-champagne)]"
    >
      <Link
        href={venueHref}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-champagne)]"
        aria-label={`View details for ${venueName}`}
      >
        <div className="grid grid-cols-[112px_1fr] sm:grid-cols-[136px_1fr]">
          <div className="relative min-h-[132px] overflow-hidden bg-[var(--color-pearl)]">
            <Image
              src={resolveImage(venueImage, FALLBACK_IMAGE)}
              alt={`${venueName} venue image`}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="136px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/30 via-transparent to-transparent" />
          </div>

          <div className="flex min-w-0 flex-col justify-between p-4">
            <div>
              <span className="inline-flex rounded-full bg-[var(--color-ivory)] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)]">
                Verified
              </span>
              <h3 className="mt-3 line-clamp-2 text-base font-black leading-tight text-[var(--color-wine)]">
                {venueName}
              </h3>
              <p className="mt-2 truncate text-xs font-semibold text-[var(--color-stone)]">
                {formatLocation(venue?.location)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="truncate text-xs font-black text-[var(--color-wine)]">
                {formatPrice(venue?.price)}
              </p>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-[var(--color-champagne)] transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </Link>
    </SiteCard>
  );
}

function AvailabilityPrompt() {
  return (
    <div className="rounded-2xl border border-[var(--color-sand)] bg-[var(--color-ivory)] p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-wine)] shadow-[var(--shadow-soft)]">
          <CalendarCheck
            className="h-4 w-4 text-[var(--color-champagne)]"
            aria-hidden="true"
          />
        </span>
        <div>
          <h3 className="text-base font-black text-[var(--color-wine)]">
            Need a date first?
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--color-stone)]">
            Check available slots before comparing venues.
          </p>
        </div>
      </div>
      <SiteButton
        href={ROUTES.SITE.SEARCH_AVAILABILITY()}
        variant="gold"
        size="sm"
        className="mt-4 w-full"
      >
        Check availability
      </SiteButton>
    </div>
  );
}

function VenueMetric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] p-3">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-stone)]">
        <Icon
          className="h-4 w-4 text-[var(--color-champagne)]"
          aria-hidden="true"
        />
        {label}
      </div>
      <p
        className="mt-1 truncate text-sm font-black text-[var(--color-wine)]"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function VenueError() {
  return (
    <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <p>
        We could not load featured venues right now. Please try again in a
        moment.
      </p>
    </div>
  );
}

function VenueFinderSkeleton() {
  return (
    <section
      className="rounded-3xl border border-[var(--color-sand)] bg-white/80 p-5"
      aria-label="Loading featured venues"
    >
      <div className="h-20 animate-pulse rounded-2xl bg-[var(--color-pearl)]" />
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.32fr_0.78fr]">
        <div className="min-h-[390px] animate-pulse rounded-2xl bg-[var(--color-pearl)]" />
        <div className="grid gap-3">
          <div className="h-32 animate-pulse rounded-2xl bg-[var(--color-pearl)]" />
          <div className="h-32 animate-pulse rounded-2xl bg-[var(--color-pearl)]" />
          <div className="h-40 animate-pulse rounded-2xl bg-[var(--color-pearl)]" />
        </div>
      </div>
    </section>
  );
}

function getVenueImage(venue) {
  return venue?.images?.[0] || venue?.image;
}

function getVenueHref(venue) {
  return venue?.slug ? ROUTES.SITE.VENUES(venue.slug) : ROUTES.SITE.VENUES("");
}

function formatPrice(price) {
  if (typeof price !== "number" || Number.isNaN(price) || price <= 0) {
    return "Contact";
  }

  return `NPR ${price.toLocaleString()}`;
}

function formatCapacity(capacity) {
  if (!capacity || Number.isNaN(Number(capacity))) {
    return "Ask venue";
  }

  return `${Number(capacity).toLocaleString()} Guests`;
}

function formatLocation(location) {
  if (!location) return DEFAULT_LOCATION;

  if (typeof location === "string") {
    return location.trim() || DEFAULT_LOCATION;
  }

  if (typeof location === "object") {
    return (
      location.address ||
      location.city ||
      location.state ||
      location.country ||
      DEFAULT_LOCATION
    );
  }

  return DEFAULT_LOCATION;
}
