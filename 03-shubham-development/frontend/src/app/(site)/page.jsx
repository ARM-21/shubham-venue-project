import Hero from 'components/hero/Hero.jsx';
import FeaturedVenues from 'components/venues/FeaturedVenues.jsx';
import Menus from 'components/menu/landing-page/ExploreMenus.jsx';
import UpcomingEvents from 'components/events/UpcomingEvents.jsx';
import TrustBar from 'components/common/TrustBar.jsx';

const images = [
  { image: '/assets/business-images/placeholder1.webp', title: 'Welcome', branding: 'Shubham Venue', mini: 'Make it special' },
  { image: '/assets/business-images/placeholder1.webp', title: 'Spacious Hall', branding: 'Grand Hall', mini: 'Perfect for weddings' },
  { image: '/assets/business-images/placeholder1.webp', title: 'Celebrate in style', branding: 'Royal Court', mini: 'Memorable moments' },
];

export default function Home() {
  return (
    <main className="flex flex-col overflow-hidden">
      {/* Hero and TrustBar Section */}
      <section id="hero" className="relative flex flex-col">
        <Hero images={images} interval={4000} />
        
        {/* On desktop, TrustBar floats. On mobile, it sits below nicely. */}
        <div className="relative lg:absolute lg:-bottom-16 left-0 w-full z-20">
          <TrustBar />
        </div>
      </section>

      {/* Venues Section */}
      <section id="venues" className="bg-[#fdfaf6] pt-14 pb-12 sm:pt-16 sm:pb-14 lg:pt-32 lg:pb-20">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-10">
          <div className="mb-10 sm:mb-12 lg:mb-14">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-1.5 bg-[#C0A04C] rounded-full"></div>
              <span className="text-xs font-black text-[#C0A04C] tracking-wider uppercase">Venue Selection</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[#3a1224]">Featured Venues</h2>
            <p className="text-sm sm:text-base text-[#3a1224]/60 mt-3 font-medium max-w-2xl">Discover our curated collection of elegant halls and spaces designed for every occasion and gathering.</p>
          </div>
          <FeaturedVenues />
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="bg-[#fdfaf6] pt-8 pb-12 sm:pt-12 sm:pb-12 lg:pt-12 lg:pb-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-10">
          <div className="mb-10 sm:mb-12 lg:mb-14">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-1.5 bg-[#C0A04C] rounded-full"></div>
              <span className="text-xs font-black text-[#C0A04C] tracking-wider uppercase">What's Happening</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[#3a1224]">Events & Celebrations</h2>
            <p className="text-sm sm:text-base text-[#3a1224]/60 mt-3 font-medium max-w-2xl">Explore upcoming events and celebrations hosted at our venues. Secure your reservations and join memorable experiences.</p>
          </div>
          <UpcomingEvents />
        </div>
      </section>

      {/* Menus Section */}
      <section id="menus" className="bg-[#fdfaf6] pt-8 pb-12 sm:pt-12 sm:pb-12 lg:pt-12 lg:pb-12">
        <div className="max-w-[1800px] mx-auto px-4 lg:px-10">
          <div className="mb-10 sm:mb-12 lg:mb-14">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-1.5 bg-[#80704a] rounded-none"></div>
              <span className="text-xs font-black text-[#C0A04C] tracking-wider uppercase">Menu Packages</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[#3a1224]">Curated Menus</h2>
            <p className="text-sm sm:text-base text-[#3a1224]/60 mt-3 font-medium max-w-2xl">Select from our professionally curated menu packages. Each designed to exceed expectations for your event.</p>
          </div>
          <Menus />
        </div>
      </section>
    </main>
  );
}
