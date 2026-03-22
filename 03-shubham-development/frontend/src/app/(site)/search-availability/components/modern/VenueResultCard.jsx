'use client';
import React from 'react';
import { Users, Castle, CalendarCheck, Clock, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const VenueResultCard = ({ venue, isSelected, onSelect, date, slot, guests, SLOT_LABELS }) => {
  const isAvailable = venue.available !== false;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      className={`relative group bg-white border-2 rounded-2xl overflow-hidden transition-all duration-700 ${isSelected ? 'border-[#C0A04C] shadow-2xl' : 'border-[#3a1224]/5 hover:border-[#3a1224]/10 shadow-lg'}`}
    >
      <div className={`p-8 ${isAvailable ? 'bg-[#fdfaf6]/50' : 'bg-gray-50 opacity-60'}`}>
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${isAvailable ? 'bg-[#3a1224] text-[#C0A04C]' : 'bg-gray-300 text-gray-50'}`}>
                   <Castle className="w-6 h-6" />
                </div>
                <div>
                   <h3 className="text-xl font-display font-bold text-[#3a1224] group-hover:text-[#C0A04C] transition-colors">{venue.name}</h3>
                   <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] text-[#3a1224]/40 mt-1">
                      <Users className="w-3 h-3 text-[#C0A04C]" /> {venue.capacity} guests Max
                   </div>
                </div>
             </div>
          </div>
          <div className={`px-5 py-2 rounded-none text-[9px] font-black uppercase tracking-[0.3em] ${isAvailable ? 'bg-[#C0A04C]/20 text-[#3a1224] border border-[#C0A04C]/30' : 'bg-gray-200 text-gray-500 border border-gray-300'}`}>
             {isAvailable ? 'Available' : 'Booked'}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-6 pb-10 border-b border-[#3a1224]/5">
           <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#3a1224]/30 block">Selection</span>
              <div className="flex items-center gap-3 py-3 px-4 bg-white border border-[#3a1224]/5 rounded-xl text-xs font-bold text-[#3a1224]">
                 <CalendarCheck className="w-4 h-4 text-[#C0A04C]" /> {date}
              </div>
           </div>
           <div className="space-y-2">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#3a1224]/30 block">Shift</span>
              <div className="flex items-center gap-3 py-3 px-4 bg-white border border-[#3a1224]/5 rounded-xl text-xs font-bold text-[#3a1224]">
                 <Clock className="w-4 h-4 text-[#C0A04C]" /> {SLOT_LABELS[slot] || 'Full Day'}
              </div>
           </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
           <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-bold text-[#3a1224] tracking-tight">{venue.currency || 'NPR'} {venue.pricePerHour?.toLocaleString() || '—'}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/30">/ Slot</span>
           </div>
           <button
             onClick={() => isAvailable && onSelect(venue)}
             disabled={!isAvailable}
             className={`p-4 rounded-xl transition-all duration-500 overflow-hidden group/btn relative ${isAvailable ? 'bg-[#3a1224] text-[#C0A04C] hover:bg-[#4a172d] shadow-xl' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
           >
              {isSelected ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-3 transition-transform duration-700" />}
           </button>
        </div>
      </div>
    </motion.div>
  );
};
