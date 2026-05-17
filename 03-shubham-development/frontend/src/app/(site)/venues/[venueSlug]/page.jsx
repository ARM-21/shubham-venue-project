"use client";

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  BadgeCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Coffee,
  MapPin,
  Music,
  Sparkles,
  Star,
  Thermometer,
  Truck,
  Users,
  Wallet,
  Zap
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

function normalizeImage(src) {
  if (typeof src === 'string') return src;
  if (!src || typeof src !== 'object') return '';
  return src.url || src.secureUrl || src.location || src.path || src.src || '';
}

function formatLocation(location, fallback = 'Location details available on request') {
  if (!location) return fallback;
  if (typeof location === 'string') return location;
  const parts = [location.address, location.city, location.state, location.country].filter(Boolean);
  return parts.length ? parts.join(', ') : fallback;
}

function formatShortLocation(location) {
  if (!location) return 'Shubham Venue';
  if (typeof location === 'string') return location;
  return [location.city, location.country].filter(Boolean).join(', ') || location.address || 'Shubham Venue';
}

function getRatingValue(venueData) {
  return venueData?.averageRating || venueData?.rating || venueData?.reviewsAverage || 4.8;
}

function getReviewCount(venueData) {
  return venueData?.reviewCount || venueData?.reviewsCount || venueData?.reviews?.length || 0;
}

function DossierImage({ src, alt, className = '', priority = false, sizes = '100vw' }) {
  const imageSrc = resolveImage(normalizeImage(src), FALLBACK_IMAGE);

  if (imageSrc.startsWith('data:image/')) {
    return <img src={imageSrc} alt={alt} className={cn('absolute inset-0 h-full w-full', className)} />;
  }

  return <Image src={imageSrc} alt={alt} fill priority={priority} sizes={sizes} className={className} />;
}

function VenueLoadingState() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-wine)]">
      <div className="relative h-24 w-24">
        <div className="absolute inset-0 rounded-full border-4 border-[var(--color-champagne)]/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-[var(--color-champagne)] border-t-transparent" />
      </div>
      <p className="mt-8 animate-pulse text-xl font-semibold tracking-[0.3em] text-[var(--color-champagne)]">
        SHUBHAM VENUE
      </p>
    </main>
  );
}

function VenueErrorState({ message = 'Failed to load venue' }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-ivory)] px-6 pt-40">
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-red-700 shadow-[var(--shadow-soft)]">
        {message}
      </div>
    </main>
  );
}

