'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from 'lib/axios';
import { useAuth } from 'contexts/AuthProvider';
import { ROUTES } from 'config/routes';
import { AlertCircle, CalendarCheck, CheckCircle2, Clock, Search, Sparkles, Users } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { BOOKING_LEAD_TIME_MESSAGE, SLOT_LABELS, getMinimumCustomerBookingDate } from 'constants/slots';

import { AvailabilityForm } from '../../app/(site)/search-availability/components/modern/AvailabilityForm';
import { VenueResultCard } from '../../app/(site)/search-availability/components/modern/VenueResultCard';
import { BookingSummary } from '../../app/(site)/search-availability/components/modern/BookingSummary';

const pathSteps = [
  { label: 'Date', icon: CalendarCheck },
  { label: 'Slot', icon: Clock },
  { label: 'Guests', icon: Users },
  { label: 'Hall', icon: CheckCircle2 },
];

function ResultsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-52 animate-pulse rounded-2xl border border-[#3a1224]/5 bg-white/70" />
      ))}
    </div>
  );
}

function EmptyResults({ title, description }) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-[#C0A04C]/35 bg-white/70 px-6 py-14 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fdfaf6] text-[#C0A04C]">
        <Search className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-black text-[#3a1224]">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#3a1224]/60">{description}</p>
    </div>
  );
}

