import Hero from 'components/hero/Hero.jsx';
import FeaturedVenues from 'components/venues/FeaturedVenues.jsx';
import Menus from 'components/menu/landing-page/ExploreMenus.jsx';
import UpcomingEvents from 'components/events/UpcomingEvents.jsx';
import TrustBar from 'components/common/TrustBar.jsx';
import BookingProcess from 'components/home/BookingProcess.jsx';
import { SiteButton, SiteSectionHeader } from 'components/site/SitePrimitives.jsx';
import { ROUTES } from 'config/routes';

const images = [
  { image: '/assets/business-images/placeholder1.webp', title: 'Welcome', branding: 'Shubham Venue', mini: 'Make it special' },
  { image: '/assets/business-images/placeholder1.webp', title: 'Spacious Hall', branding: 'Grand Hall', mini: 'Perfect for weddings' },
  { image: '/assets/business-images/placeholder1.webp', title: 'Celebrate in style', branding: 'Royal Court', mini: 'Memorable moments' },
];

export default function Home() {
  return (
    <main className="flex flex-col overflow-hidden bg-[var(--color-ivory)]">
      <section id="hero" className="relative flex flex-col">
        <Hero images={images} interval={4000} />
      </section>

      <BookingProcess />

      <TrustBar />

      <section id="venues" className="relative bg-[var(--color-ivory)] pb-12 pt-12 sm:pb-16 lg:pb-20 lg:pt-16">
        <div className="site-container">
          <SiteSectionHeader
            eyebrow="Venue Selection"
            title="Featured Venues"
            description="Discover verified halls and polished celebration spaces with the capacity, pricing, and details guests need before they book."
            action={<SiteButton href={ROUTES.SITE.VENUES()} variant="secondary">View all venues</SiteButton>}
          />
          <FeaturedVenues />
        </div>
      </section>

      <section id="events" className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="site-container">
          <UpcomingEvents />
        </div>
      </section>

      <section id="menus" className="bg-[var(--color-ivory)] py-12 sm:py-16 lg:py-20">
        <div className="site-container">
          <SiteSectionHeader
            eyebrow="Menu Packages"
            title="Curated Menus"
            description="Choose dependable food packages designed for celebration service, from intimate gatherings to full banquet experiences."
            action={<SiteButton href={ROUTES.SITE.MENUS} variant="secondary">Explore menus</SiteButton>}
          />
          <Menus />
        </div>
      </section>

      <section className="bg-[var(--color-ivory)] px-4 pb-16 sm:pb-20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-3xl border border-[var(--color-sand)] bg-[var(--color-wine)] p-7 text-white shadow-[var(--shadow-card)] sm:p-10 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <p className="site-eyebrow mb-3">Ready to plan?</p>
            <h2 className="text-3xl font-black leading-tight tracking-normal sm:text-4xl">Find a date, choose a hall, and start your booking with confidence.</h2>
            <p className="mt-4 text-sm leading-6 text-white/70 sm:text-base">Start with availability first so every venue, menu, and event detail feels easier to decide.</p>
          </div>
          <SiteButton href={ROUTES.SITE.SEARCH_AVAILABILITY()} variant="gold" size="lg">
            Check availability
          </SiteButton>
        </div>
      </section>
    </main>
  );
}
