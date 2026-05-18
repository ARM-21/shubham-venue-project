"use client";

import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Search, SlidersHorizontal, Users } from "lucide-react";
import { useQueryHallsPublic } from "@queries/customer/halls-public";
import { ROUTES } from "config/routes";
import { SiteEmptyState, cn, resolveImage } from "components/site/SitePrimitives.jsx";

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
      <div className="flex min-h-screen items-center justify-center bg-[#3a1224]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e8dcc8] border-t-[#C0A04C]" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdfaf6]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#3a1224] pb-14 pt-40">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fdfaf6] to-transparent" />
        <div className="site-container relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.38em] text-[#C0A04C]">
            Venues
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-black leading-tight text-white sm:text-4xl">
            Browse and compare celebration halls
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
            Every hall is verified. Filter by budget and capacity below, or check availability for a specific date.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={ROUTES.SITE.SEARCH_AVAILABILITY()}
              className="flex h-11 items-center rounded-2xl bg-[#C0A04C] px-5 text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224] transition hover:bg-[#d2b95f]"
            >
              Check availability
            </Link>
            <a
              href="#venue-results"
              className="flex h-11 items-center rounded-2xl border border-white/20 bg-white/10 px-5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition hover:bg-white/15"
            >
              Browse all
            </a>
          </div>
        </div>
      </section>

      {/* Results */}
      <section id="venue-results" className="site-container py-12">
        {hallsError && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
            Could not load venues right now. Please try again.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:items-start">
          {/* Filters sidebar */}
          <aside className="h-fit rounded-2xl border border-[#e8dcc8] bg-white p-5 lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#C0A04C]" />
                <p className="text-sm font-black text-[#3a1224]">
                  {isLoading ? "Loading…" : `${processedHalls.length} venue${processedHalls.length === 1 ? "" : "s"}`}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C0A04C] transition hover:text-[#3a1224]"
              >
                Reset
              </button>
            </div>

            {/* Capacity */}
            <div className="mt-5 space-y-1.5 border-t border-[#e8dcc8] pt-5">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/50">
                Capacity
              </label>
              <select
                value={filters.capacity}
                onChange={handleCapacityChange}
                className="w-full rounded-2xl border border-[#e8dcc8] bg-[#fbf8f2] px-4 py-2.5 text-sm font-medium text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15"
              >
                {CAPACITY_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="mt-5 border-t border-[#e8dcc8] pt-5">
              <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/50">
                Sort by
              </p>
              <div className="space-y-1.5">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSortBy(opt.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-2xl border px-4 py-2.5 text-sm font-bold transition",
                      sortBy === opt.id
                        ? "border-[#3a1224] bg-[#3a1224] text-[#C0A04C]"
                        : "border-[#e8dcc8] bg-[#fbf8f2] text-[#3a1224] hover:border-[#C0A04C]/50"
                    )}
                  >
                    {opt.label}
                    {sortBy === opt.id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#C0A04C]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/45">
              {isLoading
                ? "Loading venues…"
                : `${processedHalls.length} hall${processedHalls.length === 1 ? "" : "s"} found`}
            </p>

            {processedHalls.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex h-10 items-center rounded-2xl border border-[#e8dcc8] bg-white px-5 text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224] transition hover:bg-[#f8f4ed]"
                  >
                    Reset filters
                  </button>
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
    <article className="group overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white transition hover:border-[#C0A04C]/50">
      <Link href={href} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f5f0eb]">
          <Image
            src={resolveImage(image, FALLBACK_IMAGE)}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 40vw, 28vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/65 via-transparent to-transparent" />
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-white/50 bg-white/90 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#3a1224]">
            <BadgeCheck className="h-3 w-3 text-[#C0A04C]" />
            Verified
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <p className="flex items-center gap-1 text-[10px] font-bold text-white/65">
              <MapPin className="h-3 w-3 shrink-0 text-[#C0A04C]" />
              {formatLocation(hall?.location)}
            </p>
            <h3 className="mt-1 line-clamp-2 text-lg font-black leading-tight text-white">
              {name}
            </h3>
          </div>
        </div>

        <div className="p-4">
          {hall?.description && (
            <p className="line-clamp-2 text-sm leading-5 text-[#3a1224]/50">
              {hall.description}
            </p>
          )}
          <div className={cn(
            "flex items-center justify-between border-t border-[#e8dcc8] pt-4",
            hall?.description ? "mt-4" : "mt-0 pt-0 border-t-0"
          )}>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">
                From
              </p>
              <p className="mt-0.5 text-base font-black text-[#3a1224]">{price}</p>
              <p className="flex items-center gap-1 text-[10px] text-[#3a1224]/40">
                <Users className="h-3 w-3" />
                {capacity}
              </p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#3a1224] text-[#C0A04C] transition group-hover:bg-[#C0A04C] group-hover:text-[#3a1224]">
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </article>
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