export default function CheckAvailability({ hallId, hallName, hallSlug, hallCapacity, showAllHalls }) {
  const [status, setStatus] = useState(null);
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const router = useRouter();
  const [selectedHall, setSelectedHall] = useState(
    hallId ? { _id: hallId, name: hallName, slug: hallSlug, capacity: hallCapacity } : null
  );

  useEffect(() => {
    if (hallId && !selectedHall) setSelectedHall({ _id: hallId, name: hallName, slug: hallSlug, capacity: hallCapacity });
  }, [hallId, hallName, hallSlug, hallCapacity, selectedHall]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { guests: hallCapacity ? Math.min(50, hallCapacity) : 50 },
    mode: 'onChange'
  });

  const date = watch('date');
  const slot = watch('slot');
  const guests = watch('guests');

  const searchParams = useSearchParams();

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

  async function checkAvailability(formData) {
    setStatus(null);
    setError(null);
    try {
      const payload = {
        date: formData.date,
        slot: formData.slot,
        guests: Number(formData.guests),
      };

      const res = hallId
        ? await axiosInstance.post(ROUTES.API.HALLS.BY_ID_AVAILABILITY(hallId), payload)
        : await axiosInstance.get(ROUTES.API.HALLS.AVAILABILITY, { params: payload });

      const results = res.data.halls || res.data;
      setStatus(results);

      if (hallId && !Array.isArray(results) && results.available) {
        const hallInfo = await axiosInstance.get(ROUTES.API.HALLS.BY_ID(hallId));
        setSelectedHall(hallInfo.data.hall);
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Could not check availability. Please try again.');
    }
  }

  const handleProceedToBooking = () => {
    if (!selectedHall || !isFormFilled) return;
    const serverSlot = slot === 'day' ? 'wholeday' : slot;
    const url = `${ROUTES.SITE.VENUE_BOOK(selectedHall.slug)}?date=${date}&slot=${serverSlot}&guests=${guests}`;
    if (!user) {
      const bookingIntent = { hallId: selectedHall._id, hallSlug: selectedHall.slug, hallName: selectedHall.name, date, slot, guests, timestamp: Date.now() };
      localStorage.setItem('bookingIntent', JSON.stringify(bookingIntent));
      router.push(`${ROUTES.AUTH.ROOT}?redirect=${encodeURIComponent(url)}`);
    } else {
      router.push(url);
    }
  };

  const minDate = getMinimumCustomerBookingDate();
  const getSelectedAvailability = () => {
    if (!selectedHall || !status) return undefined;
    if (Array.isArray(status)) {
      const found = status.find(s => String(s._id) === String(selectedHall._id));
      return found ? found.available : undefined;
    }
    return status?.available;
  };

  const selectedAvailable = getSelectedAvailability();
  const isFormFilled = !!date && !!slot && !!guests && Number(guests) > 0;
  const canProceed = !!selectedHall && isFormFilled && (selectedAvailable === undefined ? true : selectedAvailable === true);

  const resultHalls = useMemo(() => {
    if (Array.isArray(status)) return status;
    if (hallId && status && selectedHall) {
      return [{ ...selectedHall, available: status.available, availableSlots: status.availableSlots }];
    }
    return [];
  }, [hallId, selectedHall, status]);

  const hasChecked = !!status;
  const showResultCards = showAllHalls || hallId;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#fdfaf6] selection:bg-[#C0A04C]/30">
      <section className="relative isolate overflow-hidden bg-[#3a1224] pt-40 text-white">
        <div className="absolute inset-0 z-0 opacity-20 [background-image:linear-gradient(#C0A04C_1px,transparent_1px),linear-gradient(90deg,#C0A04C_1px,transparent_1px)] [background-size:56px_56px]" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fdfaf6] to-transparent" />

        <div className="site-container relative z-10 pb-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C0A04C]/30 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#C0A04C]">
                <Sparkles className="h-4 w-4" />
                Reservations
              </p>
              <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Check hall availability.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/[0.72]">
                Start with your event date, time slot, and guest count. {BOOKING_LEAD_TIME_MESSAGE}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {pathSteps.map((step, index) => (
                <div key={step.label} className="rounded-xl bg-white/10 px-3 py-3">
                  <step.icon className="mb-3 h-4 w-4 text-[#C0A04C]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/[0.55]">0{index + 1}</p>
                  <p className="mt-1 text-sm font-bold text-white">{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="site-container -mt-8 pb-20">
        <div className="relative z-20 grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_420px] lg:items-start">
          <div className="space-y-8">
            <AvailabilityForm
              register={register}
              handleSubmit={handleSubmit}
              checkAvailability={checkAvailability}
              isSubmitting={isSubmitting}
              errors={errors}
              minDate={minDate}
              disableMorning={false}
              disableAfternoon={false}
              disableEvening={false}
              SLOT_LABELS={SLOT_LABELS}
            />

            {error ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 text-red-800 shadow-sm"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-black">Availability check failed</p>
                  <p className="mt-1 text-sm leading-6">{error}</p>
                </div>
              </motion.div>
            ) : null}

            <section className="rounded-[1.7rem] border border-[#eadcc7] bg-white p-5 shadow-[0_24px_70px_rgba(58,18,36,0.08)] sm:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C0A04C]">Available Halls</p>
                  <h2 className="mt-2 text-2xl font-black text-[#3a1224] sm:text-3xl">
                    {hallId ? 'Selected hall result' : 'Choose the best fit'}
                  </h2>
                </div>
                {hasChecked ? (
                  <p className="text-sm font-semibold text-[#3a1224]/55">
                    {resultHalls.length} result{resultHalls.length === 1 ? '' : 's'}
                  </p>
                ) : null}
              </div>

              {isSubmitting ? (
                <ResultsSkeleton />
              ) : !hasChecked ? (
                <EmptyResults
                  title="Enter event details to see available halls."
                  description="Pick a date, slot, and guest count first. Results will update after the availability check."
                />
              ) : resultHalls.length === 0 ? (
                <EmptyResults
                  title="No halls match this search."
                  description="Try a different date, slot, or guest count to find more available spaces."
                />
              ) : showResultCards ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <AnimatePresence mode="popLayout">
                    {resultHalls.map(h => (
                      <VenueResultCard
                        key={h._id}
                        venue={h}
                        isSelected={selectedHall?._id === h._id}
                        onSelect={setSelectedHall}
                        date={date}
                        slot={slot}
                        guests={guests}
                        SLOT_LABELS={SLOT_LABELS}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : null}
            </section>
          </div>

          <aside className="lg:sticky lg:top-28">
            <BookingSummary
              selectedHall={selectedHall}
              date={date}
              slot={slot}
              guests={guests}
              SLOT_LABELS={SLOT_LABELS}
              canProceed={canProceed}
              handleProceedToBooking={handleProceedToBooking}
              user={user}
              selectedAvailable={selectedAvailable}
            />
          </aside>
        </div>
      </section>
    </main>
  );
}
