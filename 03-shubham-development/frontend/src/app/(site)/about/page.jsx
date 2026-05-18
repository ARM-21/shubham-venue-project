"use client";

import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "config/routes";

const values = [
  {
    title: "Clear Planning",
    text: "Guests should know the venue, date, capacity, and menu options before making a decision.",
  },
  {
    title: "Reliable Service",
    text: "Every celebration deserves clean spaces, prepared staff, and smooth coordination.",
  },
  {
    title: "Local Hospitality",
    text: "We bring warm Nepali hospitality into a modern booking experience.",
  },
];

const planningSteps = [
  "Check date and guest count first",
  "Compare suitable venues",
  "Review menu packages",
  "Start booking with guided support",
];

const stats = [
  { value: "10+", label: "Years Active", text: "Years of hospitality experience" },
  { value: "5000+", label: "Happy Guests", text: "Guests served across celebrations" },
  { value: "100%", label: "Trusted", text: "Focus on reliable service" },
  { value: "Elite", label: "Service", text: "Event support experience" },
];

const reasons = [
  "Guided booking flow",
  "Venue and menu clarity",
  "Event-ready spaces",
  "Friendly local support",
  "Suitable for weddings, parties, meetings, and gatherings",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <section className="relative overflow-hidden bg-[#3a1224] px-6 pb-12 pt-44 text-white">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FDFCFB] to-transparent" />
        <div className="relative mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#C0A04C]">About Shubham Venue</p>
            <h1 className="mt-6 max-w-4xl text-4xl font-black leading-[1.03] tracking-tight sm:text-5xl lg:text-6xl">
              Helping Every Celebration Find the Right Place
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg">
              From weddings and engagements to meetings and family gatherings, Shubham Venue helps people plan with more clarity, confidence, and care.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={ROUTES.SITE.VENUES()} className="inline-flex cursor-pointer justify-center rounded-full bg-[#C0A04C] px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-[#3a1224] transition hover:bg-[#d8bc64]">
                Explore Venues
              </Link>
              <Link href="/contact" className="inline-flex cursor-pointer justify-center rounded-full border border-white/20 bg-white/10 px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/15">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-[0_30px_90px_-55px_rgba(0,0,0,0.8)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[#2a0d1a]">
              <Image
                src="/assets/business-images/business-images-carousel/hall2.jpg"
                alt="Shubham Venue event hall atmosphere"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 440px, 100vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#3a1224]/90 to-transparent p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#C0A04C]">Venue atmosphere</p>
                <p className="mt-2 text-lg font-black text-white">Prepared spaces for memorable events</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid gap-3 rounded-[1.5rem] border border-white/15 bg-white/10 p-4 text-center text-xs font-black uppercase tracking-[0.18em] text-white/82 backdrop-blur sm:grid-cols-3">
              <span>Since 2015</span>
              <span>Waling, Syangja</span>
              <span>Trusted Event Support</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Built Around Real Celebrations</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#3a1224] sm:text-4xl">
              Venue planning should feel clear from the beginning.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-[#3a1224]/70">
              <p>
                Planning an event usually means calling different places, asking about dates, comparing prices, checking food options, and hoping nothing is missed. Shubham Venue was created to make this process clearer.
              </p>
              <p>
                We bring venue details, availability, menus, and booking steps into one guided experience so customers can plan with confidence.
              </p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#eadfcb] bg-white p-7 shadow-[0_22px_70px_-50px_rgba(58,18,36,0.35)]">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#C0A04C]">Our view</p>
            <blockquote className="mt-4 text-2xl font-black leading-tight text-[#3a1224]">
              A good venue is not just a space. It becomes part of the memory.
            </blockquote>
          </div>
        </div>
      </section>

      <section className="border-y border-[#eadfcb] bg-white px-6 py-14 lg:py-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-8 max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">What We Believe</p>
            <h2 className="mt-4 text-3xl font-black text-[#3a1224]">Simple standards that shape the experience.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {values.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#eadfcb] bg-[#FDFCFB] p-6 transition hover:-translate-y-1 hover:border-[#C0A04C] hover:bg-white hover:shadow-[0_18px_55px_-48px_rgba(58,18,36,0.45)]">
                <h3 className="text-xl font-black text-[#3a1224]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#3a1224]/65">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">More Than a Hall Booking</p>
            <h2 className="mt-4 text-3xl font-black text-[#3a1224] sm:text-4xl">
              A guided path from planning to booking.
            </h2>
            <p className="mt-5 text-base leading-8 text-[#3a1224]/68">
              The experience is designed around the questions people ask first: date, capacity, venue fit, food, and next steps.
            </p>
          </div>

          <div className="relative grid gap-4">
            <div className="absolute bottom-6 left-6 top-6 hidden w-px bg-[#eadfcb] sm:block" />
            {planningSteps.map((step, index) => (
              <div key={step} className="relative grid gap-4 rounded-2xl border border-[#eadfcb] bg-white p-5 shadow-[0_16px_45px_-42px_rgba(58,18,36,0.4)] sm:grid-cols-[48px_minmax(0,1fr)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#3a1224] text-sm font-black text-[#C0A04C]">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div>
                  <p className="text-sm font-black text-[#3a1224]">{step}</p>
                  <p className="mt-1 text-sm leading-6 text-[#3a1224]/60">
                    {index === 0 && "Start with the details that decide whether a venue can work."}
                    {index === 1 && "Look at halls that match the occasion, guests, and budget."}
                    {index === 2 && "Understand food options before moving further into booking."}
                    {index === 3 && "Continue with clearer information and fewer assumptions."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#3a1224] px-6 py-14 text-white lg:py-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-8 max-w-2xl">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Trust and Numbers</p>
            <h2 className="mt-4 text-3xl font-black">A track record built through service.</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/15 bg-white/10 p-6">
                <p className="text-4xl font-black text-[#C0A04C]">{item.value}</p>
                <p className="mt-3 text-sm font-black uppercase tracking-[0.16em] text-white">{item.label}</p>
                <p className="mt-2 text-sm leading-6 text-white/66">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-14 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-stretch">
          <div className="rounded-[2rem] border border-[#eadfcb] bg-white p-7 shadow-[0_22px_70px_-50px_rgba(58,18,36,0.35)] sm:p-8">
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Local Identity</p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-[#3a1224]">
              Rooted in Waling, Made for Memorable Events
            </h2>
            <p className="mt-5 text-base leading-8 text-[#3a1224]/68">
              Shubham Venue is proudly based in Waling, Syangja. We understand local celebrations, family expectations, food preferences, and the importance of smooth coordination. Our goal is to make event planning easier while keeping the warmth of local hospitality.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#eadfcb] bg-[#fbf7ef] p-7">
            <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#C0A04C]">Visit and contact</p>
            <div className="mt-5 space-y-4 text-sm font-bold leading-6 text-[#3a1224]">
              <p>Address: Waling, Syangja, Gandaki Province, Nepal</p>
              <p>Phone: +977 9812345678</p>
              <p>Support: venue booking, event enquiry, and organizer questions</p>
            </div>
            <Link href="/contact" className="mt-7 inline-flex cursor-pointer justify-center rounded-full bg-[#3a1224] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830]">
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-[#eadfcb] bg-white px-6 py-14 lg:py-16">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Why Choose Us</p>
            <h2 className="mt-4 text-3xl font-black text-[#3a1224]">Why People Choose Shubham Venue</h2>
            <p className="mt-5 text-base leading-8 text-[#3a1224]/68">
              People choose Shubham Venue because the important details are easier to compare and the next step is clear.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[#eadfcb] bg-[#FDFCFB] p-6 sm:p-7">
            <div className="space-y-3">
              {reasons.map((reason, index) => (
                <div key={reason} className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-4 rounded-2xl bg-white p-4">
                  <span className="text-xs font-black text-[#C0A04C]">{String(index + 1).padStart(2, "0")}</span>
                  <p className="text-sm font-bold text-[#3a1224]">{reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 py-14 lg:py-20">
        <div className="rounded-[2rem] border border-[#eadfcb] bg-[#fbf7ef] p-7 text-center shadow-[0_22px_70px_-50px_rgba(58,18,36,0.35)] sm:p-10">
          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[#C0A04C]">Start planning</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-black leading-tight text-[#3a1224] sm:text-4xl">
            Ready to Plan Your Event with Confidence?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#3a1224]/68">
            Start with your date, guest count, and preferred venue style. Shubham Venue will help you move from planning to celebration with less confusion.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={ROUTES.SITE.SEARCH_AVAILABILITY()} className="inline-flex cursor-pointer justify-center rounded-full bg-[#3a1224] px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830]">
              Check Availability
            </Link>
            <Link href="/contact" className="inline-flex cursor-pointer justify-center rounded-full border border-[#eadfcb] bg-white px-7 py-3.5 text-xs font-black uppercase tracking-[0.16em] text-[#3a1224] transition hover:border-[#C0A04C]">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
