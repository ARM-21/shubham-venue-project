"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Ruler, Coffee, ShieldCheck } from 'lucide-react';

export const VenueStats = ({ venueData, diningText }) => {
  const stats = [
    { icon: Users, label: 'Capacity', value: `${venueData.capacity || '—'} Guests`, desc: 'Hall Seating' },
    { icon: Ruler, label: 'Area', value: venueData.size || 'Big Hall', desc: 'Total Space' },
    { icon: Coffee, label: 'Dining', value: diningText, desc: 'Food Service' },
    { icon: ShieldCheck, label: 'Safety', value: '24/7 Secure', desc: 'Secure Place' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 bg-white p-4 sm:p-8 rounded-2xl shadow-[0_20px_50px_rgba(58,18,36,0.05)] border border-gray-100"
    >
      {stats.map((stat, i) => (
        <div key={i} className="relative group flex flex-col sm:flex-row items-center gap-2 sm:gap-5 px-2 sm:px-4">
          <div className="w-12 h-12 bg-[#fdfaf6] shadow-sm rounded-xl flex items-center justify-center group-hover:-translate-y-1 transition-transform duration-500 border border-[#3a1224]/5 shrink-0">
            <stat.icon className="w-5 h-5 text-[#3a1224]" />
          </div>
          <div className="flex flex-col items-start text-left min-w-0">
            <span className="text-[8px] sm:text-[9px] font-black text-[#C0A04C] uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1">{stat.label}</span>
            <span className="text-xs sm:text-sm font-bold text-[#3a1224] truncate w-full">{stat.value}</span>
          </div>
        </div>
      ))}
    </motion.div>
  );
};
