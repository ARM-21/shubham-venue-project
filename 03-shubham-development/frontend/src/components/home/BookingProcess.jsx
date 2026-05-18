"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Flag,
  Landmark,
  UtensilsCrossed,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ROUTES } from "config/routes";

const journeyStops = [
  {
    number: "01",
    label: "Date",
    title: "Check your date",
    description: "Pick your event date, slot, and guest count first.",
    href: ROUTES.SITE.SEARCH_AVAILABILITY(),
    action: "Check availability",
    icon: CalendarCheck,
    cardClass: "left-[8%] top-[17%] w-[320px] xl:w-[370px]",
    pinClass: "left-[58%] top-[23%]",
    connectorClass: "left-[38%] top-[25.4%] w-[20%]",
  },
  {
    number: "02",
    label: "Venue",
    title: "Choose a hall",
    description: "Compare spaces that fit your guest count and event style.",
    href: ROUTES.SITE.VENUES(),
    action: "View venues",
    icon: Landmark,
    cardClass: "right-[8%] top-[34%] w-[330px] xl:w-[390px]",
    pinClass: "left-[48%] top-[39%]",
    connectorClass: "left-[52%] top-[41.5%] w-[17%]",
  },
  {
    number: "03",
    label: "Menu",
    title: "Review menus",
    description: "Choose food packages after the venue direction is clear.",
    href: ROUTES.SITE.MENUS,
    action: "Explore menus",
    icon: UtensilsCrossed,
    cardClass: "left-[8%] top-[51%] w-[330px] xl:w-[390px]",
    pinClass: "left-[58%] top-[56%]",
    connectorClass: "left-[39%] top-[58.5%] w-[19%]",
  },
];

const roadPath =
  "M 450 90 C 505 145 555 185 530 250 C 500 330 430 365 440 465 C 450 555 555 590 535 700 C 515 795 455 850 490 945 C 505 1030 505 1085 500 1130";

export default function BookingProcess() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 78%", "end 42%"],
  });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-y border-[var(--color-sand)] bg-white py-16 text-[var(--color-wine)] sm:py-20 lg:py-24"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(192,160,76,0.13),transparent_30%),radial-gradient(circle_at_86%_78%,rgba(58,18,36,0.05),transparent_32%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-champagne)]/45 to-transparent" />

      <div className="site-container relative z-10">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="site-eyebrow mb-3">Booking Journey</p>
          <h2 className="site-heading text-[var(--color-wine)]">
            Follow the road from date to celebration
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-[var(--color-stone)] sm:text-base">
            The path fills as you scroll, showing the order that keeps booking
            clear: date first, venue second, menu third.
          </p>
        </div>

        <DesktopJourneyRoad pathLength={pathLength} />
        <MobileJourneyRoad pathLength={pathLength} />
      </div>
    </section>
  );
}

function DesktopJourneyRoad({ pathLength }) {
  return (
    <div className="relative hidden min-h-[920px] overflow-hidden p-6 lg:block xl:min-h-[1420px]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(58,18,36,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(58,18,36,0.025)_1px,transparent_1px)] bg-[size:56px_56px] opacity-35" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(192,160,76,0.08),transparent_42%)]" />
      <RoadSvg pathLength={pathLength} />

      <RouteFlag className="left-1/2 top-[5%] -translate-x-1/2" label="Start" />

      {journeyStops.map((stop, index) => (
        <DesktopStop key={stop.number} stop={stop} index={index} />
      ))}

      <RouteFlag className="left-[53%] bottom-[11%]" label="Finish" end />
      <FinalDestination className="absolute bottom-[7%] right-[5%] z-20 w-[390px] xl:w-[450px]" />
    </div>
  );
}

function RoadSvg({ pathLength }) {
  return (
    <svg
      className="absolute inset-x-6 top-24 z-0 h-[1210px] w-[calc(100%-3rem)] xl:h-[1270px]"
      viewBox="0 0 900 1260"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d={roadPath}
        fill="none"
        stroke="rgba(58,18,36,0.18)"
        strokeDasharray="12 16"
        strokeLinecap="round"
        strokeWidth="9"
      />
      <motion.path
        d={roadPath}
        fill="none"
        stroke="var(--color-champagne)"
        strokeLinecap="round"
        strokeWidth="9"
        style={{ pathLength }}
      />
      <RouteCheckpoint cx="450" cy="90" />
      <RouteCheckpoint cx="500" cy="1130" />
    </svg>
  );
}

function RouteCheckpoint({ cx, cy }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r="13" fill="#fff8ec" stroke="var(--color-champagne)" strokeWidth="4" />
      <circle cx={cx} cy={cy} r="5" fill="var(--color-champagne)" />
    </g>
  );
}

