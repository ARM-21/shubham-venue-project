import Hero from 'components/hero/Hero.jsx';
import FeaturedVenues from 'components/venues/FeaturedVenues.jsx';
import Menus from 'components/menu/landing-page/ExploreMenus.jsx';
import UpcomingEvents from 'components/events/UpcomingEvents.jsx';
import BookingProcess from 'components/home/BookingProcess.jsx';
import { SiteButton, SiteSectionHeader } from 'components/site/SitePrimitives.jsx';
import { ROUTES } from 'config/routes';

const images = [
  { image: '/assets/business-images/image-1.jpeg', title: 'Welcome', branding: 'Shubham Venue', mini: 'Make it special' },
  { image: '/assets/business-images/image-2.jpeg', title: 'Spacious Hall', branding: 'Grand Hall', mini: 'Perfect for weddings' },
  { image: '/assets/business-images/image-3.webp', title: 'Celebrate in style', branding: 'Royal Court', mini: 'Memorable moments' },
];

export default function Home() {
  return (
    <main className="flex flex-col bg-white">
      <Hero images={images} interval={4000} />

      <section className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="site-container">
          <FeaturedVenues />
        </div>
      </section>

      <BookingProcess />

      <section className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="site-container">
          <UpcomingEvents />
        </div>
      </section>

      <section className="border-y border-[var(--color-sand)] bg-white py-14 sm:py-16 lg:py-20">
        <div className="site-container">
          <Menus />
        </div>
      </section>

      <section className="bg-white px-4 py-14 sm:py-16 lg:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 rounded-[2rem] bg-[var(--color-wine)] px-6 py-10 text-center text-white sm:px-10 lg:flex-row lg:text-left">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--color-champagne)]">Ready to plan?</p>
            <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">Find a date and pick a hall.</h2>
            <p className="mt-3 text-sm text-white/72">Start with availability so every other decision falls into place.</p>
          </div>
          <SiteButton href={ROUTES.SITE.SEARCH_AVAILABILITY()} variant="gold">
            Check availability
          </SiteButton>
        </div>
      </section>
    </main>
  );
}
