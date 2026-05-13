"use client";

import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowRight,
  BadgeCheck,
  Calendar,
  Clock,
  MapPin,
  Search,
  Settings2,
  SlidersHorizontal,
  Users,
  Wallet,
} from "lucide-react";
import { useQueryAvailability } from "@queries/customer/availability";
import { useQueryHallsPublic } from "@queries/customer/halls-public";
import { ROUTES } from "config/routes";
import {
  SiteButton,
  SiteCard,
  SiteEmptyState,
  SiteSectionHeader,
  cn,
  resolveImage,
} from "components/site/SitePrimitives.jsx";

const FALLBACK_IMAGE = "/assets/business-images/placeholder2.jpg";
const DEFAULT_FILTERS = {
  date: "",
  timeSlot: "",
  capacity: "Any Capacity",
  price: 500000,
};

const SORT_OPTIONS = [
  { id: "price-desc", label: "Premium first" },
  { id: "price-asc", label: "Best value" },
  { id: "capacity-desc", label: "Largest spaces" },
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
  const today = new Date().toISOString().split("T")[0];

  const { data: hallsData, isLoading: hallsLoading, error: hallsError } = useQueryHallsPublic();
  const hallsList = hallsData?.halls || hallsData || [];

  const availabilityParams =
    filters.date && filters.timeSlot
      ? {
          date: filters.date,
          slot: mapClientSlotToServer(filters.timeSlot),
          guests: parseCapacityToGuests(filters.capacity) || 1,
        }
      : null;

  const { data: availabilityData, isLoading: availabilityLoading } = useQueryAvailability(
    availabilityParams,
    { enabled: !!availabilityParams }
  );

  const processedHalls = useMemo(() => {
    let list = [...hallsList];

    if (availabilityData?.halls) {
      const availableIds = new Set(
        availabilityData.halls
          .filter((hall) => hall.available !== false)
          .map((hall) => hall._id)
      );
      list = list.filter((hall) => availableIds.has(hall._id));
    }

    if (filters.capacity !== "Any Capacity") {
      const min = parseCapacityToGuests(filters.capacity) || 0;

      if (filters.capacity.includes("-")) {
        const parts = filters.capacity.match(/(\d+)\s*-\s*(\d+)/);
        if (parts) {
          const low = Number(parts[1]);
          const high = Number(parts[2]);
          list = list.filter((hall) => Number(hall.capacity || 0) >= low && Number(hall.capacity || 0) <= high);
        }
      } else {
        list = list.filter((hall) => Number(hall.capacity || 0) >= min);
      }
    }

    list = list.filter((hall) => getVenuePrice(hall) <= filters.price);

    list.sort((a, b) => {
      if (sortBy === "price-asc") return getVenuePrice(a) - getVenuePrice(b);
      if (sortBy === "price-desc") return getVenuePrice(b) - getVenuePrice(a);
      if (sortBy === "capacity-desc") return Number(b.capacity || 0) - Number(a.capacity || 0);
      return 0;
    });

    return list;
  }, [hallsList, filters, sortBy, availabilityData]);

  const handleDateChange = useCallback((e) => {
    setFilters((current) => ({ ...current, date: e.target.value }));
  }, []);

  const handleTimeSlotChange = useCallback((e) => {
    setFilters((current) => ({ ...current, timeSlot: e.target.value }));
  }, []);

  const handleCapacityChange = useCallback((e) => {
    setFilters((current) => ({ ...current, capacity: e.target.value }));
  }, []);

  const handlePriceChange = useCallback((e) => {
    setFilters((current) => ({ ...current, price: Number(e.target.value) }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setSortBy("price-desc");
    toast.success("Filters reset");
  }, []);

  const handleSearchClick = useCallback(() => {
    if (!filters.date || !filters.timeSlot) {
      toast.error("Please select date and time slot");
      return;
    }

    toast.success("Showing available venues");
  }, [filters.date, filters.timeSlot]);

  const isLoading = hallsLoading || availabilityLoading;
  const hasActiveAvailabilitySearch = Boolean(filters.date && filters.timeSlot);

  if (hallsLoading && hallsList.length === 0) {
    return <VenuesLoadingState />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[var(--color-ivory)]">
      <VenuesHeader
        filters={filters}
        today={today}
        onDateChange={handleDateChange}
        onTimeSlotChange={handleTimeSlotChange}
        onCapacityChange={handleCapacityChange}
        onSearchClick={handleSearchClick}
      />

      <section id="venue-results" className="bg-[var(--color-ivory)] py-14 sm:py-16 lg:py-20">
        <div className="site-container">
          <SiteSectionHeader
            eyebrow="Browse Venues"
            title="Available Celebration Spaces"
            description={
              hasActiveAvailabilitySearch
                ? "These venues match the date and time slot you selected."
                : "Start with the full venue collection, then refine by budget, capacity, or availability."
            }
            action={
              <SiteButton
                href={ROUTES.SITE.SEARCH_AVAILABILITY()}
                variant="secondary"
                icon={Calendar}
              >
                Search by date
              </SiteButton>
            }
          />

          {hallsError ? (
            <div className="mb-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
              We could not load venues right now. Please try again in a moment.
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
            <VenueFilters
              filters={filters}
              sortBy={sortBy}
              isLoading={isLoading}
              resultsCount={processedHalls.length}
              onPriceChange={handlePriceChange}
              onSortChange={setSortBy}
              onReset={handleResetFilters}
            />

            <section aria-label="Venue results">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-[var(--color-wine)]">
                    {processedHalls.length} {processedHalls.length === 1 ? "venue" : "venues"} found
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-stone)]">
                    {isLoading ? "Refreshing availability..." : "Sorted by your selected preference."}
                  </p>
                </div>
              </div>

              {processedHalls.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {processedHalls.map((hall) => (
                    <VenueCard
                      key={hall._id || hall.slug || hall.name}
                      hall={hall}
                    />
                  ))}
                </div>
              ) : (
                <SiteEmptyState
                  icon={Search}
                  title="No matching venues"
                  description="Adjust your date, capacity, or budget filters and the matching venues will appear here."
                  action={
                    <SiteButton onClick={handleResetFilters} variant="secondary">
                      Reset filters
                    </SiteButton>
                  }
                />
              )}
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}

function VenuesHeader({
  filters,
  today,
  onDateChange,
  onTimeSlotChange,
  onCapacityChange,
  onSearchClick,
}) {
  return (
    <section className="bg-[linear-gradient(180deg,#3a1224_0%,#2b0e1a_100%)] pt-40 pb-12 text-white sm:pb-16">
      <div className="site-container">
        <div className="max-w-3xl">
          <p className="site-eyebrow mb-4">Venue Selection</p>
          <h1 className="text-4xl font-black leading-[1.04] tracking-normal text-white sm:text-5xl lg:text-6xl">
            Compare venues and choose the right hall.
          </h1>
          <p className="mt-5 max-w-2xl text-base font-medium leading-7 text-white/70 md:text-lg">
            Browse verified celebration spaces with clear capacity, location,
            and starting price. Add a date and slot when you are ready to narrow
            the catalogue.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <SiteButton
              href={ROUTES.SITE.SEARCH_AVAILABILITY()}
              variant="gold"
              size="lg"
              icon={Calendar}
            >
              Check availability
            </SiteButton>
            <SiteButton
              href="#venue-results"
              variant="secondary"
              size="lg"
              icon={ArrowRight}
              className="border-white/30 bg-white/10 text-white hover:bg-white hover:text-[var(--color-wine)]"
            >
              Browse venues
            </SiteButton>
          </div>
        </div>

        <VenueSearchPanel
          filters={filters}
          today={today}
          onDateChange={onDateChange}
          onTimeSlotChange={onTimeSlotChange}
          onCapacityChange={onCapacityChange}
          onSearchClick={onSearchClick}
        />
      </div>
    </section>
  );
}

function VenueSearchPanel({
  filters,
  today,
  onDateChange,
  onTimeSlotChange,
  onCapacityChange,
  onSearchClick,
}) {
  return (
    <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-2xl sm:p-4">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <FilterField icon={Calendar}>
          <input
            type="date"
            min={today}
            value={filters.date}
            onChange={onDateChange}
            className="w-full bg-transparent text-sm font-black text-white outline-none [color-scheme:dark] placeholder:text-white/45"
            aria-label="Select venue date"
          />
        </FilterField>

        <FilterField icon={Clock}>
          <select
            value={filters.timeSlot}
            onChange={onTimeSlotChange}
            className="w-full appearance-none bg-transparent text-sm font-black text-white outline-none"
            aria-label="Select time slot"
          >
            <option value="" className="bg-[#3a1224] text-white">Any time slot</option>
            <option value="morning" className="bg-[#3a1224] text-white">Morning</option>
            <option value="afternoon" className="bg-[#3a1224] text-white">Afternoon</option>
            <option value="evening" className="bg-[#3a1224] text-white">Evening</option>
            <option value="full" className="bg-[#3a1224] text-white">Full day</option>
          </select>
        </FilterField>

        <FilterField icon={Users}>
          <select
            value={filters.capacity}
            onChange={onCapacityChange}
            className="w-full appearance-none bg-transparent text-sm font-black text-white outline-none"
            aria-label="Select capacity"
          >
            {CAPACITY_OPTIONS.map((option) => (
              <option key={option} className="bg-[#3a1224] text-white">{option}</option>
            ))}
          </select>
        </FilterField>

        <button
          type="button"
          onClick={onSearchClick}
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[var(--color-champagne)] px-6 text-sm font-black text-[var(--color-wine)] shadow-[0_18px_40px_-24px_rgba(192,160,76,0.9)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-champagne-light)]"
        >
          Search
          <Search className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

function VenueFilters({
  filters,
  sortBy,
  isLoading,
  resultsCount,
  onPriceChange,
  onSortChange,
  onReset,
}) {
  return (
    <aside className="h-fit rounded-2xl border border-[var(--color-sand)] bg-white p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-28">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-ivory)] text-[var(--color-wine)]">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-sm font-black text-[var(--color-wine)]">Refine venues</h2>
            <p className="text-xs text-[var(--color-stone)]">
              {isLoading ? "Loading..." : `${resultsCount} matches`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-champagne)] transition-colors hover:text-[var(--color-wine)]"
        >
          Reset
        </button>
      </div>

      <div className="mt-7 border-t border-[var(--color-sand)] pt-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-stone)]">
            Budget
          </span>
          <span className="text-sm font-black text-[var(--color-wine)]">
            NPR {filters.price.toLocaleString()}
          </span>
        </div>
        <input
          type="range"
          min="10000"
          max="500000"
          step="5000"
          value={filters.price}
          onChange={onPriceChange}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-[var(--color-pearl)] accent-[var(--color-champagne)]"
          aria-label="Maximum venue budget"
        />
      </div>

      <div className="mt-7 border-t border-[var(--color-sand)] pt-6">
        <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-stone)]">
          <Settings2 className="h-4 w-4 text-[var(--color-champagne)]" aria-hidden="true" />
          Sort by
        </div>
        <div className="grid gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSortChange(option.id)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-black transition-all",
                sortBy === option.id
                  ? "border-[var(--color-wine)] bg-[var(--color-wine)] text-white"
                  : "border-[var(--color-sand)] bg-[var(--color-ivory)] text-[var(--color-wine)] hover:border-[var(--color-champagne)]"
              )}
            >
              {option.label}
              {sortBy === option.id ? (
                <span className="h-2 w-2 rounded-full bg-[var(--color-champagne)]" />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function VenueCard({ hall }) {
  const hallName = hall?.name || "Premium venue";
  const hallImage = hall?.images?.[0] || hall?.image;
  const hallSlug = hall?.slug;
  const hallHref = hallSlug ? ROUTES.SITE.VENUES(hallSlug) : ROUTES.SITE.VENUES("");

  return (
    <SiteCard
      as="article"
      className="group overflow-hidden rounded-2xl border-[var(--color-sand)] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-champagne)]"
    >
      <Link
        href={hallHref}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-champagne)]"
        aria-label={`View details for ${hallName}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-pearl)]">
          <Image
            src={resolveImage(hallImage, FALLBACK_IMAGE)}
            alt={`${hallName} venue image`}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 40vw, 26vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/58 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)] shadow-xl backdrop-blur-md">
            <BadgeCheck className="h-3.5 w-3.5 text-[var(--color-champagne)]" aria-hidden="true" />
            Verified
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-white/85">
              <MapPin className="h-3.5 w-3.5 text-[var(--color-champagne)]" aria-hidden="true" />
              {formatLocation(hall?.location)}
            </p>
            <h3 className="line-clamp-2 text-2xl font-black leading-tight text-white">
              {hallName}
            </h3>
          </div>
        </div>

        <div className="p-5">
          <p className="line-clamp-2 text-sm leading-6 text-[var(--color-stone)]">
            {hall?.description ||
              "A dependable celebration space for weddings, gatherings, and hosted events."}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <VenueMetric icon={Wallet} label="Starting" value={formatPrice(getVenuePrice(hall))} />
            <VenueMetric icon={Users} label="Capacity" value={formatCapacity(hall?.capacity)} />
            <VenueMetric icon={MapPin} label="Area" value={formatShortLocation(hall?.location)} />
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[var(--color-sand)] pt-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-stone)]">
                Details
              </p>
              <p className="mt-1 text-sm font-black text-[var(--color-wine)]">
                View hall profile
              </p>
            </div>
            <span
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-wine)] text-white transition-all duration-300 group-hover:bg-[var(--color-champagne)] group-hover:text-[var(--color-wine)]"
              aria-hidden="true"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        </div>
      </Link>
    </SiteCard>
  );
}

function VenueMetric({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] p-3">
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--color-stone)]">
        <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--color-champagne)]" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-xs font-black text-[var(--color-wine)]" title={value}>
        {value}
      </p>
    </div>
  );
}

function FilterField({ icon: Icon, children }) {
  return (
    <label className="flex min-h-14 items-center gap-3 rounded-xl border border-white/15 bg-white/[0.08] px-4 transition-colors focus-within:border-[var(--color-champagne)]">
      <Icon className="h-4 w-4 shrink-0 text-[var(--color-champagne)]" aria-hidden="true" />
      {children}
    </label>
  );
}

function VenuesLoadingState() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-wine)]">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--color-champagne)] border-t-transparent" />
      <p className="site-eyebrow mt-4">Loading Venues</p>
    </div>
  );
}

function parseCapacityToGuests(capStr) {
  if (!capStr || capStr === "Any Capacity") return null;
  const match = capStr.match(/(\d+)/);
  return match ? Number(match[0]) : null;
}

function mapClientSlotToServer(slot) {
  if (!slot) return null;
  if (slot === "full") return "wholeday";
  if (slot === "morning") return "morning";
  return "evening";
}

function getVenuePrice(hall) {
  return Number(hall?.pricePerHour) || Number(hall?.price) || Number(hall?.costPerHour) || 0;
}

function formatPrice(price) {
  if (!price || Number.isNaN(Number(price))) return "Contact";
  return `NPR ${Number(price).toLocaleString()}`;
}

function formatCapacity(capacity) {
  if (!capacity || Number.isNaN(Number(capacity))) return "Ask";
  return `${Number(capacity).toLocaleString()} Guests`;
}

function formatLocation(location) {
  if (!location) return "Syangja";
  if (typeof location === "string") return location.trim() || "Syangja";
  return location.address || location.city || location.state || location.country || "Syangja";
}

function formatShortLocation(location) {
  if (!location) return "Syangja";
  if (typeof location === "string") return location.trim() || "Syangja";
  return location.city || location.state || location.country || "Syangja";
}
