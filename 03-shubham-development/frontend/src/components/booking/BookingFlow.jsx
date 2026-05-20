'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';
import toast from 'react-hot-toast';
import { AlertTriangle, Building2, CalendarDays, Check, Clock, MapPin, ShieldCheck, Users } from 'lucide-react';
import Step1EventDetails from './Step1EventDetails';
import Step2MenuSelection from './Step2MenuSelection';
import Step3Decorations from './Step3Decorations';
import Step4Payment from './Step4Payment';
import BookingSuccess from './BookingSuccess';
import StepAvailabilityConfirmation from './StepAvailabilityConfirmation';
import StepContactInfo from './StepContactInfo';
import StepBookingReview from './StepBookingReview';
import BookingSidebarSummary from './BookingSidebarSummary';
import { useAuth } from 'contexts/AuthProvider';
import { getSlotMultiplier } from '../../utils/booking.utils';
import { SLOT_LABELS } from 'constants/slots';
import { cn, resolveImage } from 'components/site/SitePrimitives';

const STEP_COPY = {
  availability: {
    title: 'Confirm availability',
    shortTitle: 'Availability',
    description: 'Make sure the selected date, slot, and guest count are still open before adding details.',
  },
  contact: {
    title: 'Contact information',
    shortTitle: 'Contact',
    description: 'Add the phone and address details the venue team will use for coordination.',
  },
  details: {
    title: 'Event details',
    shortTitle: 'Event',
    description: 'Tell us what you are hosting so the team can prepare the venue correctly.',
  },
  menu: {
    title: 'Menu selection',
    shortTitle: 'Menu',
    description: 'Choose food packages or menu items that match your guest plan.',
  },
  decor: {
    title: 'Decoration options',
    shortTitle: 'Decor',
    description: 'Add optional decoration support if your event needs it.',
  },
  review: {
    title: 'Review booking',
    shortTitle: 'Review',
    description: 'Check your venue, contact, menu, decoration, and pricing details before payment.',
  },
  payment: {
    title: 'Secure payment',
    shortTitle: 'Payment',
    description: 'Complete payment while your slot is temporarily reserved.',
  },
};

const normalizeImage = (image) => {
  if (typeof image === 'string') return image;
  return image?.url || image?.secureUrl || image?.src || image?.path || image?.key || '';
};

const formatDisplayDate = (value) => {
  if (!value) return 'Date not selected';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
  return value;
};

