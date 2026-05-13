"use client";

import Carousel from 'components/carousel/slider.jsx';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, MapPinned, Sparkles, UtensilsCrossed } from 'lucide-react';
import { ROUTES } from 'config/routes';

const planningSteps = [
  { label: "Availability", value: "Start with date and guests", icon: CalendarCheck, href: ROUTES.SITE.SEARCH_AVAILABILITY() },
  { label: "Venues", value: "Compare verified halls", icon: MapPinned, href: ROUTES.SITE.VENUES() },
  { label: "Menus", value: "Review food packages", icon: UtensilsCrossed, href: ROUTES.SITE.MENUS },
];

export default function Hero({ images = [], interval = 4000 }) {
  return (
    <section className="relative flex min-h-[660px] w-full flex-col justify-end overflow-hidden md:min-h-[95vh]">
      <HeroBackground images={images} interval={interval} />

      <div className="site-container relative z-10 grid gap-8 pb-14 pt-32 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end lg:pb-16">
        <HeroContent />
        <HeroBookingPath />
      </div>
    </section>
  );
}

function HeroBackground({ images, interval }) {
  return (
    <div className="absolute inset-0 z-0 ">
      {/* <div className="absolute inset-0 scale-[1.03] blur-[1px]"> */}
        <Carousel images={images} interval={interval} />
      {/* </div> */}
      <div className="absolute inset-0 bg-[#17080d]/62" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#17080d]/95 via-[#17080d]/70 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_28%,rgba(192,160,76,0.2),transparent_28%),linear-gradient(105deg,rgba(26,10,13,0.9)_0%,rgba(58,18,36,0.74)_44%,rgba(26,10,13,0.3)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#17080d]/40 to-transparent" />
    </div>
  );
}

function HeroContent() {
  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="mb-6 inline-flex items-center gap-3 border-l-2 border-[var(--color-champagne)] bg-white/10 px-4 py-2 text-white shadow-2xl backdrop-blur-xl">
        <Sparkles className="h-3.5 w-3.5 text-[var(--color-champagne)]" aria-hidden="true" />
        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/90">Welcome to Shubham Venue </span>
      </div>

      <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-5xl md:text-6xl xl:text-7xl">
        Find and book event venues with confidence.
      </h1>

      <p className="mt-5 max-w-xl text-base font-medium leading-7 text-white/80 md:text-lg">
        Check dates, compare halls, review menus, and start booking from one guided flow.
      </p>

      <HeroActions />
    </div>
  );
}

function HeroActions() {
  return (
    <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
      <Link
        href={ROUTES.SITE.SEARCH_AVAILABILITY()}
        className="group inline-flex items-center justify-center gap-3 rounded-full bg-[var(--color-champagne)] px-6 py-3.5 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-wine)] shadow-[0_24px_55px_-28px_rgba(192,160,76,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[var(--color-champagne-light)] sm:px-7"
      >
        <CalendarCheck className="h-4 w-4" aria-hidden="true" />
        Check availability
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </Link>

      <Link
        href={ROUTES.SITE.VENUES()}
        className="inline-flex items-center justify-center gap-3 rounded-full border border-white/35 bg-white/10 px-6 py-3.5 text-xs font-black uppercase tracking-[0.12em] text-white backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[var(--color-wine)] sm:px-7"
      >
        <MapPinned className="h-4 w-4" aria-hidden="true" />
        Browse venues
      </Link>
    </div>
  );
}

function HeroBookingPath() {
  return (
    <aside className="hidden rounded-2xl border border-white/15 bg-white/10 p-4 text-white shadow-2xl backdrop-blur-2xl lg:block">
      <div className="border-b border-white/10 px-2 pb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-champagne)]">Start here</p>
        <h2 className="mt-2 text-lg font-black leading-tight">Plan by availability first.</h2>
      </div>
      <div className="mt-3 space-y-2">
        {planningSteps.map((step) => (
          <Link
            key={step.label}
            href={step.href}
            className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.08] p-2.5 transition-all hover:border-[var(--color-champagne)]/60 hover:bg-white/15"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-champagne)]/15 text-[var(--color-champagne)]">
              <step.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/50">{step.label}</span>
              <span className="mt-0.5 block text-sm font-bold text-white">{step.value}</span>
            </span>
            <ArrowRight className="h-4 w-4 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-champagne)]" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </aside>
  );
}
