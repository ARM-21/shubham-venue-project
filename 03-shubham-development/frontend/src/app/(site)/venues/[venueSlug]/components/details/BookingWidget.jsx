"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Phone, Download, Share2 } from 'lucide-react';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';

export const BookingWidget = ({ 
  venueData, 
  currencyFormatter, 
  displayMonth, 
  prevMonth, 
  nextMonth, 
  generateCalendarDays, 
  today, 
  occupiedDates, 
  date, 
  shift, 
  guests, 
  setValue, 
  register, 
  handleSubmit, 
  submitBooking 
}) => {
  const [availableSlots, setAvailableSlots] = useState(['morning', 'wholeday']);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotError, setSlotError] = useState(null);

  // Fetch available slots for selected date
  useEffect(() => {
    if (!date || !venueData?._id) {
      setAvailableSlots(['morning', 'wholeday']);
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
        const slots = response.data?.availableSlots || response.data?.slots || ['morning', 'wholeday'];
        setAvailableSlots(Array.isArray(slots) ? slots : ['morning', 'wholeday']);
        setSlotError(null);
        
        // If current shift is not available, switch to first available
        if (slots && !slots.includes(shift)) {
          setValue('slot', slots[0] || 'morning');
        }
      } catch (err) {
        console.error('Error fetching slots:', err?.response?.data || err?.message || err);
        setSlotError(err?.response?.data?.message || err?.message || 'Failed to fetch slots');
        setAvailableSlots(['morning', 'wholeday']);
      } finally {
        setSlotsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchAvailableSlots, 300);
    return () => clearTimeout(timeoutId);
  }, [date, venueData?._id, guests, shift, setValue]);

  const slotOptions = [
    { id: 'morning', label: 'Morning (09:00 AM - 01:00 PM)' },
    { id: 'afternoon', label: 'Afternoon (09:00 AM - 09:00 PM)' },
    { id: 'evening', label: 'Evening (05:00 PM - 09:00 PM)' },
    { id: 'wholeday', label: 'Whole Day (09:00 AM - 09:00 PM)' }
  ];

  return (
    <div className="sticky top-20 z-20">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(58,18,36,0.08)] border border-gray-200"
      >
        {/* Hall Description - New Section */}
        <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100">
          <p className="text-xs sm:text-sm lg:text-base text-[#3a1224]/80 leading-relaxed font-light break-words">
            {venueData?.description || 'Premium venue offering exceptional facilities for your special events with professional service and perfect ambiance.'}
          </p>
        </div>

        {/* Pricing Section - Simplified */}
        <div className="bg-gradient-to-r from-[#3a1224] to-[#3a1224]/95 p-4 sm:p-6 lg:p-8 text-white border-b border-[#3a1224]/50">
          <div className="text-center">
            <p className="text-[9px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-3 opacity-80">Per Slot Price</p>
            <div className="flex items-baseline justify-center gap-1 sm:gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold tracking-tight whitespace-nowrap">
                {currencyFormatter.format(venueData?.pricePerHour || 0)}
              </span>
              <span className="text-[10px] sm:text-xs lg:text-sm text-white/70 whitespace-nowrap">/ Slot</span>
            </div>
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-white/10 grid grid-cols-2 gap-3 sm:gap-4 text-[10px] sm:text-xs lg:text-sm">
              <div>
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] opacity-70">Capacity</span>
                <p className="font-bold mt-1 truncate">{venueData?.capacity || '—'} Guests</p>
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] opacity-70">Space</span>
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
                    const isFuture = iso > today;
                    const isBooked = occupiedDates.has(iso);
                    const isSelected = date === iso;

                    // Only show future dates - skip today and all past dates
                    if (!isFuture) return <div key={idx} />;

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
              className="w-full py-3 sm:py-4 bg-[#3a1224] hover:bg-[#3a1224]/90 text-white border border-[#C0A04C]/30 rounded-lg transition-all flex items-center justify-center gap-3 group cursor-pointer"
            >
              <span className="font-bold uppercase text-xs sm:text-sm tracking-wide">Check Availability</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Action Buttons */}
          <div className="mt-8 sm:mt-10 flex items-center justify-around border-t border-gray-100 pt-6 sm:pt-8">
            {[
              { icon: Phone, label: 'Call' },
              { icon: Download, label: 'Details' },
              { icon: Share2, label: 'Share' }
            ].map((item, i) => (
              <button key={i} className="flex flex-col items-center gap-2 sm:gap-3 group cursor-pointer" type="button">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center group-hover:bg-[#3a1224] group-hover:border-[#3a1224] transition-all">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#3a1224] group-hover:text-[#C0A04C] transition-colors" />
                </div>
                <span className="text-[8px] sm:text-xs font-bold text-gray-400 uppercase group-hover:text-[#3a1224] transition-colors">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
