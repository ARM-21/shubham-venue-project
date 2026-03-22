import Hero from 'components/hero/Hero.jsx';
import FeaturedVenues from 'components/venues/FeaturedVenues.jsx';
import Menus from 'components/menu/landing-page/ExploreMenus.jsx';
import UpcomingEvents from 'components/events/UpcomingEvents.jsx';
import TrustBar from 'components/common/TrustBar.jsx';

const images = [
  { image: '/assets/business-images/placeholder1.webp', title: 'Welcome', branding: 'Shubham Venue', mini: 'Make it special' },
  { image: '/assets/business-images/placeholder1.webp', title: 'Spacious Hall', branding: 'Grand Hall', mini: 'Perfect for weddings' },
  { image: '/assets/business-images/placeholder1.jpg', title: 'Celebrate in style', branding: 'Royal Court', mini: 'Memorable moments' },
];

export default function Home() {
  return (
    <main className="flex flex-col gap-0 overflow-hidden">
      {/* Hero and TrustBar Section */}
      <section id="hero" className="relative flex flex-col">
        <Hero images={images} interval={4000} />
        
        {/* On desktop, TrustBar floats. On mobile, it sits below nicely. */}
        <div className="relative lg:absolute lg:-bottom-16 left-0 w-full z-20">
          <TrustBar />
        </div>
      </section>

      {/* Venues Section */}
      <section id="venues" className="bg-white">
        <div className="max-w-[1800px] mt-10 lg:mt-32 mx-auto px-4 lg:px-10">
          <FeaturedVenues />
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="bg-[#fdfaf6] py-10 lg:py-20">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-10">
          <UpcomingEvents />
        </div>
      </section>

      {/* Menus Section */}
      <section id="menus" className="bg-white py-10 lg:py-20">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-10">
          <Menus />
        </div>
      </section>
    </main>
  );
}
