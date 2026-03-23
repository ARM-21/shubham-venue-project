"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Coffee, ArrowRight } from 'lucide-react';
import { ROUTES } from 'config/routes';
import { useRouter } from 'next/navigation';

export const MenuSection = ({ menusLoading, menuPackages, currencyFormatter }) => {
  const router = useRouter();

  return (
    <section className="mt-20 lg:mt-28 xl:mt-32">
      <div className="flex flex-col items-center text-center mb-16 lg:mb-20 xl:mb-24 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 text-[60px] sm:text-[90px] lg:text-[120px] font-display font-black text-[#3a1224]/[0.02] select-none whitespace-nowrap">
          Food & Drinks
        </div>
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap justify-center">
          <div className="w-6 sm:w-12 h-[1px] bg-[#C0A04C]" />
          <span className="text-[10px] sm:text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.3em] sm:tracking-[0.5em]">The Dining Experience</span>
          <div className="w-6 sm:w-12 h-[1px] bg-[#C0A04C]" />
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-[#3a1224] mb-6 sm:mb-8">Our Menu Packages</h2>
        <p className="text-[#3a1224]/60 max-w-2xl text-sm sm:text-lg leading-relaxed font-light italic border-b border-[#C0A04C]/20 pb-8 sm:pb-10 px-2">
          Pick the best food for your guests. We have traditional dishes and international flavors for every taste.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12 xl:gap-16">
        {menusLoading ? (
          [1,2,3].map(i => (
            <div key={i} className="h-[500px] bg-white rounded-none animate-pulse shadow-sm border border-gray-100" />
          ))
        ) : menuPackages.length ? (
          menuPackages.map((menu, idx) => {
            const img = menu.heroImage || menu.image || menu.thumbnail || '/assets/business-images/placeholder.jpg';
            const title = menu.name || menu.title || 'Wedding Feast';
            const priceVal = menu.pricePerPerson ?? menu.price ?? menu.pricePerHead ?? null;
            const isPopular = !!menu.isPopular || idx === 1;
            
            return (
              <motion.div 
                key={menu._id || idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => router.push(ROUTES.SITE.MENU_DETAILS(menu.slug || menu._id || ''))}
                className="relative group cursor-pointer"
              >
                <div className={`h-full bg-white rounded-none border ${isPopular ? 'border-[#C0A04C] shadow-[0_40px_80px_rgba(192,160,76,0.1)]' : 'border-[#3a1224]/5 shadow-sm'} p-4 sm:p-6 lg:p-8 transition-all duration-[1s] hover:-translate-y-4 hover:shadow-2xl`}>
                  {isPopular && (
                    <div className="absolute -top-4 sm:-top-5 left-1/2 -translate-x-1/2 bg-[#3a1224] text-[#C0A04C] text-[8px] sm:text-[10px] font-black px-4 sm:px-8 py-2 sm:py-3 rounded-none shadow-2xl tracking-[0.2em] sm:tracking-[0.3em] uppercase whitespace-nowrap z-20 border border-[#C0A04C]/30">
                      Recommended
                    </div>
                  )}
                  
                  <div className="relative h-[16rem] sm:h-[22rem] rounded-none overflow-hidden mb-6 sm:mb-10 ring-1 ring-[#3a1224]/5">
                    <img src={img} className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" alt={title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/90 via-[#3a1224]/20 to-transparent" />
                    <div className="absolute bottom-3 sm:bottom-6 lg:bottom-8 left-3 sm:left-6 lg:left-8 right-3 sm:right-6 lg:right-8">
                      <div className="flex items-center gap-2 text-[#C0A04C] text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-3 sm:mb-4">
                        <Coffee className="w-3 sm:w-4 h-3 sm:h-4 flex-shrink-0" /> <span className="truncate">{menu.category || 'Luxury Buffet'}</span>
                      </div>
                      <h4 className="text-white text-xl sm:text-2xl lg:text-3xl font-display font-bold leading-tight line-clamp-2">{title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-50">
                    <div className="space-y-1 min-w-0">
                      <p className="text-[8px] sm:text-[10px] text-[#3a1224]/30 font-black uppercase tracking-[0.15em] sm:tracking-[0.3em]">Per Guest</p>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-display font-bold text-[#3a1224] break-words">
                        {priceVal ? currencyFormatter.format(priceVal) : 'Call for Price'}
                      </div>
                    </div>
                    <div className="w-12 sm:w-16 h-12 sm:h-16 bg-[#fdfaf6] rounded-none flex items-center justify-center group-hover:bg-[#3a1224] transition-all duration-700 flex-shrink-0">
                      <ArrowRight className="w-4 sm:w-6 h-4 sm:h-6 text-[#3a1224] group-hover:text-[#C0A04C] transition-colors" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : null}
      </div>
    </section>
  );
};