export default function BookingFlow({ hall, initialDate, initialSlot, initialGuests }) {
  const router = useRouter();
  const { user, setUser } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingData, setBookingData] = useState({
    hallId: hall._id,
    hallSlug: hall.slug,
    hallName: hall.name,
    date: initialDate,
    slot: initialSlot,
    guests: initialGuests,
    bookingPurpose: 'customer',
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    phoneVerified: false,
    deliveryAddress: user?.address || '',
    city: user?.city || '',
    specialInstructions: '',
    contactPreference: 'email',
    saveAsDefault: false,
    eventType: '',
    eventName: '',
    specialRequirements: '',
    menuMode: 'package',
    selectedPackage: null,
    selectedMenu: [],
    menuTotal: 0,
    decorationScheme: null,
    addons: [],
    decorationTotal: 0,
  });

  const [reservationId, setReservationId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isReserved, setIsReserved] = useState(false);
  const [slotTaken, setSlotTaken] = useState(false);

  const draftKey = `booking_draft_${hall._id}`;
  const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

  const isOrganizerEligible =
    Boolean(user?.isOrganizerEligible) || (user?.role || '').toLowerCase() === 'admin';

  const steps = useMemo(() => {
    if (bookingData.bookingPurpose === 'organizer') {
      return [
        { key: 'availability', title: 'Availability', step: 1 },
        { key: 'contact', title: 'Contact', step: 2 },
        { key: 'details', title: 'Details', step: 3 },
        { key: 'review', title: 'Review', step: 4 },
        { key: 'payment', title: 'Payment', step: 5 },
      ];
    }
    return [
      { key: 'availability', title: 'Availability', step: 1 },
      { key: 'contact', title: 'Contact', step: 2 },
      { key: 'details', title: 'Details', step: 3 },
      { key: 'menu', title: 'Menu', step: 4 },
      { key: 'decor', title: 'Decor', step: 5 },
      { key: 'review', title: 'Review', step: 6 },
      { key: 'payment', title: 'Payment', step: 7 },
    ];
  }, [bookingData.bookingPurpose]);

  const currentStepKey = steps[currentStepIndex]?.key;
  const currentStep = currentStepIndex + 1;

  useEffect(() => {
    const refreshUserProfile = async () => {
      try {
        const res = await axiosInstance.get(ROUTES.API.PROFILE.ME);
        const freshUser = res.data?.user;
        if (freshUser) setUser(freshUser);
      } catch (err) {
        console.error('Failed to refresh user profile:', err);
      }
    };
    refreshUserProfile();
  }, [setUser]);

  // Restore draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw);
      if (!draft.savedAt || Date.now() - draft.savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(draftKey);
        return;
      }
      const purpose = draft.bookingData?.bookingPurpose || 'customer';
      const stepKeys = purpose === 'organizer'
        ? ['availability', 'contact', 'details', 'review', 'payment']
        : ['availability', 'contact', 'details', 'menu', 'decor', 'review', 'payment'];
      const safeIndex = Math.min(draft.currentStepIndex ?? 0, stepKeys.indexOf('payment') - 1);
      setBookingData((prev) => ({ ...prev, ...draft.bookingData }));
      setCurrentStepIndex(Math.max(0, safeIndex));
      if (safeIndex > 0) toast.success('Booking progress restored from your last session.');
    } catch {
      localStorage.removeItem(draftKey);
    }
  }, [draftKey, DRAFT_TTL_MS]);

  // Persist draft on every change, except while on the payment step
  useEffect(() => {
    if (currentStepKey === 'payment') return;
    try {
      localStorage.setItem(draftKey, JSON.stringify({ bookingData, currentStepIndex, savedAt: Date.now() }));
    } catch {
      // quota exceeded — ignore
    }
  }, [bookingData, currentStepIndex, currentStepKey, draftKey]);

  // Release the hold when:
  // (a) user closes/refreshes the tab → beforeunload fires (fetch keepalive survives teardown)
  // (b) user navigates away via SPA link → component unmounts → useEffect cleanup runs
  // Poll availability every 30 s while the user is on the middle steps (not availability, not payment).
  // Without WebSockets this is the only way to catch a slot being taken while the user fills the form.
  useEffect(() => {
    const POLL_STEPS = ['contact', 'details', 'menu', 'decor', 'review'];
    if (!POLL_STEPS.includes(currentStepKey)) return;

    const poll = async () => {
      try {
        const res = await axiosInstance.post(
          ROUTES.API.BOOKINGS.CHECK_AVAILABILITY(bookingData.hallId),
          { date: bookingData.date, slot: bookingData.slot, guests: Number(bookingData.guests) }
        );
        setSlotTaken(!res.data?.available);
      } catch {
        // silent — network blip should not interrupt the user
      }
    };

    poll(); // immediate check on step entry
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, [currentStepKey, bookingData.hallId, bookingData.date, bookingData.slot, bookingData.guests]);

  // Must use the full backend URL — native fetch has no axios baseURL.
  useEffect(() => {
    if (!reservationId) return;
    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    const releaseUrl = `${apiBase}${ROUTES.API.BOOKINGS.RESERVE_BY_ID(reservationId)}`;

    const releaseWithFetch = () => {
      fetch(releaseUrl, { method: 'DELETE', keepalive: true, credentials: 'include' });
    };

    window.addEventListener('beforeunload', releaseWithFetch);
    return () => {
      window.removeEventListener('beforeunload', releaseWithFetch);
      // Component unmounting = user navigated away mid-payment → free the slot
      releaseWithFetch();
    };
  }, [reservationId]);

  useEffect(() => {
    if (currentStepKey !== 'payment' || !timeLeft) return;
    if (timeLeft <= 0) {
      releaseReservation();
      toast.error('Reservation expired. Please try again.');
      setIsReserved(false);
      setReservationId(null);
      setCurrentStepIndex(0);
      router.push(ROUTES.SITE.VENUES(hall.slug));
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, currentStepKey, router, hall.slug]);

  const createReservation = useCallback(async () => {
    try {
      toast.loading('Reserving hall...');
      const res = await axiosInstance.post(ROUTES.API.BOOKINGS.RESERVE, {
        hallId: hall._id,
        date: initialDate,
        slot: initialSlot,
        guests: initialGuests,
        bookingPurpose: bookingData.bookingPurpose,
      });
      toast.dismiss();
      toast.success('Hall reserved for 5 minutes!');
      setReservationId(res.data.reservationId);
      setTimeLeft(res.data.expiresIn);
      setIsReserved(true);
    } catch (error) {
      toast.dismiss();
      if (error.response?.status === 400) {
        toast.error('Sorry, this hall was just booked. Please select another time.');
        router.push(ROUTES.SITE.VENUES(hall.slug));
      } else {
        toast.error(error.response?.data?.message || 'Failed to reserve hall');
      }
      throw error;
    }
  }, [hall._id, initialDate, initialSlot, initialGuests, bookingData.bookingPurpose, router, hall.slug]);

  const releaseReservation = useCallback(async () => {
    if (!reservationId) return;
    try {
      await axiosInstance.delete(ROUTES.API.BOOKINGS.RESERVE_BY_ID(reservationId));
      setReservationId(null);
      setTimeLeft(null);
      setIsReserved(false);
    } catch (error) {
      console.error('Failed to release reservation:', error);
    }
  }, [reservationId]);

  const updateBookingData = useCallback((newData) => {
    setBookingData((prev) => ({ ...prev, ...newData }));
  }, []);

  const handlePurposeChange = (purpose) => {
    if (purpose === bookingData.bookingPurpose) return;
    setBookingData((prev) => ({ ...prev, bookingPurpose: purpose }));
  };

  const nextStep = useCallback(async () => {
    const nextIndex = currentStepIndex + 1;
    const nextKey = steps[nextIndex]?.key;
    if (!nextKey) return;
    if (nextKey === 'payment') {
      try {
        await createReservation();
        setCurrentStepIndex(nextIndex);
      } catch {
        return;
      }
    } else {
      setCurrentStepIndex(nextIndex);
    }
  }, [createReservation, currentStepIndex, steps]);

  const prevStep = useCallback(() => {
    if (currentStepKey === 'payment' && reservationId) releaseReservation();
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  }, [currentStepKey, currentStepIndex, releaseReservation, reservationId]);

  const goToStep = useCallback((targetIndex) => {
    if (targetIndex > currentStepIndex) return;
    if (currentStepKey === 'payment' && reservationId && targetIndex < currentStepIndex)
      releaseReservation();
    setCurrentStepIndex(targetIndex);
  }, [currentStepIndex, currentStepKey, releaseReservation, reservationId]);

  const calculateTotal = useCallback(() => {
    const pricePerHour = Number(hall?.pricePerHour) || 0;
    const multiplier = getSlotMultiplier(bookingData?.slot);
    const hallPrice = pricePerHour * multiplier;
    const menuTotal =
      bookingData.bookingPurpose === 'organizer' ? 0 : Number(bookingData?.menuTotal) || 0;
    const decorationTotal =
      bookingData.bookingPurpose === 'organizer' ? 0 : Number(bookingData?.decorationTotal) || 0;
    const total = hallPrice + menuTotal + decorationTotal;
    return Number.isFinite(total) ? total : 0;
  }, [
    hall?.pricePerHour,
    bookingData?.slot,
    bookingData?.bookingPurpose,
    bookingData?.menuTotal,
    bookingData?.decorationTotal,
  ]);

  if (bookingSuccess) {
    return <BookingSuccess bookingReference={bookingSuccess} />;
  }

  const pricePerHour = Number(hall?.pricePerHour) || 0;
  const multiplier = getSlotMultiplier(bookingData?.slot);
  const hallPrice = pricePerHour * multiplier;
  const total = calculateTotal();
  const currentStepMeta = STEP_COPY[currentStepKey] || steps[currentStepIndex] || {};
  const progressPercent = (currentStep / steps.length) * 100;
  const hallImage = resolveImage(
    normalizeImage(hall?.images?.[0]),
    '/assets/business-images/placeholder2.jpg'
  );
  const locationText =
    [hall?.location?.city || hall?.city, hall?.location?.state || hall?.state]
      .filter(Boolean)
      .join(', ') ||
    hall?.address ||
    'Shubham Venue';

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#3a1224] selection:bg-[#C0A04C]/30">

      {/* ── Hero — matches site-wide transparent-navbar pattern (pt-40) ── */}
      <section className="relative isolate overflow-hidden bg-[#3a1224] pb-14 pt-40">
        {/* Blurred background image */}
        <img
          src={hallImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-20 blur-sm"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(58,18,36,0.97),rgba(58,18,36,0.88)_55%,rgba(58,18,36,0.72))]" />
        {/* Bottom fade into page background */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FDFCFB] to-transparent" />

        <div className="relative z-10 mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb label */}
          <p className="text-[10px] font-black uppercase tracking-[0.38em] text-[#C0A04C]">
            Venue Booking
          </p>

          {/* Hall identity */}
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-white/20 shadow-xl">
              <img src={hallImage} alt={hall?.name} className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl">
                {hall?.name || 'Complete your booking'}
              </h1>
              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/60">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-[#C0A04C]" />
                {locationText}
              </p>
            </div>
          </div>

          {/* Booking facts */}
          <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
            <HeroFact icon={CalendarDays} label="Date" value={formatDisplayDate(bookingData.date)} />
            <HeroFact icon={Clock} label="Slot" value={SLOT_LABELS[bookingData.slot] || bookingData.slot} />
            <HeroFact icon={Users} label="Guests" value={`${bookingData.guests} guests`} />
          </div>

          {/* Step progress strip */}
          <div className="mt-8 flex flex-wrap items-center gap-1.5">
            {steps.map((step, idx) => {
              const meta = STEP_COPY[step.key] || step;
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => goToStep(idx)}
                  disabled={idx > currentStepIndex}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black transition-all',
                    isCurrent && 'border-[#C0A04C] bg-[#C0A04C] text-[#3a1224]',
                    isCompleted && 'cursor-pointer border-white/20 bg-white/10 text-white hover:bg-white/20',
                    idx > currentStepIndex && 'cursor-default border-white/10 bg-transparent text-white/30'
                  )}
                >
                  <span className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black',
                    isCurrent && 'bg-[#3a1224] text-[#C0A04C]',
                    isCompleted && 'bg-white text-[#3a1224]',
                    idx > currentStepIndex && 'bg-white/15 text-white/40'
                  )}>
                    {isCompleted ? <Check className="h-2.5 w-2.5" /> : step.step}
                  </span>
                  <span className="hidden sm:inline">{meta.shortTitle || step.title}</span>
                </button>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-1 max-w-2xl overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[#C0A04C] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-[1320px] px-4 pb-28 pt-8 sm:px-6 sm:pt-10 lg:pb-16 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_356px] lg:items-start lg:gap-8">

          {/* ── Left: step content ── */}
          <div className="min-w-0">

            {/* Slot-taken warning — shown when background poll detects the slot was booked */}
            {slotTaken && (
              <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <span className="font-semibold">This slot was just taken by another user.</span>
                <button
                  type="button"
                  onClick={() => setCurrentStepIndex(0)}
                  className="ml-auto text-[11px] font-black uppercase tracking-widest text-red-700 underline underline-offset-2"
                >
                  Go back & reselect
                </button>
              </div>
            )}

            {/* Reservation expiry banner */}
            {isReserved && timeLeft !== null && (
              <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                <span className="font-semibold">
                  {currentStepKey === 'payment' ? 'Complete payment in' : 'Reservation expires in'}
                </span>
                <span className="font-black tabular-nums text-amber-700">
                  {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              </div>
            )}

            {/* Step header */}
            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#C0A04C]">
                Step {currentStep} of {steps.length}
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-[#3a1224] sm:text-3xl">
                {currentStepMeta.title}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#3a1224]/55">
                {currentStepMeta.description}
              </p>
            </div>

            {/* Booking mode selector — step 1, organizer-eligible users only */}
            {isOrganizerEligible && currentStepIndex === 0 && currentStepKey === 'availability' && (
              <div className="mb-5 rounded-2xl border border-[#e8dcc8] bg-white p-4 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">
                  Booking mode
                </p>
                <p className="mt-1 text-sm font-black text-[#3a1224]">
                  How would you like to use this booking?
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {[
                    {
                      value: 'customer',
                      label: 'Private booking',
                      desc: 'Full booking with menu and decoration choices.',
                      details: '7-step guided flow',
                      icon: Users,
                    },
                    {
                      value: 'organizer',
                      label: 'Organizer venue booking',
                      desc: 'Reserve this hall for a public event. Create the event page from your dashboard after payment.',
                      details: '5-step professional flow',
                      icon: Building2,
                    },
                  ].map((type) => {
                    const IconComponent = type.icon;
                    const isSelected = bookingData.bookingPurpose === type.value;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handlePurposeChange(type.value)}
                        className={cn(
                          'flex items-start gap-3 rounded-2xl border p-3.5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C0A04C]',
                          isSelected
                            ? 'border-[#C0A04C] bg-[#C0A04C]/8 shadow-[0_0_0_1px_#C0A04C]'
                            : 'border-[#e8dcc8] bg-[#f8f4ed] hover:border-[#C0A04C]/60'
                        )}
                      >
                        <span className={cn(
                          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                          isSelected ? 'bg-[#C0A04C] text-[#3a1224]' : 'bg-white text-[#3a1224]/50'
                        )}>
                          <IconComponent className="h-4.5 w-4.5" />
                        </span>
                        <span>
                          <span className="block text-sm font-black text-[#3a1224]">{type.label}</span>
                          <span className="mt-0.5 block text-xs leading-5 text-[#3a1224]/55">
                            {type.desc}
                          </span>
                          <span className="mt-1.5 block text-[9px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">
                            {type.details}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step form card */}
            <div className="rounded-3xl border border-[#e8dcc8] bg-white shadow-[0_8px_40px_-18px_rgba(58,18,36,0.15)] p-5 sm:p-7 lg:p-8">
              {currentStepKey === 'availability' && (
                <StepAvailabilityConfirmation
                  hallId={hall._id}
                  date={bookingData.date}
                  slot={bookingData.slot}
                  guests={bookingData.guests}
                  reservationId={reservationId}
                  onConfirm={nextStep}
                  onChangeSelection={prevStep}
                />
              )}
              {currentStepKey === 'contact' && (
                <StepContactInfo
                  data={bookingData}
                  onUpdate={updateBookingData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStepKey === 'details' && (
                <Step1EventDetails
                  data={bookingData}
                  onUpdate={updateBookingData}
                  onNext={nextStep}
                  onPrev={prevStep}
                  bookingPurpose={bookingData.bookingPurpose}
                />
              )}
              {currentStepKey === 'menu' && (
                <Step2MenuSelection
                  data={bookingData}
                  onUpdate={updateBookingData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStepKey === 'decor' && bookingData.bookingPurpose === 'customer' && (
                <Step3Decorations
                  data={bookingData}
                  onUpdate={updateBookingData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStepKey === 'review' && (
                <StepBookingReview
                  hall={hall}
                  bookingData={bookingData}
                  calculateTotal={calculateTotal}
                  onNext={nextStep}
                  onPrev={prevStep}
                  onEditStep={(stepKey) => {
                    const idx = steps.findIndex((s) => s.key === stepKey);
                    if (idx !== -1) goToStep(idx);
                  }}
                />
              )}
              {currentStepKey === 'payment' && (
                <Step4Payment
                  data={{ ...bookingData, hallPrice, total }}
                  reservationId={reservationId}
                  onUpdate={updateBookingData}
                  onReservationRelease={() => setReservationId(null)}
                  onNext={(bookingRef) => {
                    try { localStorage.removeItem(draftKey); } catch {}
                    setReservationId(null);
                    setBookingSuccess(bookingRef);
                  }}
                  onPrev={prevStep}
                />
              )}
            </div>

            {/* Trust row */}
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
              <TrustBadge icon={ShieldCheck} text="SSL-secured checkout" />
              <TrustBadge icon={CalendarDays} text="Slot held during checkout only" />
              <TrustBadge icon={Users} text="No hidden charges" />
            </div>
          </div>

          {/* ── Right: sticky summary sidebar ── */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <BookingSidebarSummary
                hall={hall}
                bookingData={bookingData}
                calculateTotal={calculateTotal}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#e8dcc8] bg-white/95 px-4 py-3 shadow-[0_-4px_24px_rgba(58,18,36,0.09)] backdrop-blur-sm lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#3a1224]/40">
              Estimated total
            </p>
            <p className="text-lg font-black text-[#3a1224]">NPR {total.toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-[#e8dcc8] bg-[#f8f4ed] px-3 py-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C0A04C]" />
            <span className="text-[10px] font-bold text-[#3a1224]/55">Secure booking</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroFact({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-[#C0A04C]">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1.5 truncate text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function TrustBadge({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[#3a1224]/40">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#C0A04C]" />
      {text}
    </div>
  );
}
