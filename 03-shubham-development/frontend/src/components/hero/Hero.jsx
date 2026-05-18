"use client";

import Carousel from 'components/carousel/slider.jsx';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, MapPinned, UtensilsCrossed } from 'lucide-react';
import { ROUTES } from 'config/routes';

export default function Hero({ images = [], interval = 4000 }) {
  return (
    <section className="relative flex min-h-[640px] w-full flex-col justify-end overflow-hidden md:min-h-[82vh]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Carousel images={images} interval={interval} />
        <div className="absolute inset-0 bg-[#17080d]/58" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#17080d]/92 via-[#17080d]/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#17080d]/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="site-container relative z-10 pb-14 pt-32 lg:pb-18">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-champagne)]">
            Shubham Venue · Waling, Syangja
          </p>
          <h1 className="mt-5 text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl md:text-6xl">
            Find and book event venues with confidence.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-white/72 md:text-lg">
            Check dates, compare halls, review menus, and start booking from one guided flow.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={ROUTES.SITE.SEARCH_AVAILABILITY()}
              className="inline-flex items-center gap-2 rounded-md bg-[var(--color-champagne)] px-6 py-3.5 text-sm font-bold text-[var(--color-wine)] transition hover:bg-[var(--color-champagne-light)]"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              Check availability
            </Link>
            <Link
              href={ROUTES.SITE.VENUES()}
              className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/18"
            >
              <MapPinned className="h-4 w-4" aria-hidden="true" />
              Browse venues
            </Link>
          </div>
        </div>

        {/* Trust strip */}
        <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-white/12 pt-6 text-xs text-white/50">
          <span>Est. 2015</span>
          <span className="h-3 w-px bg-white/20" aria-hidden="true" />
          <span>5,000+ guests served</span>
          <span className="h-3 w-px bg-white/20" aria-hidden="true" />
          <span>Waling, Syangja, Nepal</span>
          <span className="h-3 w-px bg-white/20" aria-hidden="true" />
          <Link
            href={ROUTES.SITE.EVENTS}
            className="font-bold text-[var(--color-champagne)] transition hover:underline"
          >
            View upcoming events
          </Link>
        </div>
      </div>
    </section>
  );
}
