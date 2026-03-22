'use client';

import { ShieldCheck, Star, Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: ShieldCheck, text: "Verified Luxury Venue", sub: "Government Certified" },
  { icon: Star, text: "5-Star Hospitality", sub: "Award Winning Service" },
  { icon: Clock, text: "24/7 Concierge", sub: "Always At Your Service" },
  { icon: Heart, text: "Exquisite Catering", sub: "Chef-Curated Menus" },
];

export default function TrustBar() {
  return (
    <div className="w-full bg-[#3a1224] py-10 border-y border-white/10 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-32 bg-[#C0A04C] rounded-full blur-[100px] opacity-20" />
      
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 relative z-10">
        {features.map((feature, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-5 group"
          >
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:border-[#C0A04C]/30 transition-all duration-500 group-hover:bg-[#C0A04C]/10 text-[#C0A04C]">
              <feature.icon size={28} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-white text-sm md:text-base font-bold tracking-tight mb-0.5 group-hover:text-[#C0A04C] transition-colors">
                {feature.text}
              </span>
              <span className="text-white/40 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em]">
                {feature.sub}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
