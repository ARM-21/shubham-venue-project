"use client";

import Carousel from 'components/carousel/slider.jsx';
import Link from 'next/link';
import { ArrowRight, CalendarCheck, ChevronRight, MapPinned, Sparkles, UsersRound, UtensilsCrossed } from 'lucide-react';
import { ROUTES } from 'config/routes';

const planningSteps = [
  { label: "Date", value: "Check availability", icon: CalendarCheck },
  { label: "Venue", value: "Pick your hall", icon: MapPinned },
  { label: "Guests", value: "Plan the capacity", icon: UsersRound },
  { label: "Menu", value: "Choose catering", icon: UtensilsCrossed },
];

export default function Hero({ images = [], interval = 4000 }) {
  return (
    <section className="relative flex min-h-[640px] w-full flex-col justify-end overflow-hidden md:min-h-[78vh]">
      <HeroBackground images={images} interval={interval} />

      <div className="site-container relative z-10 grid gap-8 pb-16 pt-32 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end lg:pb-20">
        <HeroContent />
        <HeroBookingPath />
      </div>
    </section>
  );
}

function HeroBackground({ images, interval }) {
  return (
    <div className="absolute inset-0 z-0">
      <Carousel images={images} interval={interval} />
      <div className="absolute inset-0 bg-[#17080d]/72" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_28%,rgba(192,160,76,0.24),transparent_28%),linear-gradient(105deg,rgba(26,10,13,0.96)_0%,rgba(58,18,36,0.82)_44%,rgba(26,10,13,0.38)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#17080d]/40 to-transparent" />
    </div>
  );
}

function HeroContent() {
  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="mb-6 inline-flex items-center gap-3 border-l-2 border-[var(--color-champagne)] bg-white/10 px-4 py-2 text-white shadow-2xl backdrop-blur-xl">
        <Sparkles className="h-3.5 w-3.5 text-[var(--color-champagne)]" aria-hidden="true" />
        <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/90">Shubham Venue Concierge</span>
      </div>

      <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-normal text-white sm:text-5xl md:text-6xl xl:text-7xl">
        Plan your event with confidence.
      </h1>

      <p className="mt-5 max-w-xl text-base font-medium leading-7 text-white/80 md:text-lg">
        Venues, menus, and booking details in one guided flow, built for celebrations that need clarity before commitment.
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
    <aside className="hidden rounded-3xl border border-white/15 bg-white/10 p-4 text-white shadow-2xl backdrop-blur-2xl lg:block">
      <div className="border-b border-white/10 px-2 pb-3">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[var(--color-champagne)]">Booking Path</p>
        <h2 className="mt-2 text-xl font-black leading-tight">A calmer way to plan.</h2>
      </div>
      <div className="mt-3 space-y-2">
        {planningSteps.map((step, index) => (
          <Link
            key={step.label}
            href={index === 0 ? ROUTES.SITE.SEARCH_AVAILABILITY() : index === 3 ? ROUTES.SITE.MENUS : ROUTES.SITE.VENUES()}
            className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.08] p-2.5 transition-all hover:border-[var(--color-champagne)]/60 hover:bg-white/15"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-champagne)]/15 text-[var(--color-champagne)]">
              <step.icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-white/50">{step.label}</span>
              <span className="mt-0.5 block text-sm font-bold text-white">{step.value}</span>
            </span>
            <ChevronRight className="h-4 w-4 text-white/35 transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-champagne)]" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </aside>
  );
}