function RouteFlag({ className = "", label, end = false }) {
  return (
    <div className={`absolute z-20 flex items-center gap-2 rounded-full border border-[var(--color-champagne)]/50 bg-white/95 px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-wine)] shadow-[var(--shadow-soft)] backdrop-blur-xl ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-champagne)] text-[var(--color-wine)]">
        <Flag className={`h-4 w-4 ${end ? "fill-current" : ""}`} aria-hidden="true" />
      </span>
      {label}
    </div>
  );
}

function DesktopStop({ stop, index }) {
  const Icon = stop.icon;

  return (
    <>
      <span
        className={`absolute z-10 h-0.5 rounded-full bg-gradient-to-r from-[var(--color-wine)]/20 via-[var(--color-champagne)] to-[var(--color-wine)]/50 shadow-[0_0_18px_rgba(192,160,76,0.42)] ${stop.connectorClass}`}
        aria-hidden="true"
      />
      <span
        className={`absolute z-20 flex h-14 w-14 items-center justify-center rounded-full border-[6px] border-white bg-[var(--color-champagne)] text-[var(--color-wine)] shadow-xl ${stop.pinClass}`}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span className="absolute -bottom-7 whitespace-nowrap rounded-full border border-[var(--color-sand)] bg-white/95 px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[var(--color-stone)]">
          Checkpoint
        </span>
      </span>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className={`absolute z-30 ${stop.cardClass}`}
      >
        <JourneyCard stop={stop} />
      </motion.div>
    </>
  );
}

function MobileJourneyRoad({ pathLength }) {
  return (
    <div className="relative overflow-hidden p-5 lg:hidden">
      <div className="absolute bottom-10 left-10 top-9 w-px bg-[var(--color-sand)]" aria-hidden="true" />
      <motion.div
        className="absolute bottom-10 left-10 top-9 w-px origin-top bg-[var(--color-champagne)]"
        style={{ scaleY: pathLength }}
        aria-hidden="true"
      />

      <div className="space-y-7">
        {journeyStops.map((stop, index) => (
          <MobileStop key={stop.number} stop={stop} index={index} />
        ))}
        <div className="relative pl-14">
          <span className="absolute left-0 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[var(--color-champagne)] text-[var(--color-wine)] shadow-xl">
            <Flag className="h-5 w-5 fill-current" aria-hidden="true" />
          </span>
          <FinalDestination />
        </div>
      </div>
    </div>
  );
}

function MobileStop({ stop, index }) {
  const Icon = stop.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="relative pl-14"
    >
      <span className="absolute left-0 top-5 z-20 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[var(--color-champagne)] text-[var(--color-wine)] shadow-xl">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <JourneyCard stop={stop} compact />
    </motion.div>
  );
}

function JourneyCard({ stop, compact = false }) {
  return (
    <Link
      href={stop.href}
      className={`group block rounded-2xl border border-[var(--color-champagne)]/25 bg-[linear-gradient(145deg,#3a1224,#250c17)] p-5 text-white shadow-[0_22px_55px_-38px_rgba(58,18,36,0.75)] transition-all hover:-translate-y-1 hover:border-[var(--color-champagne)] ${
        compact ? "" : "min-h-[235px]"
      }`}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">
          {stop.label}
        </span>
        <span className="text-sm font-black text-[var(--color-champagne)]">
          {stop.number}
        </span>
      </div>

      <h3 className="text-2xl font-black leading-tight text-white">
        {stop.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/68">
        {stop.description}
      </p>

      <div className="mt-7 inline-flex items-center gap-2 text-sm font-black text-[var(--color-champagne)]">
        {stop.action}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </div>
    </Link>
  );
}

function FinalDestination({ className = "" }) {
  return (
    <div className={`rounded-2xl border border-[var(--color-champagne)]/35 bg-[linear-gradient(145deg,#4a1428,#2a0d19)] p-5 text-white shadow-[0_26px_70px_-42px_rgba(58,18,36,0.85)] ${className}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[var(--color-champagne)]">
        Destination
      </p>
      <h3 className="mt-2 text-2xl font-black leading-tight">
        Continue booking from the selected venue.
      </h3>
      <p className="mt-3 text-sm leading-6 text-white/68">
        Booking opens after the venue, date, slot, and guest count are known.
      </p>
      <Link
        href={ROUTES.SITE.SEARCH_AVAILABILITY()}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--color-champagne)] px-5 py-3 text-xs font-black uppercase tracking-[0.12em] text-[var(--color-wine)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-champagne-light)]"
      >
        Start booking
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
