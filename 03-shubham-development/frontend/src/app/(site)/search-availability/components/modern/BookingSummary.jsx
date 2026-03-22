'use client';
import React from 'react';
import { ArrowRight, Lock, CalendarCheck, Clock, MapPin } from 'lucide-react';

export const BookingSummary = ({ selectedHall, date, slot, guests, SLOT_LABELS, canProceed, handleProceedToBooking, user }) => {
  return (
    <div className={`sticky top-32 bg-[#3a1224] text-white p-10 rounded-2xl shadow-[0_40px_100px_rgba(58,18,36,0.3)] border border-[#C0A04C]/20 overflow-hidden group transition-all duration-700 ${!selectedHall ? 'opacity-90 grayscale' : ''}`}>
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-[#C0A04C]/20 blur-[100px] rounded-full transition-transform duration-1000 group-hover:scale-150" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 blur-[50px] rounded-full" />

      <div className="relative z-10 space-y-10">
        <div className="space-y-4 border-b border-white/10 pb-10">
           <div className="flex items-center gap-4">
              <div className="w-12 h-[1px] bg-[#C0A04C]" />
              <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Price</span>
           </div>
           <div className="flex items-baseline gap-4">
              <span className="text-5xl font-display font-bold tracking-tight">
                {selectedHall?.currency || 'NPR'} {(selectedHall?.pricePerHour || 0).toLocaleString()}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C0A04C]/60">/ Slot</span>
           </div>
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group/row cursor-default">
              <div className="w-10 h-10 bg-[#C0A04C] rounded-lg flex items-center justify-center text-[#3a1224] transition-transform duration-500 group-hover/row:scale-110"><MapPin className="w-4 h-4" /></div>
              <div className="space-y-1 overflow-hidden">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">Venue</span>
                 <p className="text-sm font-bold truncate pr-4">{selectedHall?.name || 'Please select a hall'}</p>
              </div>
           </div>

           <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group/row cursor-default">
              <div className="w-10 h-10 bg-[#C0A04C] rounded-lg flex items-center justify-center text-[#3a1224] transition-transform duration-500 group-hover/row:scale-110"><CalendarCheck className="w-4 h-4" /></div>
              <div className="space-y-1">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">Date</span>
                 <p className="text-sm font-bold">{date || 'Select a date'}</p>
              </div>
           </div>

           <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group/row cursor-default">
              <div className="w-10 h-10 bg-[#C0A04C] rounded-lg flex items-center justify-center text-[#3a1224] transition-transform duration-500 group-hover/row:scale-110"><Clock className="w-4 h-4" /></div>
              <div className="space-y-1">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">Time</span>
                 <p className="text-sm font-bold uppercase">{SLOT_LABELS[slot] || 'Full Day Cycle'}</p>
              </div>
           </div>
        </div>

        <button
           onClick={handleProceedToBooking}
           disabled={!canProceed}
           className={`group relative w-full overflow-hidden rounded-xl transition-all duration-700 ${canProceed ? 'bg-[#C0A04C] text-[#3a1224] shadow-2xl hover:scale-[1.02]' : 'bg-gray-500/30 text-gray-400 cursor-not-allowed border border-white/10'}`}
        >
           <div className="absolute inset-0 bg-white/10 transition-transform duration-500 translate-y-full group-hover:translate-y-0" />
           <div className="relative py-6 flex items-center justify-center gap-4">
              <span className="text-xs font-black uppercase tracking-[0.4em]">
                {user ? 'Proceed to Book' : 'Login to Secure'}
              </span>
              {user ? <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform duration-700" /> : <Lock className="w-4 h-4" />}
           </div>
        </button>
      </div>
    </div>
  );
};
