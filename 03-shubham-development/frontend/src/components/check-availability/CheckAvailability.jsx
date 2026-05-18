'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import axiosInstance from 'lib/axios';
import { useAuth } from 'contexts/AuthProvider';
import { ROUTES } from 'config/routes';
import { AlertCircle } from 'lucide-react';
import { BOOKING_LEAD_TIME_MESSAGE, SLOT_LABELS, getMinimumCustomerBookingDate } from 'constants/slots';

import { AvailabilityForm } from '../../app/(site)/search-availability/components/modern/AvailabilityForm';
import { VenueResultCard } from '../../app/(site)/search-availability/components/modern/VenueResultCard';
import { BookingSummary } from '../../app/(site)/search-availability/components/modern/BookingSummary';

function ResultsSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-44 animate-pulse rounded-2xl border border-[#e8dcc8] bg-[#fbf8f2]" />
      ))}
    </div>
  );
}

function EmptyResults({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#e8dcc8] bg-white px-6 py-12 text-center">
      <p className="text-sm font-black text-[#3a1224]">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#3a1224]/50">{description}</p>
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
    if (hallId && !selectedHall)
      setSelectedHall({ _id: hallId, name: hallName, slug: hallSlug, capacity: hallCapacity });
  }, [hallId, hallName, hallSlug, hallCapacity, selectedHall]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { guests: hallCapacity ? Math.min(50, hallCapacity) : 50 },
    mode: 'onChange',
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
    if (qSlot) setValue('slot', qSlot === 'day' ? 'wholeday' : qSlot);
  }, [searchParams, setValue]);

  async function checkAvailability(formData) {
    setStatus(null);
    setError(null);
    try {
      const payload = { date: formData.date, slot: formData.slot, guests: Number(formData.guests) };
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
      localStorage.setItem('bookingIntent', JSON.stringify({
        hallId: selectedHall._id, hallSlug: selectedHall.slug, hallName: selectedHall.name,
        date, slot, guests, timestamp: Date.now(),
      }));
      router.push(`${ROUTES.AUTH.ROOT}?redirect=${encodeURIComponent(url)}`);
    } else {
      router.push(url);
    }
  };

  const minDate = getMinimumCustomerBookingDate();

  const getSelectedAvailability = () => {
    if (!selectedHall || !status) return undefined;
    if (Array.isArray(status)) {
      const found = status.find((s) => String(s._id) === String(selectedHall._id));
      return found ? found.available : undefined;
    }
    return status?.available;
  };

  const selectedAvailable = getSelectedAvailability();
  const isFormFilled = !!date && !!slot && !!guests && Number(guests) > 0;
  const canProceed =
    !!selectedHall && isFormFilled && (selectedAvailable === undefined ? true : selectedAvailable === true);

  const resultHalls = useMemo(() => {
    if (Array.isArray(status)) return status;
    if (hallId && status && selectedHall)
      return [{ ...selectedHall, available: status.available, availableSlots: status.availableSlots }];
    return [];
  }, [hallId, selectedHall, status]);

  const hasChecked = !!status;
  const showResultCards = showAllHalls || hallId;

  return (
    <main className="min-h-screen bg-[#fdfaf6]">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[#3a1224] pb-14 pt-40">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fdfaf6] to-transparent" />
        <div className="site-container relative z-10">
          <p className="text-[10px] font-black uppercase tracking-[0.38em] text-[#C0A04C]">
            Venue availability
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-4xl">
            Check hall availability
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
            {BOOKING_LEAD_TIME_MESSAGE} Choose a date, time slot, and guest count to see what is open.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="site-container -mt-6 pb-20">
        <div className="relative z-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start xl:grid-cols-[minmax(0,1fr)_360px]">

          <div className="space-y-6">
            <AvailabilityForm
              watch={watch}
              setValue={setValue}
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

            {error && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-sm font-black">Availability check failed</p>
                  <p className="mt-0.5 text-sm leading-5">{error}</p>
                </div>
              </div>
            )}

            {/* Results */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/45">
                  {hasChecked
                    ? `${resultHalls.length} hall${resultHalls.length === 1 ? '' : 's'} found`
                    : 'Available halls'}
                </p>
              </div>

              {isSubmitting ? (
                <ResultsSkeleton />
              ) : !hasChecked ? (
                <EmptyResults
                  title="Enter your event details above"
                  description="Pick a date, slot, and guest count, then hit Check. Results appear here."
                />
              ) : resultHalls.length === 0 ? (
                <EmptyResults
                  title="No halls available for this search"
                  description="Try a different date, slot, or guest count."
                />
              ) : showResultCards ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {resultHalls.map((h) => (
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
                </div>
              ) : null}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24">
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
