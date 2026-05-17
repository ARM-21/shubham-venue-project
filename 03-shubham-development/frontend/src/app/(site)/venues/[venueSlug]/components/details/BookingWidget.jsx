"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck } from 'lucide-react';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';
import { BOOKING_LEAD_TIME_MESSAGE, SLOT_LABELS } from 'constants/slots';

export const BookingWidget = ({ 
  venueData, 
  currencyFormatter, 
  displayMonth, 
  prevMonth, 
  nextMonth, 
  generateCalendarDays, 
  minimumBookingDate,
  occupiedDates, 
  date, 
  shift, 
  guests, 
  setValue, 
  register, 
  handleSubmit, 
  submitBooking 
}) => {
  const [availableSlots, setAvailableSlots] = useState(['morning', 'afternoon', 'evening', 'wholeday']);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotError, setSlotError] = useState(null);

  // Fetch available slots for selected date
  useEffect(() => {
    if (!date || !venueData?._id) {
      setAvailableSlots(['morning', 'afternoon', 'evening', 'wholeday']);
      return;
    }

    setSlotsLoading(true);
    setSlotError(null);
    const fetchAvailableSlots = async () => {
      try {
        const response = await axiosInstance.post(
          ROUTES.API.HALLS.BY_ID_AVAILABILITY(venueData._id),
          {
            date,
            slot: 'morning',
            guests: guests || 50
          }
        );
        
        // Extract available slots from response - API returns availableSlots array
        const slots = response.data?.availableSlots || response.data?.slots || ['morning', 'afternoon', 'evening', 'wholeday'];
        setAvailableSlots(Array.isArray(slots) ? slots : ['morning', 'afternoon', 'evening', 'wholeday']);
        setSlotError(null);
        
        // If current shift is not available, switch to first available
        if (Array.isArray(slots) && slots.length > 0 && !slots.includes(shift)) {
          setValue('slot', slots[0]);
        }
      } catch (err) {
        console.error('Error fetching slots:', err?.response?.data || err?.message || err);
        setSlotError(err?.response?.data?.message || err?.message || 'Failed to fetch slots');
        setAvailableSlots(['morning', 'afternoon', 'evening', 'wholeday']);
      } finally {
        setSlotsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchAvailableSlots, 300);
    return () => clearTimeout(timeoutId);
  }, [date, venueData?._id, guests, shift, setValue]);

  const slotOptions = [
    { id: 'morning', label: SLOT_LABELS.morning },
    { id: 'afternoon', label: SLOT_LABELS.afternoon },
    { id: 'evening', label: SLOT_LABELS.evening },
    { id: 'wholeday', label: SLOT_LABELS.wholeday }
  ];

  return (
    <div className="lg:sticky lg:top-24 z-20">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[1.7rem] border border-[var(--color-sand)] bg-white shadow-[0_24px_70px_rgba(58,18,36,0.12)]"
      >
        <div className="bg-[var(--color-wine)] p-5 text-white sm:p-7">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-champagne)]">Book this venue</p>
            <div className="mt-4 flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight whitespace-nowrap">
                {currencyFormatter.format(venueData?.pricePerHour || 0)}
              </span>
              <span className="text-sm text-white/70 whitespace-nowrap">/ slot</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-sm">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/60">Capacity</span>
                <p className="font-bold mt-1 truncate">{venueData?.capacity || '—'} Guests</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/60">Space</span>
                <p className="font-bold mt-1 truncate">{venueData?.size || 'Premium'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <form className="space-y-6 sm:space-y-8">
            {/* Date Picker Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm font-bold text-[#3a1224] uppercase tracking-wide">Select Date</span>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.preventDefault(); prevMonth(); }} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer transition-colors"><ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-[#3a1224]" /></button>
                  <button onClick={(e) => { e.preventDefault(); nextMonth(); }} className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center hover:bg-gray-100 rounded cursor-pointer transition-colors"><ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-[#3a1224]" /></button>
                </div>
              </div>

              <div className="bg-gray-50 p-2 sm:p-5 rounded-xl border border-gray-100">
                <div className="text-center text-[11px] sm:text-sm font-bold text-[#3a1224] mb-1 sm:mb-3 uppercase tracking-wide">
                  {displayMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-[7px] sm:text-[9px] font-bold text-gray-400 mb-1 sm:mb-2 text-center">
                  {['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                  {generateCalendarDays(displayMonth).map((dt, idx) => {
                    if (!dt) return <div key={idx} />;
                    // Use local date formatting to avoid timezone issues
                    const year = dt.getFullYear();
                    const month = String(dt.getMonth() + 1).padStart(2, '0');
                    const day = String(dt.getDate()).padStart(2, '0');
                    const iso = `${year}-${month}-${day}`;
                    const isBookableDate = iso >= minimumBookingDate;
                    const isBooked = occupiedDates.has(iso);
                    const isSelected = date === iso;

                    if (!isBookableDate) return <div key={idx} />;

                    return (
                      <button
                        key={idx}
                        disabled={isBooked}
                        onClick={(e) => { e.preventDefault(); setValue('date', iso); }}
                        className={`h-7 sm:h-8 w-full rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                          isSelected 
                            ? 'bg-[#3a1224] text-white shadow-sm cursor-pointer' 
                            : isBooked 
                            ? 'bg-red-50 text-red-300 cursor-not-allowed' 
                            : 'text-[#3a1224] hover:bg-white hover:shadow-sm cursor-pointer'
                        }`}
                      >
                        {dt.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Shift Selector - Data Driven */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#3a1224] uppercase tracking-wide">Select Slot</span>
                {slotsLoading && <span className="text-[10px] text-[#C0A04C] animate-pulse">Loading...</span>}
              </div>
              {slotError ? (
                <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                  Could not confirm live slots. You can still continue and we will verify on booking.
                </p>
              ) : null}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {slotOptions.map((s) => {
                  const isAvailable = availableSlots.includes(s.id);
                  const isSelected = shift === s.id;
                  
                  return (
                    <button
                      key={s.id}
                      onClick={(e) => { e.preventDefault(); isAvailable && setValue('slot', s.id); }}
                      disabled={!isAvailable}
                      className={`py-2 sm:py-4 px-1 sm:px-3 rounded-lg border transition-all text-[10px] sm:text-sm font-bold uppercase tracking-tight sm:tracking-wide truncate ${
                        isSelected
                          ? 'bg-[#3a1224] border-[#3a1224] text-white shadow-sm cursor-pointer'
                          : isAvailable
                          ? 'bg-white border-gray-100 text-[#3a1224] hover:border-[#C0A04C]/30 cursor-pointer'
                          : 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guest Counter */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-[#3a1224] uppercase tracking-wide">Guests</span>
                <span className="text-base sm:text-lg font-bold text-[#3a1224]">{guests} <span className="text-xs text-gray-400">pax</span></span>
              </div>
              <div className="pt-1">
                <input 
                  type="range" 
                  min="50" 
                  max={venueData?.capacity || 1000} 
                  step="10"
                  {...register('guests')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#3a1224]" 
                />
                <div className="flex justify-between mt-3 text-[9px] font-bold text-gray-400 uppercase">
                  <span>50</span>
                  <span>{venueData?.capacity || 1000}</span>
                </div>
              </div>
            </div>

            {/* Submit Button - Simplified */}
            <button 
              onClick={(e) => { e.preventDefault(); handleSubmit(submitBooking)(e); }}
              className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#C0A04C]/30 bg-[#3a1224] py-3 text-white transition-all hover:bg-[#3a1224]/90 sm:py-4"
            >
              <span className="font-bold uppercase text-xs sm:text-sm tracking-wide">Check Availability</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-7 flex items-start gap-3 rounded-2xl border border-[var(--color-sand)] bg-[var(--color-ivory)] p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-champagne)]" />
            <p className="text-xs leading-5 text-[var(--color-stone)]">
              {BOOKING_LEAD_TIME_MESSAGE} Your selected details will be carried into the secure booking step.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
