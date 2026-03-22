"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Thermometer, Music, ArrowRight, Phone, Download, Share2 } from 'lucide-react';

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
  return (
    <div className="sticky top-32">
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-none shadow-[0_50px_100px_rgba(58,18,36,0.08)] border border-[#3a1224]/5 overflow-hidden ring-1 ring-[#3a1224]/5"
      >
        {/* Pricing Reveal */}
        <div className="bg-[#3a1224] p-10 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#C0A04C]/40 blur-[60px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C0A04C]/20 blur-[60px] rounded-full" />
          </div>
          
          <div className="relative z-10">
            <p className="text-[#C0A04C] text-[10px] font-black tracking-[0.4em] uppercase mb-4 opacity-80">Initial Investment</p>
            <div className="flex items-baseline justify-center gap-3">
              <span className="text-5xl font-display font-bold tracking-tight">
                {currencyFormatter.format(venueData.pricePerHour || 0)}
              </span>
              <span className="text-[11px] text-[#C0A04C] font-black tracking-[0.2em] uppercase">/ Slot</span>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 border-r border-white/10">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">Capacity</span>
                <span className="text-xs font-bold">{venueData.capacity} Pax</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">Availability</span>
                <span className="text-xs font-bold">Standard</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10">
          <form className="space-y-10">
            {/* Date Picker Section */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-[#3a1224] uppercase tracking-[0.3em]">1. Select Date</span>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.preventDefault(); prevMonth(); }} className="w-8 h-8 flex items-center justify-center hover:bg-[#3a1224] hover:text-white rounded-full transition-all border border-gray-100"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.preventDefault(); nextMonth(); }} className="w-8 h-8 flex items-center justify-center hover:bg-[#3a1224] hover:text-white rounded-full transition-all border border-gray-100"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="bg-[#fdfaf6]/80 p-6 rounded-[2rem] border border-[#3a1224]/5">
                <div className="text-center text-[11px] font-black text-[#3a1224] mb-6 tracking-[0.2em] uppercase border-b border-[#3a1224]/5 pb-4">
                  {displayMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-2 text-[10px] font-black text-[#3a1224]/20 mb-4 text-center">
                  {['S','M','T','W','T','F','S'].map((d, i) => <span key={i}>{d}</span>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {generateCalendarDays(displayMonth).map((dt, idx) => {
                    if (!dt) return <div key={idx} />;
                    const iso = dt.toISOString().split('T')[0];
                    const isPast = iso <= today;
                    const isBooked = occupiedDates.has(iso);
                    const isSelected = date === iso;

                    return (
                      <button
                        key={idx}
                        disabled={isPast || isBooked}
                        onClick={(e) => { e.preventDefault(); setValue('date', iso); }}
                        className={`h-10 w-full rounded-xl text-xs font-bold transition-all relative group/day
                          ${isSelected ? 'bg-[#3a1224] text-[#C0A04C] shadow-2xl scale-110 z-10' : 
                            isPast ? 'text-gray-200 cursor-not-allowed' : 
                            isBooked ? 'bg-red-50 text-red-200 cursor-not-allowed' : 
                            'text-[#3a1224] hover:bg-white hover:shadow-xl hover:-translate-y-1'}
                        `}
                      >
                        {dt.getDate()}
                        {isSelected && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#C0A04C] rounded-full" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Shift Selector */}
            <div className="space-y-6">
              <span className="text-[10px] font-black text-[#3a1224] uppercase tracking-[0.3em]">2. Select Shift</span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'morning', label: 'Morning', icon: Sparkles },
                  { id: 'day', label: 'Wholeday', icon: Thermometer },
                  { id: 'evening', label: 'Evening', icon: Music }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={(e) => { e.preventDefault(); setValue('slot', s.id); }}
                    className={`flex flex-col items-center py-5 rounded-xl border transition-all duration-500 ${shift === s.id ? 'bg-[#3a1224] border-[#3a1224] text-[#C0A04C] shadow-2xl -translate-y-1' : 'bg-white border-gray-100 text-[#3a1224]/40 hover:border-[#C0A04C]/30'}`}
                  >
                    <s.icon className={`w-5 h-5 mb-2 transition-all ${shift === s.id ? 'scale-110' : 'opacity-40'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Guest Counter */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#3a1224] uppercase tracking-[0.3em]">3. Guests</span>
                <span className="text-lg font-bold text-[#3a1224] font-display">{guests} <span className="text-[10px] text-[#3a1224]/40 uppercase">Pax</span></span>
              </div>
              <div className="relative pt-2">
                <input 
                  type="range" 
                  min="50" 
                  max={venueData.capacity || 1000} 
                  step="10"
                  {...register('guests')}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#3a1224]" 
                />
                <div className="flex justify-between mt-4 text-[9px] font-black text-[#3a1224]/30 uppercase tracking-[0.2em]">
                  <span>50 Min</span>
                  <span>{venueData.capacity} Max</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              onClick={(e) => { e.preventDefault(); handleSubmit(submitBooking)(e); }}
              className="group relative w-full overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 bg-[#3a1224] transition-transform duration-500 group-hover:scale-105" />
              <div className="relative py-6 flex items-center justify-center gap-4 border border-[#C0A04C]/20">
                <div className="flex flex-col items-start">
                  <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.3em] leading-tight opacity-70">Check</span>
                  <span className="text-md font-bold text-[#C0A04C] tracking-[0.1em] uppercase">See Availability</span>
                </div>
                <ArrowRight className="w-5 h-5 text-[#C0A04C] group-hover:translate-x-3 transition-transform duration-700" />
              </div>
            </button>
          </form>

          <div className="mt-12 flex items-center justify-center gap-10 border-t border-gray-50 pt-10">
            {[
              { icon: Phone, label: 'Call us' },
              { icon: Download, label: 'Details' },
              { icon: Share2, label: 'Share' }
            ].map((item, i) => (
              <button key={i} className="flex flex-col items-center gap-3 group" type="button">
                <div className="w-12 h-12 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl flex items-center justify-center group-hover:bg-[#3a1224] transition-all duration-500 group-hover:shadow-lg">
                  <item.icon className="w-4 h-4 text-[#3a1224] group-hover:text-[#C0A04C] transition-colors" />
                </div>
                <span className="text-[9px] font-black text-[#3a1224]/30 uppercase tracking-[0.3em] group-hover:text-[#3a1224] transition-colors">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
