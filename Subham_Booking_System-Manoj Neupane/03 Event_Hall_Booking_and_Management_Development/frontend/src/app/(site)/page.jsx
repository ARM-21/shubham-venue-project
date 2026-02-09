import Hero from '@/components/hero/Hero.jsx';
import FeaturedVenues from '@/components/venues/FeaturedVenues.jsx';
import Menus from '@/components/menu/landing-page/ExploreMenus.jsx';

const images = [
  { image: '/images/slide1.jpg', title: 'Welcome', branding: 'Shubham Venue', mini: 'Make it special' },
  { image: '/images/slide2.jpg', title: 'Spacious Hall', branding: 'Grand Hall', mini: 'Perfect for weddings' },
  { image: '/images/slide3.jpg', title: 'Celebrate in style', branding: 'Royal Court', mini: 'Memorable moments' },
];

export default function Home() {
  return (
    <main>
      <Hero images={images} interval={4000} />
      <FeaturedVenues />
      <Menus/>
    </main>
  );
}
