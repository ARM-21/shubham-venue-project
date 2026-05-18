"use client";

import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Search, SlidersHorizontal, Users } from "lucide-react";
import { useQueryHallsPublic } from "@queries/customer/halls-public";
import { ROUTES } from "config/routes";
import { SitePageHeader, SiteCard, SiteButton, SiteEmptyState, cn, resolveImage } from "components/site/SitePrimitives.jsx";

const FALLBACK_IMAGE = "/assets/business-images/placeholder2.jpg";

const DEFAULT_FILTERS = {
  capacity: "Any Capacity",
};

const SORT_OPTIONS = [
  { id: "price-desc", label: "Premium first" },
  { id: "price-asc", label: "Best value" },
  { id: "capacity-desc", label: "Largest first" },
];

const CAPACITY_OPTIONS = [
  "Any Capacity",
  "50 - 100 Guests",
  "100 - 300 Guests",
  "300 - 500 Guests",
  "500+ Guests",
];

export default function VenuesPage() {
  const [sortBy, setSortBy] = useState("price-desc");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const { data: hallsData, isLoading, error: hallsError } = useQueryHallsPublic();
  const hallsList = hallsData?.halls || hallsData || [];

  const processedHalls = useMemo(() => {
    let list = [...hallsList];

    if (filters.capacity !== "Any Capacity") {
      if (filters.capacity.includes("-")) {
        const parts = filters.capacity.match(/(\d+)\s*-\s*(\d+)/);
        if (parts) {
          const low = Number(parts[1]);
          const high = Number(parts[2]);
          list = list.filter(
            (h) => Number(h.capacity || 0) >= low && Number(h.capacity || 0) <= high
          );
        }
      } else {
        const min = parseCapacityMin(filters.capacity);
        if (min) list = list.filter((h) => Number(h.capacity || 0) >= min);
      }
    }

    list.sort((a, b) => {
      if (sortBy === "price-asc") return getVenuePrice(a) - getVenuePrice(b);
      if (sortBy === "price-desc") return getVenuePrice(b) - getVenuePrice(a);
      if (sortBy === "capacity-desc") return Number(b.capacity || 0) - Number(a.capacity || 0);
      return 0;
    });

    return list;
  }, [hallsList, filters, sortBy]);

  const handleCapacityChange = useCallback(
    (e) => setFilters((f) => ({ ...f, capacity: e.target.value })),
    []
  );
  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSortBy("price-desc");
  }, []);

  if (isLoading && hallsList.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--color-ivory)]">
        <SitePageHeader title="Loading venues..." />
        <div className="site-container py-12">
           <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
              <div className="h-64 animate-pulse rounded-2xl border border-[var(--color-sand)] bg-white" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                 {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-80 animate-pulse rounded-2xl border border-[var(--color-sand)] bg-white" />
                 ))}
              </div>
           </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-ivory)]">
      <SitePageHeader
        eyebrow="Venues"
        title="Browse and compare celebration halls"
        description="Every hall is verified. Filter by budget and capacity below, or check availability for a specific date."
      >
         <div className="mt-8 flex flex-wrap gap-4">
             <SiteButton href={ROUTES.SITE.SEARCH_AVAILABILITY()} variant="gold" icon={null}>
               Check Availability
             </SiteButton>
         </div>
      </SitePageHeader>

      <section id="venue-results" className="site-container py-12">
        {hallsError && (
          <div className="mb-8 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            Could not load venues right now. Please try again.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[260px_1fr] lg:items-start">
          {/* Filters sidebar */}
          <aside className="sticky top-24 h-fit rounded-2xl border border-[var(--color-sand)] bg-white p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[var(--color-champagne)]" />
                <p className="text-sm font-black text-[var(--color-wine)]">
                  {isLoading ? "Loading…" : `${processedHalls.length} venue${processedHalls.length === 1 ? "" : "s"}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-champagne)] transition hover:text-[var(--color-wine)]"
              >
                Reset
              </button>
            </div>

            {/* Capacity */}
            <div className="mt-6 space-y-2 border-t border-[var(--color-sand)] pt-6">
              <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-stone)]">
                Capacity
              </label>
              <select
                value={filters.capacity}
                onChange={handleCapacityChange}
                className="w-full rounded-md border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-2.5 text-sm font-semibold text-[var(--color-wine)] outline-none transition focus:border-[var(--color-champagne)] focus:ring-1 focus:ring-[var(--color-champagne)]"
              >
                {CAPACITY_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="mt-6 border-t border-[var(--color-sand)] pt-6">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-stone)]">
                Sort by
              </p>
              <div className="space-y-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md border px-4 py-2.5 text-sm font-bold transition",
                      sortBy === opt.id
                        ? "border-[var(--color-wine)] bg-[var(--color-wine)] text-[var(--color-champagne)]"
                        : "border-[var(--color-sand)] bg-[var(--color-ivory)] text-[var(--color-wine)] hover:border-[var(--color-champagne)]"
                    )}
                  >
                    {opt.label}
                    {sortBy === opt.id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-champagne)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div>
            <p className="mb-6 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-stone)]">
              {isLoading
                ? "Loading venues…"
                : `${processedHalls.length} hall${processedHalls.length === 1 ? "" : "s"} found`}
            </p>

            {processedHalls.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {processedHalls.map((hall) => (
                  <VenueCard key={hall._id || hall.slug} hall={hall} />
                ))}
              </div>
            ) : (
              <SiteEmptyState
                icon={Search}
                title="No venues match your filters"
                description="Try a different capacity range or increase your budget."
                action={
                  <SiteButton type="button" onClick={handleReset} variant="secondary" icon={null}>
                    Reset filters
                  </SiteButton>
                }
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function VenueCard({ hall }) {
  const name = hall?.name || "Venue";
  const image = hall?.images?.[0] || hall?.image;
  const href = hall?.slug ? ROUTES.SITE.VENUES(hall.slug) : ROUTES.SITE.VENUES("");
  const price = formatPrice(getVenuePrice(hall));
  const capacity = formatCapacity(hall?.capacity);

  return (
    <SiteCard as="article" className="group overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-champagne)] hover:shadow-[var(--shadow-card)]">
      <Link href={href} className="block h-full">
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-pearl)]">
          <Image
            src={resolveImage(image, FALLBACK_IMAGE)}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 40vw, 28vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/65 via-transparent to-transparent" />
          
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded bg-white/95 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)] backdrop-blur-md">
            <BadgeCheck className="h-3 w-3 text-[var(--color-champagne)]" />
            Verified
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="flex items-center gap-1 text-[10px] font-bold text-white/80">
              <MapPin className="h-3 w-3 shrink-0 text-[var(--color-champagne)]" />
              {formatLocation(hall?.location)}
            </p>
            <h3 className="mt-1 line-clamp-2 text-lg font-black leading-tight text-white">
              {name}
            </h3>
          </div>
        </div>

        <div className="flex flex-col p-5">
          {hall?.description && (
            <p className="line-clamp-2 text-sm leading-6 text-[var(--color-stone)]">
              {hall.description}
            </p>
          )}
          <div className={cn(
            "mt-auto flex items-center justify-between border-t border-[var(--color-sand)] pt-4",
            hall?.description ? "mt-4" : "mt-0 pt-0 border-t-0"
          )}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">
                Starting from
              </p>
              <p className="mt-0.5 text-base font-black text-[var(--color-wine)]">{price}</p>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[var(--color-stone)]">
                <Users className="h-3 w-3 text-[var(--color-champagne)]" />
                {capacity}
              </p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-wine)] text-white transition-colors group-hover:bg-[var(--color-champagne)] group-hover:text-[var(--color-wine)]">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </SiteCard>
  );
}

function parseCapacityMin(capStr) {
  const match = capStr.match(/(\d+)/);
  return match ? Number(match[0]) : null;
}

function getVenuePrice(hall) {
  return Number(hall?.pricePerHour) || Number(hall?.price) || Number(hall?.costPerHour) || 0;
}

function formatPrice(price) {
  if (!price) return "Contact";
  return `NPR ${Number(price).toLocaleString()}`;
}

function formatCapacity(capacity) {
  if (!capacity) return "Ask";
  return `${Number(capacity).toLocaleString()} guests`;
}

function formatLocation(location) {
  if (!location) return "Syangja";
  if (typeof location === "string") return location.trim() || "Syangja";
  return location.address || location.city || location.state || "Syangja";
}
