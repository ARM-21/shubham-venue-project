'use client';

import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import axiosInstance from 'lib/axios';
import { useAuth } from 'contexts/AuthProvider';
import { ROUTES } from 'config/routes';
import { Castle, CalendarCheck, Clock, Users, ArrowRight, Sparkles, MapPin, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Modern Components
import { AvailabilityForm } from '../../app/(site)/search-availability/components/modern/AvailabilityForm';
import { VenueResultCard } from '../../app/(site)/search-availability/components/modern/VenueResultCard';
import { BookingSummary } from '../../app/(site)/search-availability/components/modern/BookingSummary';

const SLOT_LABELS = {
  morning: 'Morning Cycle (08:00-13:00)',
  afternoon: 'Afternoon Cycle (13:00-17:00)',
  evening: 'Evening Cycle (17:00-23:00)',
  wholeday: 'Full Day Cycle (08:00-23:00)',
};

export default function CheckAvailability({ hallId, hallName, hallSlug, hallCapacity, showAllHalls }) {
  const [status, setStatus] = useState(null);
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const router = useRouter();
  const [selectedHall, setSelectedHall] = useState(hallId ? { _id: hallId, name: hallName, slug: hallSlug, capacity: hallCapacity } : null);

  useEffect(() => {
    if (hallId && !selectedHall) setSelectedHall({ _id: hallId, name: hallName, slug: hallSlug, capacity: hallCapacity });
  }, [hallId, hallName, hallSlug, hallCapacity]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { guests: hallCapacity ? Math.min(50, hallCapacity) : 50 },
    mode: 'onChange'
  });

  const date = watch('date');
  const slot = watch('slot');
  const guests = watch('guests');

  const TZ = 'Asia/Kathmandu';
  const now = DateTime.now().setZone(TZ);
  const todayStr = now.toFormat('yyyy-MM-dd');
  const currentHour = now.hour;
  const isToday = date === todayStr;

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

  const disableMorning = isToday && currentHour >= 13;
  const disableAfternoon = isToday && currentHour >= 17;
  const disableEvening = isToday && currentHour >= 23;

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
      setError(e?.response?.data?.message || "Network error");
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

  const minDate = now.startOf('day').toFormat('yyyy-MM-dd');
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

  return (
    <div className="min-h-screen bg-[#fdfaf6] relative selection:bg-[#C0A04C]/30 overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none opacity-30 overflow-hidden">
            <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-[#C0A04C]/5 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-[#3a1224]/5 blur-[120px] rounded-full" />
        </div>
        
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/90 to-[#423f3b] pointer-events-none z-0" />

        <main className="w-full max-w-full overflow-x-hidden"><div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 pt-40 pb-32 relative z-10">
            <header className="mb-20 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
                    <div className="w-12 h-[1px] bg-[#C0A04C]" />
                    <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.6em]">Reservations</span>
                    <div className="w-12 h-[1px] bg-[#C0A04C] lg:hidden" />
                </div>
                <h1 className="text-6xl lg:text-8xl font-display font-bold text-white mb-8 tracking-tighter">
                    Find Your <span className="text-[#C0A04C] italic font-serif">Perfect</span> Venue
                </h1>
                <p className="text-white/60 text-xl font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                   Discover exceptional spaces for your most cherished moments. 
                   Real-time availability for weddings, corporate galas, and private celebrations.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
                <div className="lg:col-span-8 space-y-20">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#C0A04C]/20 to-[#3a1224]/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative">
                            <AvailabilityForm 
                                register={register} handleSubmit={handleSubmit} checkAvailability={checkAvailability} 
                                isSubmitting={isSubmitting} errors={errors} minDate={minDate} 
                                disableMorning={disableMorning} disableAfternoon={disableAfternoon} disableEvening={disableEvening} SLOT_LABELS={SLOT_LABELS} 
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-6 bg-red-50/50 backdrop-blur-sm border border-red-100 rounded-2xl text-red-900 flex items-center gap-4 shadow-sm"
                        >
                           <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                               </svg>
                           </div>
                           <span className="font-bold uppercase tracking-[0.1em] text-[11px]">{error}</span>
                        </motion.div>
                    )}

                    <section>
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-8 mb-8 sm:mb-16 px-0 sm:px-2">
                           <div className="space-y-4">
                              <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-[#C0A04C]" />
                                <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.5em]">Curated Collection</span>
                              </div>
                              <h2 className="text-5xl font-display font-bold text-[#3a1224] tracking-tight">Our Signature <span className="italic font-serif text-[#C0A04C]">Halls</span></h2>
                           </div>
                           <div className="flex gap-6 pb-2">
                              <div className="flex items-center gap-3">
                                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"/>
                                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#3a1224]/60">Available</span>
                              </div>
                              <div className="flex items-center gap-3">
                                  <div className="w-2.5 h-2.5 rounded-full bg-[#3a1224]/20 border border-[#3a1224]/10"/>
                                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#3a1224]/60">Reserved</span>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <AnimatePresence mode="popLayout">
                                {status && Array.isArray(status) && showAllHalls ? (
                                    status.map(h => (
                                        <VenueResultCard 
                                          key={h._id} venue={h} isSelected={selectedHall?._id === h._id} 
                                          onSelect={setSelectedHall} date={date} slot={slot} 
                                          guests={guests} SLOT_LABELS={SLOT_LABELS} 
                                        />
                                    ))
                                ) : !status && !isSubmitting ? (
                                    <div className="col-span-full py-40 text-center border-2 border-dashed border-[#3a1224]/5 rounded-[40px] bg-white/40 group hover:border-[#C0A04C]/20 transition-colors duration-500">
                                       <div className="w-20 h-20 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                            <CalendarCheck className="w-8 h-8 text-[#C0A04C]/40" />
                                       </div>
                                       <p className="text-[#3a1224]/40 font-display italic text-2xl tracking-tight max-w-sm mx-auto">Select your dates to reveal the perfect venue for your event.</p>
                                    </div>
                                ) : (
                                    /* Skeleton Loading State when isSubmitting */
                                    isSubmitting && [1,2,3,4].map(i => (
                                        <div key={i} className="h-64 bg-white/50 rounded-3xl animate-pulse border border-[#3a1224]/5" />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                   <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-b from-[#C0A04C]/10 to-transparent rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                        <BookingSummary 
                            selectedHall={selectedHall} date={date} slot={slot} 
                            guests={guests} SLOT_LABELS={SLOT_LABELS} canProceed={canProceed} 
                            handleProceedToBooking={handleProceedToBooking} user={user}
                        />
                   </div>
                </div>
            </div>
        </div>
        </main>
    </div>
  );
}

                       