function VenueDossierHero({
  venueData,
  images,
  activeIndex,
  setActiveIndex,
  currencyFormatter,
  venueLocation,
  shortLocation
}) {
  const heroImage = resolveImage(normalizeImage(images[activeIndex]), FALLBACK_IMAGE);
  const price = venueData?.pricePerHour || venueData?.price || 0;
  const capacity = venueData?.capacity || venueData?.maxGuests || 0;
  const rating = getRatingValue(venueData);
  const reviewCount = getReviewCount(venueData);

  const moveGallery = (direction) => {
    setActiveIndex((current) => {
      if (!images.length) return 0;
      return (current + direction + images.length) % images.length;
    });
  };

  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-wine)] pt-32 text-white lg:pt-36">
      <div className="absolute inset-0 z-0">
        <DossierImage
          src={heroImage}
          alt=""
          priority
          sizes="100vw"
          className="scale-105 object-cover opacity-[0.18] blur-[2px]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(58,18,36,0.98)_0%,rgba(58,18,36,0.9)_42%,rgba(58,18,36,0.6)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--color-ivory)] to-transparent" />
      </div>

      <div className="site-container relative z-10 pb-12 lg:pb-14">
        <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] xl:gap-12">
          <div className="max-w-2xl lg:pt-8 xl:pt-10">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-champagne)]/30 bg-white/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[var(--color-champagne)] backdrop-blur-md">
                <BadgeCheck className="h-4 w-4" />
                Verified Venue
              </span>
              <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80 backdrop-blur-md">
                {shortLocation}
              </span>
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight text-white sm:text-5xl xl:text-6xl">
              {venueData?.name || 'Venue Dossier'}
            </h1>

            <p className="mt-6 flex max-w-xl items-start gap-3 text-base leading-7 text-white/75 sm:text-lg">
              <MapPin className="mt-1 h-5 w-5 shrink-0 text-[var(--color-champagne)]" />
              <span>{venueLocation}</span>
            </p>

            <div className="mt-7 grid max-w-xl grid-cols-2 gap-3">
              <HeroMetric label="From" value={currencyFormatter.format(price)} helper="per slot" />
              <HeroMetric label="Capacity" value={capacity || '—'} helper="guests" />
              <HeroMetric label="Rating" value={Number(rating).toFixed(1)} helper={`${reviewCount || 'New'} reviews`} />
              <HeroMetric label="Status" value="Ready" helper="for booking" />
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-white/15 bg-white/10 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-md">
            <div className="grid gap-3 md:grid-cols-[1fr_112px]">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[1.25rem] bg-[var(--color-wine)]">
                <DossierImage
                  src={heroImage}
                  alt={venueData?.name || 'Venue image'}
                  priority
                  sizes="(min-width: 1024px) 58vw, 100vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent p-4">
                  <span className="rounded-full bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--color-wine)]">
                    {activeIndex + 1} / {images.length}
                  </span>
                  {images.length > 1 ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveGallery(-1)}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-md transition hover:bg-white hover:text-[var(--color-wine)]"
                        aria-label="Previous venue image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveGallery(1)}
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/15 text-white backdrop-blur-md transition hover:bg-white hover:text-[var(--color-wine)]"
                        aria-label="Next venue image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 md:grid-cols-1">
                {images.slice(0, 4).map((image, index) => {
                  const src = resolveImage(normalizeImage(image), FALLBACK_IMAGE);
                  return (
                    <button
                      type="button"
                      key={`${src}-${index}`}
                      onClick={() => setActiveIndex(index)}
                      className={cn(
                        'relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border transition sm:rounded-xl',
                        activeIndex === index ? 'border-[var(--color-champagne)]' : 'border-white/15 opacity-75 hover:opacity-100'
                      )}
                      aria-label={`Show venue image ${index + 1}`}
                    >
                      <DossierImage src={src} alt="" sizes="150px" className="object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur-md">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-champagne)]">{label}</p>
      <p className="mt-2 truncate text-lg font-black text-white">{value}</p>
      <p className="text-xs text-white/60">{helper}</p>
    </div>
  );
}

