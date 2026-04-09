"use client";

import Carousel from 'components/carousel/slider.jsx';
import { useRouter } from 'next/navigation';
import { ROUTES } from 'config/routes';

export default function Hero({ images = [], interval = 4000 }) {
  const router = useRouter();

  return (
    <section className="relative w-full min-h-[550px] md:min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        <Carousel images={images} interval={interval} />
        {/* Darker overlay for better text contrast on mobile */}
        <div className="absolute inset-0 bg-black/50 lg:bg-gradient-to-b lg:from-[#1a0a0d]/60 lg:via-transparent lg:to-[#1a0a0d]/90" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-20 md:py-32 flex flex-col items-center text-center">
        <div className="max-w-4xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-xl mx-auto shadow-2xl">
            <div className="w-2 h-2 rounded-full bg-[#C0A04C]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">
              Shubham Venue
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight uppercase">
            Elevating Your Most <br />
            <span className="text-[#C0A04C] italic serif lowercase">Significant</span> Occasions
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-sm md:text-lg leading-relaxed text-white/80 font-medium px-4">
            A carefully selected collection of quality spaces and menus designed to create meaningful memories for your event.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
              onClick={() => router.push(ROUTES.SITE.SEARCH_AVAILABILITY())}
              className="group flex items-center justify-center px-8 py-3 sm:py-4 rounded-full bg-[#C0A04C] text-[#3a1224] text-xs sm:text-sm font-black uppercase tracking-wider hover:shadow-2xl hover:shadow-[#C0A04C]/30 transition-all duration-300 hover:-translate-y-1"
            >
              Check Availability
              <svg className="w-4 h-4 ml-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <button
              onClick={() => router.push(ROUTES.SITE.VENUES())}
              className="flex items-center justify-center px-8 py-3 sm:py-4 rounded-full border-2 border-white text-white text-xs sm:text-sm font-black uppercase tracking-wider hover:bg-white hover:text-[#3a1224] transition-all duration-300 hover:-translate-y-1"
            >
              Browse Halls
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8f5f2] to-transparent z-10 hidden lg:block" />
    </section>
  );
}
