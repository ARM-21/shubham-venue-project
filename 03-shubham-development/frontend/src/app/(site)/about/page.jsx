"use client";

import Image from "next/image";
import { ROUTES } from "config/routes";
import { SitePageHeader, SiteCard, SiteButton, cn } from "components/site/SitePrimitives.jsx";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <SitePageHeader
        eyebrow="About Shubham Venue"
        title="Helping every celebration find the right place."
      >
        <div className="mt-8 grid gap-8 border-t border-white/20 pt-8 sm:grid-cols-3 sm:gap-12 lg:mt-12 lg:pt-12">
          <div>
            <p className="text-2xl font-black text-[var(--color-champagne)]">Since 2015</p>
            <p className="mt-2 text-sm font-medium leading-6 text-white/80">Operating in Waling, Syangja</p>
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--color-champagne)]">5,000+</p>
            <p className="mt-2 text-sm font-medium leading-6 text-white/80">Guests served across celebrations</p>
          </div>
          <div>
            <p className="text-2xl font-black text-[var(--color-champagne)]">One platform</p>
            <p className="mt-2 text-sm font-medium leading-6 text-white/80">Venue, menu, booking — all in one place</p>
          </div>
        </div>
      </SitePageHeader>

      {/* ── Story ─────────────────────────────────────────────── */}
      <section className="site-container py-16 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-[1fr_420px] lg:items-start">
          <div className="max-w-2xl">
            <p className="site-eyebrow mb-4">How it started</p>
            <h2 className="site-heading text-[var(--color-wine)]">
              Venue planning used to mean calls, guesswork, and uncertainty.
            </h2>
            <div className="mt-6 space-y-6 text-base leading-8 text-[var(--color-stone)]">
              <p>
                Planning an event usually meant calling different halls, asking about dates and availability, 
                comparing prices without clear context, and hoping nothing was missed before the deposit was paid. 
                Shubham Venue was created to fix that.
              </p>
              <p>
                We bring venue details, real availability, menu packages, and a guided booking flow into one 
                experience — so families and organizers can plan with confidence instead of confusion.
              </p>
              <p>
                From weddings and engagements to corporate dinners and family gatherings, the platform 
                is built around the questions people actually ask first.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <SiteButton href={ROUTES.SITE.VENUES()} icon={null}>
                Browse Venues
              </SiteButton>
              <SiteButton href={ROUTES.SITE.SEARCH_AVAILABILITY()} variant="secondary" icon={null}>
                Check Availability
              </SiteButton>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[var(--color-pearl)] border border-[var(--color-sand)]">
              <Image
                src="/assets/business-images/placeholder2.jpg"
                alt="Shubham Venue event hall"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 420px"
                priority
              />
            </div>
            <div className="mt-6 border-l-2 border-[var(--color-champagne)] pl-5">
              <p className="text-sm font-medium italic leading-relaxed text-[var(--color-stone)]">
                "A good venue is not just a space. It becomes part of the memory."
              </p>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-wine)]/50">
                — Shubham Venue team
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What we stand for ─────────────────────────────────── */}
      <section className="border-y border-[var(--color-sand)] bg-white py-16 lg:py-24">
        <div className="site-container">
          <div className="grid gap-12 lg:grid-cols-[280px_1fr] lg:items-start">
            <div>
              <p className="site-eyebrow mb-4">What we believe</p>
              <h2 className="site-heading text-[var(--color-wine)]">
                Simple standards that shape every booking.
              </h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              <BeliefCard 
                title="Clear Planning" 
                desc="Guests should know the venue, date, capacity, and menu options before making a decision." 
              />
              <BeliefCard 
                title="Reliable Service" 
                desc="Every celebration deserves clean spaces, prepared staff, and smooth coordination on the day." 
              />
              <BeliefCard 
                title="Local Hospitality" 
                desc="We bring warm Nepali hospitality into a modern booking experience built for local celebrations." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="site-container py-16 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div className="max-w-xl">
            <p className="site-eyebrow mb-4">The booking flow</p>
            <h2 className="site-heading text-[var(--color-wine)]">
              A guided path from planning to confirmation.
            </h2>
            <p className="mt-6 text-base leading-8 text-[var(--color-stone)]">
              The platform is designed around the questions people ask first: date, guest count, 
              venue fit, food options, and what happens next.
            </p>
          </div>

          <div className="flex flex-col">
            {[
              {
                step: "01",
                title: "Check date and guest count",
                desc: "Start with the details that decide whether a venue can work for your event.",
              },
              {
                step: "02",
                title: "Compare suitable venues",
                desc: "Browse halls that match the occasion, your guest list size, and your budget.",
              },
              {
                step: "03",
                title: "Review menu packages",
                desc: "Understand food options and catering details before going further.",
              },
              {
                step: "04",
                title: "Book with guided support",
                desc: "Move forward with clearer information and direct confirmation from the team.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-6 border-b border-[var(--color-sand)] py-6 first:pt-0 last:border-0 last:pb-0"
              >
                <span className="mt-0.5 shrink-0 text-sm font-black text-[var(--color-champagne)]">
                  {item.step}
                </span>
                <div>
                  <p className="text-base font-black text-[var(--color-wine)]">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-stone)]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Track record ─────────────────────────────────────── */}
      <section className="bg-[var(--color-wine)] py-16 text-white lg:py-24">
        <div className="site-container">
          <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-champagne)] mb-4">
                Track record
              </p>
              <h2 className="text-3xl font-black leading-tight sm:text-4xl">
                A platform built through years of hospitality service.
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-10 sm:grid-cols-4 lg:gap-x-16">
              {[
                { value: "10+", label: "Years active" },
                { value: "5,000+", label: "Guests served" },
                { value: "3", label: "Venue halls" },
                { value: "2015", label: "Founded" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-4xl font-black text-[var(--color-champagne)]">{item.value}</p>
                  <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Local identity + contact ──────────────────────────── */}
      <section className="bg-white border-t border-[var(--color-sand)]">
        <div className="site-container py-16 lg:py-24">
          <div className="grid gap-16 lg:grid-cols-[1fr_380px] lg:items-start">
            <div className="max-w-2xl">
              <p className="site-eyebrow mb-4">Rooted locally</p>
              <h2 className="site-heading text-[var(--color-wine)]">
                Based in Waling, built for Nepali celebrations.
              </h2>
              <p className="mt-6 text-base leading-8 text-[var(--color-stone)]">
                Shubham Venue is proudly based in Waling, Syangja. We understand local celebrations, 
                family expectations, food preferences, and how important smooth coordination is on the day. 
                Our goal is to make event planning easier while keeping the warmth of local hospitality intact.
              </p>

              <div className="mt-12">
                <p className="site-eyebrow mb-6">Why people choose us</p>
                <ul className="space-y-4">
                  {[
                    "Guided booking flow with clear next steps",
                    "Transparent venue and menu information",
                    "Event-ready spaces for any occasion",
                    "Friendly, responsive local support",
                    "Suitable for weddings, parties, meetings, and gatherings",
                  ].map((reason) => (
                    <li key={reason} className="flex items-start gap-4 text-sm font-semibold leading-6 text-[var(--color-stone)]">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-champagne)]" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <aside className="sticky top-24 space-y-6">
              <SiteCard className="p-6 sm:p-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-stone)]">
                  Visit and contact
                </p>
                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-stone)]/70">Address</p>
                    <p className="mt-1 text-sm font-bold text-[var(--color-wine)]">
                      Waling, Syangja, Gandaki Province, Nepal
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-stone)]/70">Phone</p>
                    <p className="mt-1 text-sm font-bold text-[var(--color-wine)]">+977 9812345678</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-stone)]/70">Support</p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-stone)]">
                      Venue booking, event enquiry, organizer questions
                    </p>
                  </div>
                </div>
                <SiteButton href="/contact" className="mt-8 w-full" icon={null}>
                  Contact Us
                </SiteButton>
              </SiteCard>

              <SiteCard className="bg-white p-6 sm:p-8">
                <p className="text-lg font-black text-[var(--color-wine)]">Ready to start planning?</p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-stone)]">
                  Enter your date and guest count to see what&apos;s available.
                </p>
                <SiteButton 
                  href={ROUTES.SITE.SEARCH_AVAILABILITY()} 
                  variant="secondary" 
                  className="mt-6 w-full" 
                  icon={null}
                >
                  Check Availability
                </SiteButton>
              </SiteCard>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function BeliefCard({ title, desc }) {
  return (
    <div className="border-t-2 border-[var(--color-champagne)] pt-6">
      <h3 className="text-lg font-black text-[var(--color-wine)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[var(--color-stone)]">
        {desc}
      </p>
    </div>
  );
}
