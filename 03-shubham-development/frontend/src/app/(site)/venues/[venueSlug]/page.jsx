"use client";

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Grid2X2,
  MapPin,
  Music,
  Sparkles,
  Star,
  Thermometer,
  Truck,
  Users,
  Zap,
} from 'lucide-react';
import { ROUTES } from 'config/routes';
import { useQueryHallDetailPublic } from '@queries/customer/hall-detail-public';
import { useQueryHallsPublic } from '@queries/customer/halls-public';
import { useQueryMenusPublic } from '@queries/customer/menus-public';
import { useQueryAvailability } from '@queries/customer/availability';
import { cn, resolveImage } from 'components/site/SitePrimitives';
import { getMinimumCustomerBookingDate } from 'constants/slots';

import { BookingWidget } from './components/details/BookingWidget';
import { MenuSection } from './components/details/MenuSection';
import { SimilarVenues } from './components/details/SimilarVenues';
import { LocationMapWrapper } from './components/details/LocationMapWrapper';
import { ReviewStats } from './components/reviews/ReviewStats';
import { ReviewForm } from './components/reviews/ReviewForm';
import { ReviewList } from './components/reviews/ReviewList';

const FALLBACK_IMAGE = '/assets/business-images/placeholder2.jpg';

// ── helpers ───────────────────────────────────────────────────────────────────

function normalizeImage(src) {
  if (typeof src === 'string') return src;
  if (!src || typeof src !== 'object') return '';
  return src.url || src.secureUrl || src.location || src.path || src.src || '';
}

function resolveImg(src) {
  return resolveImage(normalizeImage(src), FALLBACK_IMAGE);
}

function formatLocation(location, fallback = 'Location available on request') {
  if (!location) return fallback;
  if (typeof location === 'string') return location;
  const parts = [location.address, location.city, location.state, location.country].filter(Boolean);
  return parts.length ? parts.join(', ') : fallback;
}

function formatShortLocation(location) {
  if (!location) return '';
  if (typeof location === 'string') return location;
  return [location.city, location.state].filter(Boolean).join(', ') || location.address || '';
}

function getRating(v) { return v?.averageRating || v?.rating || v?.reviewsAverage || null; }
function getReviewCount(v) { return v?.reviewCount || v?.reviewsCount || v?.reviews?.length || 0; }

function getAmenityIcon(amenity) {
  const s = String(amenity).toLowerCase();
  if (s.includes('ac') || s.includes('air')) return Thermometer;
  if (s.includes('stage') || s.includes('decor')) return Sparkles;
  if (s.includes('audio') || s.includes('sound') || s.includes('music')) return Music;
  if (s.includes('generat') || s.includes('backup')) return Zap;
  if (s.includes('park') || s.includes('valet')) return Truck;
  if (s.includes('chang') || s.includes('room')) return Users;
  if (s.includes('coffee') || s.includes('dining')) return Coffee;
  return Check;
}

// ── HeroMeta ─────────────────────────────────────────────────────────────────

