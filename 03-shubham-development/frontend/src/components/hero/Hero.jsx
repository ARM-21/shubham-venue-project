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
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C0A04C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C0A04C]"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">
              Shubham Venue
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight uppercase">
            Elevating Your Most <br />
            <span className="text-[#C0A04C] italic serif lowercase">special</span> Moments
          </h1>

          {/* Description */}
          <p className="max-w-2xl mx-auto text-sm md:text-lg leading-relaxed text-white/80 font-medium px-4">
            A beautiful collection of premium spaces and menus designed to turn your big day into a memory that lasts forever.
          </p>

          {/* Buttons - Fixed to equal width and responsive stacking */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full max-w-md mx-auto sm:max-w-none">
            <button
              onClick={() => router.push(ROUTES.SITE.SEARCH_AVAILABILITY())}
              className="w-full sm:w-64 group relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-[#631d3c] px-8 py-4 md:py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-[#C0A04C] hover:text-[#3a1224] active:scale-95 shadow-2xl cursor-pointer border border-[#3a1224]"
            >
              <span className="relative z-10">Check Availability</span>
              <svg 
                className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            <button
              onClick={() => router.push(ROUTES.SITE.VENUES())}
              className="w-full sm:w-64 flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 md:py-5 text-[11px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/40 active:scale-95 shadow-xl cursor-pointer"
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
