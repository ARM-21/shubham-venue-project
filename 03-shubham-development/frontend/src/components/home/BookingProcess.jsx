import Link from "next/link";
import { ArrowRight, CalendarCheck, Landmark, UtensilsCrossed } from "lucide-react";
import { ROUTES } from "config/routes";

const steps = [
  {
    number: "01",
    title: "Choose your date",
    description: "Start with availability so you only compare venues that can host your event.",
    icon: CalendarCheck,
    href: ROUTES.SITE.SEARCH_AVAILABILITY(),
  },
  {
    number: "02",
    title: "Compare suitable halls",
    description: "Review capacity, price, location, and venue details with fewer back-and-forth decisions.",
    icon: Landmark,
    href: ROUTES.SITE.VENUES(),
  },
  {
    number: "03",
    title: "Confirm venue and menu",
    description: "Move into menus and booking details with a clearer plan for your guests.",
    icon: UtensilsCrossed,
    href: ROUTES.SITE.MENUS,
  },
];

export default function BookingProcess() {
  return (
    <section className="bg-[var(--color-ivory)] py-10 sm:py-12 lg:py-14">
      <div className="site-container">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="site-eyebrow mb-3">How Booking Works</p>
            <h2 className="max-w-xl text-3xl font-black leading-tight tracking-normal text-[var(--color-wine)] sm:text-4xl">
              A simpler path from idea to confirmed celebration.
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <Link
                key={step.number}
                href={step.href}
                className="group rounded-2xl border border-[var(--color-sand)] bg-white p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-champagne)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-black text-[var(--color-champagne)]">{step.number}</span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-ivory)] text-[var(--color-wine)] transition-colors group-hover:bg-[var(--color-champagne)]">
                    <step.icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-black leading-tight text-[var(--color-wine)]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[var(--color-stone)]">{step.description}</p>
                <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[var(--color-wine)]">
                  Continue
                  <ArrowRight className="h-4 w-4 text-[var(--color-champagne)] transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