function HeroMeta({ shortLocation, venueData, price, rating, reviewCount, currencyFormatter }) {
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#C0A04C]/40 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">
          <BadgeCheck className="h-3 w-3" />
          Verified Venue
        </span>
        {shortLocation && (
          <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-white/45">
            <MapPin className="h-3 w-3 text-[#C0A04C]" />
            {shortLocation}
          </span>
        )}
      </div>

      <h1 className="text-4xl font-black leading-[1.05] text-white sm:text-5xl">
        {venueData.name}
      </h1>

      {venueData.description && (
        <p className="mt-4 max-w-lg text-sm leading-6 text-white/55 line-clamp-3">
          {venueData.description}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/10 pt-6">
        {price > 0 && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">Starting price</p>
            <p className="mt-0.5 text-base font-black text-white">
              {currencyFormatter.format(price)}
              <span className="ml-1 text-xs font-medium text-white/45">/ slot</span>
            </p>
          </div>
        )}
        {venueData.capacity && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">Capacity</p>
            <p className="mt-0.5 text-base font-black text-white">
              {venueData.capacity}
              <span className="ml-1 text-xs font-medium text-white/45">guests</span>
            </p>
          </div>
        )}
        {rating && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">Rating</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-base font-black text-white">
              <Star className="h-3.5 w-3.5 fill-[#C0A04C] text-[#C0A04C]" />
              {Number(rating).toFixed(1)}
              {reviewCount > 0 && (
                <span className="text-xs font-medium text-white/45">({reviewCount})</span>
              )}
            </p>
          </div>
        )}
      </div>

      <a
        href="#booking-panel"
        className="mt-6 inline-flex h-11 items-center rounded-2xl bg-[#C0A04C] px-6 text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224] transition hover:bg-[#d2b95f] lg:hidden"
      >
        Check availability
      </a>
    </>
  );
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function Venue() {
  const { venueSlug } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { handleSubmit, watch, setValue } = useForm({
    defaultValues: { date: '', slot: 'morning', guests: 50 },
    mode: 'onChange',
  });
  const date = watch('date');
  const shift = watch('slot');

  const router = useRouter();
  const searchParams = useSearchParams();
  const currencyFormatter = new Intl.NumberFormat('en-NP', {
    style: 'currency', currency: 'NPR', maximumFractionDigits: 0,
  });
  const minimumBookingDate = getMinimumCustomerBookingDate();

  const { data: venueDetail = {}, isLoading, error } = useQueryHallDetailPublic(venueSlug);
  const venueData = venueDetail?.hall || null;

  const images = useMemo(() => {
    const gallery = venueData?.images?.map(normalizeImage).filter(Boolean);
    return gallery?.length ? gallery : [FALLBACK_IMAGE];
  }, [venueData]);

  const { data: menusData = [], isLoading: menusLoading } = useQueryMenusPublic();
  const menuPackages = useMemo(() => {
    if (!venueData) return [];
    const menus = Array.isArray(menusData) ? menusData : [];
    const filtered = menus.filter(
      (m) => m.venueSlug === venueSlug || m.halls?.includes(venueData._id) || venueData.menus?.includes(m._id || m.slug)
    );
    return filtered.length ? filtered : menus.slice(0, 3);
  }, [menusData, venueSlug, venueData]);

  const { data: publicHallsData = {} } = useQueryHallsPublic(undefined, { enabled: !!venueData });
  const { data: availabilityData = {} } = useQueryAvailability(
    { date, slot: shift === 'day' ? 'wholeday' : shift, guests: 1, city: venueData?.location?.city },
    { enabled: !!date && !!venueData?.location?.city }
  );

  const similarVenues = useMemo(() => {
    if (!venueData) return [];
    if (availabilityData?.halls?.length) {
      return availabilityData.halls
        .filter((h) => String(h._id) !== String(venueData._id) && h.available !== false)
        .slice(0, 3);
    }
    const all = Array.isArray(publicHallsData?.halls) ? publicHallsData.halls : [];
    const others = all.filter((h) => String(h._id) !== String(venueData._id));
    const sameCity = others.filter((h) => h.location?.city === venueData.location?.city);
    return (sameCity.length ? sameCity : others).slice(0, 3);
  }, [availabilityData, publicHallsData, venueData]);

  useEffect(() => {
    if (!searchParams) return;
    const qDate = searchParams.get('date');
    const qSlot = searchParams.get('slot');
    const qGuests = searchParams.get('guests');
    if (qDate) setValue('date', qDate);
    if (qGuests) setValue('guests', Number(qGuests));
    if (qSlot) setValue('slot', qSlot === 'day' ? 'wholeday' : qSlot);
  }, [searchParams, setValue]);

  useEffect(() => {
    if (activeIndex >= images.length) setActiveIndex(0);
  }, [images.length, activeIndex]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setLightboxOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen]);

  const submitBooking = (values) => {
    const serverSlot = values.slot === 'day' ? 'wholeday' : values.slot;
    const params = new URLSearchParams({
      date: values.date,
      slot: serverSlot,
      guests: String(Number(values.guests)),
    });
    router.push(`${ROUTES.SITE.VENUE_BOOK(venueSlug)}?${params.toString()}`);
  };

  const prevPhoto = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const nextPhoto = () => setActiveIndex((i) => (i + 1) % images.length);

  // ── loading / error ───────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#3a1224]">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e8dcc8] border-t-[#C0A04C]" />
      </div>
    );
  }

  if (error || !venueData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fdfaf6] pt-44">
        <p className="rounded-2xl border border-red-100 bg-red-50 px-6 py-4 text-sm font-bold text-red-700">
          {error ? 'Failed to load venue.' : 'Venue not found.'}
        </p>
      </main>
    );
  }

  const amenities = venueData.amenities?.length
    ? venueData.amenities
    : ['Air Conditioning', 'Stage & Decor', 'Sound Systems', 'Power Backup', 'Changing Rooms', 'Valet Parking'];

  const venueLocation = formatLocation(venueData.location);
  const shortLocation = formatShortLocation(venueData.location);
  const price = venueData?.pricePerHour || venueData?.price || 0;
  const rating = getRating(venueData);
  const reviewCount = getReviewCount(venueData);

  return (
    <main className="min-h-screen bg-[#fdfaf6]">

      {/* ══ SECTION 1: Hero — dark wine, transparent navbar works here ══ */}
      <section className="overflow-hidden bg-[#3a1224] pb-0" style={{ paddingTop: 'calc(41px + 64px + 32px)' }}>
        <div className="site-container">

          {images.length > 1 ? (
            /* ── Multi-image: 2-col carousel + thumbnails ── */
            <>
              <div className="grid items-end gap-8 lg:grid-cols-[1fr_1.2fr]">

                {/* Left: venue identity */}
                <div className="py-8 lg:py-10">
                  <HeroMeta
                    shortLocation={shortLocation}
                    venueData={venueData}
                    price={price}
                    rating={rating}
                    reviewCount={reviewCount}
                    currencyFormatter={currencyFormatter}
                  />
                </div>

                {/* Right: carousel */}
                <div className="relative">
                  <div className="relative overflow-hidden rounded-2xl bg-[#2a0d1a]" style={{ aspectRatio: '4/3' }}>
                    <img src={resolveImg(images[activeIndex])} alt={venueData.name} className="h-full w-full object-cover" />
                    <button type="button" onClick={prevPhoto} aria-label="Previous photo"
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/75">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={nextPhoto} aria-label="Next photo"
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/75">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <span className="rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white">
                        {activeIndex + 1} / {images.length}
                      </span>
                      <button type="button" onClick={() => setLightboxOpen(true)}
                        className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-[11px] font-black text-[#3a1224] transition hover:bg-white">
                        <Grid2X2 className="h-3 w-3" />
                        All photos
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thumbnail strip */}
              <div className="mt-2 flex gap-1.5 overflow-x-auto pb-8">
                {images.map((img, i) => (
                  <button key={i} type="button" onClick={() => setActiveIndex(i)}
                    className={cn(
                      'relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition',
                      i === activeIndex ? 'border-[#C0A04C]' : 'border-transparent opacity-50 hover:opacity-75'
                    )}>
                    <img src={resolveImg(img)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* ── Single image: full-width stacked layout ── */
            <>
              <div className="pb-8 pt-6 lg:pb-10 lg:pt-8">
                <HeroMeta
                  shortLocation={shortLocation}
                  venueData={venueData}
                  price={price}
                  rating={rating}
                  reviewCount={reviewCount}
                  currencyFormatter={currencyFormatter}
                />
              </div>
              <div className="overflow-hidden rounded-t-2xl" style={{ aspectRatio: '21/9' }}>
                <img src={resolveImg(images[0])} alt={venueData.name} className="h-full w-full object-cover" />
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══ SECTION 2: Content + Booking Widget ══ */}
      <section className="site-container py-14 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">

          {/* Left: scrollable details */}
          <div className="space-y-0">

            {/* ── About ── */}
            {venueData.description && (
              <div className="border-b border-[#e8dcc8] pb-12 mb-12">
                <p className="site-eyebrow mb-2">The venue</p>
                <h2 className="text-2xl font-black text-[#3a1224] mb-4">About this space</h2>
                <p className="text-[15px] leading-[1.85] text-[#3a1224]/60">
                  {venueData.description}
                </p>

                {/* Key facts row */}
                <div className="mt-8 grid grid-cols-3 divide-x divide-[#e8dcc8] rounded-2xl border border-[#e8dcc8] bg-white">
                  {[
                    { label: 'Capacity', value: venueData.capacity ? `${venueData.capacity}` : '—', sub: 'guests max' },
                    { label: 'Location', value: shortLocation || 'On site', sub: 'venue area' },
                    { label: 'Status', value: 'Available', sub: 'for booking' },
                  ].map((fact) => (
                    <div key={fact.label} className="px-5 py-4 text-center">
                      <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#3a1224]/35">{fact.label}</p>
                      <p className="mt-1 text-base font-black text-[#3a1224]">{fact.value}</p>
                      <p className="text-[10px] text-[#3a1224]/40">{fact.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Amenities ── */}
            <div className="border-b border-[#e8dcc8] pb-12 mb-12">
              <p className="site-eyebrow mb-2">Facilities</p>
              <h2 className="text-2xl font-black text-[#3a1224] mb-6">What's included</h2>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {amenities.map((amenity) => {
                  const label = String(amenity);
                  const Icon = getAmenityIcon(label);
                  return (
                    <div
                      key={label}
                      className="group flex flex-col gap-3 rounded-2xl border border-[#e8dcc8] bg-white p-4 transition hover:border-[#C0A04C]/40 hover:bg-[#fbf8f2]"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3a1224] text-[#C0A04C] transition group-hover:bg-[#C0A04C] group-hover:text-[#3a1224]">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="text-sm font-bold leading-snug text-[#3a1224]">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Location ── */}
            <div>
              <p className="site-eyebrow mb-2">Where to find us</p>
              <h2 className="text-2xl font-black text-[#3a1224] mb-2">Location</h2>
              <p className="mb-5 flex items-center gap-2 text-sm text-[#3a1224]/50">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C0A04C]" />
                {venueLocation}
              </p>
              <div className="overflow-hidden rounded-2xl border border-[#e8dcc8]" style={{ minHeight: 300 }}>
                <LocationMapWrapper venueData={venueData} venueLocation={venueLocation} />
              </div>
            </div>
          </div>

          {/* Right: sticky booking widget */}
          <aside id="booking-panel" className="order-first lg:order-none lg:sticky lg:top-28 h-fit">
            <BookingWidget
              venueData={venueData}
              currencyFormatter={currencyFormatter}
              minimumBookingDate={minimumBookingDate}
              date={date}
              shift={shift}
              setValue={setValue}
              handleSubmit={handleSubmit}
              submitBooking={submitBooking}
            />
          </aside>
        </div>
      </section>

      {/* ══ SECTION 3: Menu packages ══ */}
      <div className="border-t border-[#e8dcc8]">
        <div className="site-container">
          <MenuSection
            menusLoading={menusLoading}
            menuPackages={menuPackages}
            currencyFormatter={currencyFormatter}
          />
        </div>
      </div>

      {/* ══ SECTION 4: Similar venues ══ */}
      <div className="border-t border-[#e8dcc8]">
        <div className="site-container py-14">
          <SimilarVenues similarVenues={similarVenues} />
        </div>
      </div>

      {/* ══ SECTION 5: Reviews (conditional) ══ */}
      <div className="border-t border-[#e8dcc8]">
        <div className="site-container py-14">
          <div className="mb-8">
            <p className="site-eyebrow mb-2">Guest reviews</p>
            <h2 className="text-xl font-black text-[#3a1224]">
              {reviewCount > 0
                ? `${reviewCount} review${reviewCount === 1 ? '' : 's'} from verified bookings`
                : 'Reviews'}
            </h2>
          </div>

          {reviewCount > 0 ? (
            <div className="space-y-8">
              <ReviewStats hallId={venueData._id} />
              <ReviewList hallId={venueData._id} />
            </div>
          ) : (
            <p className="mb-8 text-sm italic text-[#3a1224]/40">
              No reviews yet — be the first after your visit.
            </p>
          )}

          {/* Review form always visible (handles own auth) */}
          <div className="mt-10 border-t border-[#e8dcc8] pt-10">
            <ReviewForm
              hallId={venueData._id}
              onReviewSubmitted={() => window.location.reload()}
            />
          </div>
        </div>
      </div>

      {/* ══ LIGHTBOX ══ */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/95"
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <p className="text-sm font-black text-white">{venueData.name}</p>
                <p className="text-[10px] text-white/40">{images.length} photos</p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-bold text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                Close ✕
              </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mx-auto grid max-w-5xl grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => { setActiveIndex(i); setLightboxOpen(false); }}
                    className={cn(
                      'relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition',
                      i === activeIndex
                        ? 'border-[#C0A04C]'
                        : 'border-transparent hover:border-white/30'
                    )}
                  >
                    <img
                      src={resolveImg(img)}
                      alt={`Photo ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                    {i === activeIndex && (
                      <div className="absolute inset-0 bg-[#C0A04C]/10" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
