'use client';

import { ShieldCheck, Star, Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: ShieldCheck, text: "Certified Venues", sub: "Government Verified" },
  { icon: Star, text: "Professional Service", sub: "Quality Assured" },
  { icon: Clock, text: "Dedicated Support", sub: "Available Always" },
  { icon: Heart, text: "Exceptional Menus", sub: "Expert Chefs" },
];

export default function TrustBar() {
  return (
    <section className="relative w-full overflow-hidden border-y border-white/10 bg-[#3a1224] py-7 shadow-[var(--shadow-card)]">
      <div className="absolute left-1/4 top-1/2 h-32 w-64 -translate-y-1/2 rounded-full bg-[#C0A04C] opacity-15 blur-[100px]" />
      
      <div className="site-container relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <motion.div 
            key={feature.text}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#C0A04C] transition-all duration-500 group-hover:border-[#C0A04C]/30 group-hover:bg-[#C0A04C]/10">
              <feature.icon size={22} strokeWidth={1.7} aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <span className="mb-0.5 text-sm font-bold tracking-normal text-white transition-colors group-hover:text-[#C0A04C] md:text-base">
                {feature.text}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 md:text-[11px]">
                {feature.sub}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
