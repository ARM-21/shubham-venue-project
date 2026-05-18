"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "config/routes";
import { useQueryHallsPublic } from "@queries/customer/halls-public";
import { AlertCircle, ArrowRight, MapPin, Users } from "lucide-react";
import { SiteSectionHeader, SiteButton, resolveImage } from "components/site/SitePrimitives.jsx";

const FALLBACK_IMAGE = "/assets/business-images/placeholder2.jpg";
const DEFAULT_LOCATION = "Syangja";
const MAX_FEATURED_VENUES = 4;

export default function FeaturedVenues() {
  const { data: hallsData = {}, isLoading, error } = useQueryHallsPublic();

  const featuredVenues = Array.isArray(hallsData?.halls)
    ? hallsData.halls.slice(0, MAX_FEATURED_VENUES)
    : [];

  if (isLoading) return <VenueFinderSkeleton />;
  if (error) return <VenueError />;
  if (!featuredVenues.length) return <VenueEmptyState />;

  const [primary, ...secondary] = featuredVenues;

  return (
    <div>
      <SiteSectionHeader
        eyebrow="Explore Spaces"
        title="Featured Venues"
        description="Discover our most popular celebration halls, hand-picked for their premium amenities and consistent guest satisfaction."
        action={<SiteButton href={ROUTES.SITE.VENUES()} variant="secondary" icon={null}>View all venues</SiteButton>}
      />
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {primary && <PrimaryVenue venue={primary} />}
      <div className="grid content-start gap-4">
        {secondary.map((venue) => (
          <SecondaryVenue key={venue?._id || venue?.slug || venue?.name} venue={venue} />
        ))}
      </div>
      </div>
    </div>
  );
}

function PrimaryVenue({ venue }) {
  const venueName = venue?.name || "Premium venue";
  const venueImage = getVenueImage(venue);
  const venueHref = getVenueHref(venue);

  return (
    <Link
      href={venueHref}
      className="group grid overflow-hidden border border-[var(--color-sand)] bg-white transition hover:border-[var(--color-champagne)] md:grid-cols-[1fr_280px]"
      aria-label={`View details for ${venueName}`}
    >
      <div className="relative min-h-[300px] overflow-hidden bg-[var(--color-pearl)] md:min-h-full">
        <Image
          src={resolveImage(venueImage, FALLBACK_IMAGE)}
          alt={`${venueName} venue image`}
          fill
          priority
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div className="flex flex-col justify-between p-6 md:p-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-champagne)]">
            Featured Venue
          </span>
          <h3 className="mt-3 text-2xl font-black leading-tight text-[var(--color-wine)] lg:text-3xl">
            {venueName}
          </h3>
          <p className="mt-4 text-sm leading-6 text-[var(--color-stone)] line-clamp-3">
            {venue?.description || "A versatile space designed for your celebrations, with dedicated support and modern amenities."}
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm font-semibold text-[var(--color-wine)]">
              <Users className="h-4 w-4 text-[var(--color-champagne)]" aria-hidden="true" />
              {formatCapacity(venue?.capacity)}
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-[var(--color-wine)]">
              <MapPin className="h-4 w-4 text-[var(--color-champagne)]" aria-hidden="true" />
              {formatLocation(venue?.location)}
            </div>
          </div>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-wine)] transition-colors group-hover:text-[var(--color-champagne)]">
          View details
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

function SecondaryVenue({ venue }) {
  const venueName = venue?.name || "Premium venue";
  const venueImage = getVenueImage(venue);
  const venueHref = getVenueHref(venue);

  return (
    <Link
      href={venueHref}
      className="group flex gap-5 border border-[var(--color-sand)] bg-white p-3 transition hover:border-[var(--color-champagne)]"
      aria-label={`View details for ${venueName}`}
    >
      <div className="relative h-28 w-32 shrink-0 overflow-hidden bg-[var(--color-pearl)]">
        <Image
          src={resolveImage(venueImage, FALLBACK_IMAGE)}
          alt={`${venueName} venue image`}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="136px"
        />
      </div>

      <div className="flex min-w-0 flex-col justify-center py-2 pr-3">
        <h3 className="truncate text-base font-black leading-tight text-[var(--color-wine)]">
          {venueName}
        </h3>
        <p className="mt-1 truncate text-xs text-[var(--color-stone)]">
          {formatLocation(venue?.location)}
        </p>

        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-[var(--color-wine)]">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-[var(--color-champagne)]" aria-hidden="true" />
            {formatCapacity(venue?.capacity)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="font-bold">NPR</span> {formatPrice(venue?.price)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function VenueError() {
  return (
    <div className="mt-8 flex items-start gap-3 border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>We could not load featured venues right now. Please try again in a moment.</p>
    </div>
  );
}

function VenueEmptyState() {
  return (
    <div className="mt-10 border border-dashed border-[var(--color-sand)] p-12 text-center">
      <p className="text-sm font-semibold text-[var(--color-stone)]">
        Featured venues will appear here once the venue catalogue is available.
      </p>
    </div>
  );
}

function VenueFinderSkeleton() {
  return (
    <div className="mt-12 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <div className="grid border border-[var(--color-sand)] bg-white md:grid-cols-[1fr_280px]">
        <div className="min-h-[300px] animate-pulse bg-[var(--color-pearl)]" />
        <div className="p-8">
          <div className="mb-4 h-4 w-24 animate-pulse bg-[var(--color-ivory)]" />
          <div className="h-8 w-3/4 animate-pulse bg-[var(--color-pearl)]" />
          <div className="mt-6 space-y-2">
            <div className="h-4 w-1/2 animate-pulse bg-[var(--color-ivory)]" />
            <div className="h-4 w-1/3 animate-pulse bg-[var(--color-ivory)]" />
          </div>
        </div>
      </div>
      <div className="grid gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex h-[138px] gap-5 border border-[var(--color-sand)] bg-white p-3">
            <div className="h-28 w-32 shrink-0 animate-pulse bg-[var(--color-pearl)]" />
            <div className="flex flex-col justify-center py-2 pr-3">
              <div className="mb-2 h-5 w-32 animate-pulse bg-[var(--color-pearl)]" />
              <div className="h-3 w-20 animate-pulse bg-[var(--color-ivory)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
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
  return price.toLocaleString();
}

function formatCapacity(capacity) {
  if (!capacity || Number.isNaN(Number(capacity))) {
    return "Ask venue";
  }
  return `${Number(capacity).toLocaleString()} guests`;
}

function formatLocation(location) {
  if (!location) return DEFAULT_LOCATION;
  if (typeof location === "string") return location.trim() || DEFAULT_LOCATION;
  if (typeof location === "object") {
    return location.address || location.city || location.state || location.country || DEFAULT_LOCATION;
  }
  return DEFAULT_LOCATION;
}