function QuickFacts({ venueData, currencyFormatter, shortLocation }) {
  const facts = [
    {
      icon: Wallet,
      label: 'Starting price',
      value: currencyFormatter.format(venueData?.pricePerHour || venueData?.price || 0),
      detail: 'per booking slot'
    },
    {
      icon: Users,
      label: 'Guest capacity',
      value: venueData?.capacity ? `${venueData.capacity} guests` : 'Capacity listed',
      detail: venueData?.size || 'Flexible event space'
    },
    {
      icon: Star,
      label: 'Guest rating',
      value: `${Number(getRatingValue(venueData)).toFixed(1)} / 5`,
      detail: getReviewCount(venueData) ? `${getReviewCount(venueData)} reviews` : 'New listing'
    },
    {
      icon: MapPin,
      label: 'Area',
      value: shortLocation,
      detail: 'map and direction below'
    }
  ];

  return (
    <section className="site-container relative z-20 -mt-9">
      <div className="grid gap-3 rounded-[1.7rem] border border-[var(--color-sand)] bg-white p-3 shadow-[0_24px_70px_rgba(58,18,36,0.12)] sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-start gap-4 rounded-2xl bg-[var(--color-ivory)] px-4 py-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-wine)] shadow-sm">
              <fact.icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--color-champagne)]">{fact.label}</p>
              <p className="mt-1 truncate text-base font-black text-[var(--color-wine)]">{fact.value}</p>
              <p className="text-xs leading-5 text-[var(--color-stone)]">{fact.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DossierSection({ eyebrow, title, description, children, className = '' }) {
  return (
    <section className={cn('rounded-[1.7rem] border border-[var(--color-sand)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8 lg:p-10', className)}>
      <div className="mb-7 max-w-3xl">
        <p className="site-eyebrow mb-3">{eyebrow}</p>
        <h2 className="site-heading text-[var(--color-wine)]">{title}</h2>
        {description ? <p className="mt-4 text-sm leading-7 text-[var(--color-stone)] sm:text-base">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function VenueOverview({ venueData, amenities }) {
  const highlights = [
    venueData?.capacity ? `Designed for up to ${venueData.capacity} guests` : 'Flexible guest planning',
    venueData?.location?.city ? `Located in ${venueData.location.city}` : 'Easy venue coordination',
    amenities[0] || 'Professional event support'
  ];

  return (
    <DossierSection
      eyebrow="Venue Dossier"
      title="A clear profile before you book."
      description={venueData?.description || 'Review the venue capacity, facilities, location, and booking details before moving into final confirmation.'}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {highlights.map((item) => (
          <div key={item} className="rounded-2xl border border-[var(--color-sand)] bg-[var(--color-ivory)] p-5">
            <Check className="mb-4 h-5 w-5 text-[var(--color-champagne)]" />
            <p className="text-sm font-bold leading-6 text-[var(--color-wine)]">{item}</p>
          </div>
        ))}
      </div>
    </DossierSection>
  );
}

function VenueAmenities({ amenities, getAmenityIcon }) {
  return (
    <DossierSection
      eyebrow="Included Facilities"
      title="Amenities that matter on event day."
      description="A practical view of what is available with this hall, so planning stays simple."
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {amenities.map((amenity) => {
          const label = String(amenity || 'Amenity');
          const Icon = getAmenityIcon(label);
          return (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-[var(--color-sand)] bg-[var(--color-ivory)] p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[var(--color-wine)]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-[var(--color-wine)]">{label}</p>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-stone)]/55">Included</p>
              </div>
            </div>
          );
        })}
      </div>
    </DossierSection>
  );
}

function VenueLocation({ venueData, venueLocation }) {
  return (
    <DossierSection
      eyebrow="Location"
      title="Check the area before guests arrive."
      description={`Use the map to understand access, nearby roads, and the venue address in ${venueData.location?.city || 'the city'}.`}
    >
      <div className="relative min-h-[320px] overflow-hidden rounded-2xl border border-[var(--color-sand)] bg-[var(--color-ivory)]">
        <LocationMapWrapper venueData={venueData} venueLocation={venueLocation} />
      </div>
    </DossierSection>
  );
}

export default function Venue() {
  const { venueSlug } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const [occupiedDates] = useState(new Set());

  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: { date: '', slot: 'morning', guests: 50 },
    mode: 'onChange'
  });

  const date = watch('date');
  const shift = watch('slot');
  const guests = watch('guests');

  const router = useRouter();
  const searchParams = useSearchParams();
  const currencyFormatter = new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 });
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
    const filtered = menus.filter(m =>
      m.venueSlug === venueSlug || (m.halls?.includes(venueData._id)) || (venueData.menus?.includes(m._id || m.slug))
    );
    return filtered.length ? filtered : menus.slice(0, 3);
  }, [menusData, venueSlug, venueData]);

  const { data: publicHallsData = {} } = useQueryHallsPublic(undefined, { enabled: !!venueData });

  const { data: availabilityData = {} } = useQueryAvailability({
    date,
    slot: shift === 'day' ? 'wholeday' : shift,
    guests: guests || 1,
    city: venueData?.location?.city,
  }, {
    enabled: !!date && !!venueData?.location?.city,
  });

  const similarVenues = useMemo(() => {
    if (!venueData) return [];
    if (availabilityData?.halls?.length) {
      return availabilityData.halls
        .filter(h => String(h._id) !== String(venueData._id) && h.available !== false)
        .slice(0, 3);
    }

    const publicHalls = Array.isArray(publicHallsData?.halls) ? publicHallsData.halls : [];
    const otherHalls = publicHalls.filter(h => String(h._id) !== String(venueData._id));
    const sameCityHalls = otherHalls.filter(h => h.location?.city && h.location.city === venueData.location?.city);
    return (sameCityHalls.length ? sameCityHalls : otherHalls).slice(0, 3);
  }, [availabilityData, publicHallsData, venueData]);

  useEffect(() => {
    if (!searchParams) return;
    const qDate = searchParams.get('date');
    const qSlot = searchParams.get('slot');
    const qGuests = searchParams.get('guests');

    if (qDate) setValue('date', qDate);
    if (qGuests) setValue('guests', Number(qGuests));
    if (qSlot) {
      const mapped = qSlot === 'day' ? 'wholeday' : qSlot;
      setValue('slot', mapped);
    }
  }, [searchParams, setValue]);

  useEffect(() => {
    if (activeIndex >= images.length) setActiveIndex(0);
  }, [activeIndex, images.length]);

  const generateCalendarDays = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const currentDay = new Date();
    const isCurrentMonth = year === currentDay.getFullYear() && month === currentDay.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = isCurrentMonth ? currentDay.getDate() : 1;

    const cells = [];
    if (!isCurrentMonth) {
      for (let i = 0; i < firstDay; i++) cells.push(null);
    }
    for (let d = startDay; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  };

  const prevMonth = () => setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const submitBooking = (values) => {
    const serverSlot = values.slot === 'day' ? 'wholeday' : values.slot;
    const params = new URLSearchParams({ date: values.date, slot: serverSlot, guests: String(Number(values.guests)) });
    router.push(`${ROUTES.SITE.VENUE_BOOK(venueSlug)}?${params.toString()}`);
  };

  const getAmenityIcon = (amenity) => {
    const s = amenity.toLowerCase();
    if (s.includes('ac') || s.includes('air')) return Thermometer;
    if (s.includes('stage') || s.includes('decor')) return Sparkles;
    if (s.includes('audio') || s.includes('sound') || s.includes('music')) return Music;
    if (s.includes('generat') || s.includes('backup')) return Zap;
    if (s.includes('park') || s.includes('valet')) return Truck;
    if (s.includes('chang') || s.includes('room')) return Users;
    if (s.includes('coffee') || s.includes('dining')) return Coffee;
    return Check;
  };

  if (error) return <VenueErrorState />;
  if (isLoading) return <VenueLoadingState />;
  if (!venueData) return <VenueErrorState message="Venue not found" />;

  const amenities = venueData.amenities?.length
    ? venueData.amenities
    : ['Air Conditioning', 'Stage Decor', 'Sound Systems', 'Power Backup', 'Changing Rooms', 'Valet Parking'];
  const venueLocation = formatLocation(venueData.location);
  const shortLocation = formatShortLocation(venueData.location);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--color-ivory)] selection:bg-[var(--color-champagne)]/30">
      <VenueDossierHero
        venueData={venueData}
        images={images}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
        currencyFormatter={currencyFormatter}
        venueLocation={venueLocation}
        shortLocation={shortLocation}
      />

      <QuickFacts venueData={venueData} currencyFormatter={currencyFormatter} shortLocation={shortLocation} />

      <section className="site-container py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_410px] xl:grid-cols-[minmax(0,1fr)_440px] lg:items-start">
          <div className="space-y-8 lg:space-y-10">
            <VenueOverview venueData={venueData} amenities={amenities} />
            <VenueAmenities amenities={amenities} getAmenityIcon={getAmenityIcon} />
            <VenueLocation venueData={venueData} venueLocation={venueLocation} />
          </div>

          <aside id="booking-panel" className="order-first lg:order-none">
            <BookingWidget
              venueData={venueData}
              currencyFormatter={currencyFormatter}
              displayMonth={displayMonth}
              prevMonth={prevMonth}
              nextMonth={nextMonth}
              generateCalendarDays={generateCalendarDays}
              minimumBookingDate={minimumBookingDate}
              occupiedDates={occupiedDates}
              date={date}
              shift={shift}
              guests={guests}
              setValue={setValue}
              register={register}
              handleSubmit={handleSubmit}
              submitBooking={submitBooking}
            />
          </aside>
        </div>

        <MenuSection menusLoading={menusLoading} menuPackages={menuPackages} currencyFormatter={currencyFormatter} />
        <SimilarVenues similarVenues={similarVenues} />

        <section className="mt-16 space-y-8 rounded-[1.7rem] border border-[var(--color-sand)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8 lg:mt-20 lg:p-10">
          <div>
            <p className="site-eyebrow mb-3">Guest Reviews</p>
            <h2 className="site-heading text-[var(--color-wine)]">Feedback from past bookings.</h2>
          </div>
          <ReviewStats hallId={venueData._id} />
          <ReviewForm hallId={venueData._id} onReviewSubmitted={() => window.location.reload()} />
          <ReviewList hallId={venueData._id} />
        </section>
      </section>
    </main>
  );
}
