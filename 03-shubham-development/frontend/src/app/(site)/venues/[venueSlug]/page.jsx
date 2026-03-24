"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Navigation, Sparkles, Check, Thermometer, Music, Zap, Users, Coffee, Truck } from 'lucide-react';
import { ROUTES } from 'config/routes';
import axiosInstance from 'lib/axios';
import { useQueryHallDetailPublic } from '@queries/customer/hall-detail-public';
import { useQueryMenusPublic } from '@queries/customer/menus-public';
import { useQueryAvailability } from '@queries/customer/availability';

// Extracted Sub-components
import { VenueHero } from './components/details/VenueHero';
import { VenueStats } from './components/details/VenueStats';
import { BookingWidget } from './components/details/BookingWidget';
import { MenuSection } from './components/details/MenuSection';
import { SimilarVenues } from './components/details/SimilarVenues';
import { LocationMapWrapper } from './components/details/LocationMapWrapper';
import { ReviewStats } from './components/reviews/ReviewStats';
import { ReviewForm } from './components/reviews/ReviewForm';
import { ReviewList } from './components/reviews/ReviewList';

export default function Venue() {
  const { venueSlug } = useParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayMonth, setDisplayMonth] = useState(new Date());
  const [occupiedDates, setOccupiedDates] = useState(new Set());

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ 
    defaultValues: { date: '', slot: 'morning', guests: 50 }, 
    mode: 'onChange' 
  });

  const date = watch('date');
  const shift = watch('slot');
  const guests = watch('guests');

  const router = useRouter();
  const searchParams = useSearchParams();
  const currencyFormatter = new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 });
  const today = new Date().toISOString().split('T')[0];

  // Fetch venue detail
  const { data: venueDetail = {}, isLoading, error } = useQueryHallDetailPublic(venueSlug);
  const venueData = venueDetail?.hall || null;
  const images = useMemo(() => (venueData?.images?.length ? venueData.images : ['/assets/business-images/placeholder.jpg']), [venueData]);

  // Fetch menus
  const { data: menusData = [] } = useQueryMenusPublic();
  const menuPackages = useMemo(() => {
    if (!venueData) return [];
    let menus = Array.isArray(menusData) ? menusData : [];
    const filtered = menus.filter(m => 
      m.venueSlug === venueSlug || (m.halls?.includes(venueData._id)) || (venueData.menus?.includes(m._id || m.slug))
    );
    return filtered.length ? filtered : menus.slice(0, 3);
  }, [menusData, venueSlug, venueData]);

  // Fetch availability for similar venues
  const { data: availabilityData = {} } = useQueryAvailability({
    date,
    slot: shift === 'day' ? 'wholeday' : shift,
    guests: guests || 1,
    city: venueData?.location?.city,
  }, {
    enabled: !!date && !!venueData?.location?.city,
  });

  const similarVenues = useMemo(() => {
    if (!venueData) return [];
    let list = [];
    if (availabilityData?.halls) {
      list = availabilityData.halls
        .filter(h => String(h._id) !== String(venueData._id) && h.available !== false)
        .slice(0, 3);
    } else if (venueData?.location?.city) {
      // Fallback: use all venues from same city (would require another query)
      list = [];
    }
    return list;
  }, [availabilityData, venueData]);

  // Load search params from URL if coming from search-availability page
  useEffect(() => {
    if (!searchParams) return;
    const qDate = searchParams.get('date');
    const qSlot = searchParams.get('slot');
    const qGuests = searchParams.get('guests');

    if (qDate) setValue('date', qDate);
    if (qGuests) setValue('guests', Number(qGuests));
    if (qSlot) {
      const mapped = qSlot === 'day' ? 'wholeday' : qSlot;
      setValue('slot', mapped);
    }
  }, [searchParams, setValue]);

  const generateCalendarDays = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = isCurrentMonth ? today.getDate() : 1;
    
    const cells = [];
    if (!isCurrentMonth) {
      // For future months, add empty cells for alignment
      for (let i = 0; i < firstDay; i++) cells.push(null);
    }
    for (let d = startDay; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  };

  const prevMonth = () => setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const submitBooking = (values) => {
    const serverSlot = values.slot === 'day' ? 'wholeday' : values.slot;
    const params = new URLSearchParams({ date: values.date, slot: serverSlot, guests: String(Number(values.guests)) });
    router.push(`${ROUTES.SITE.VENUE_BOOK(venueSlug)}?${params.toString()}`);
  };

  const getAmenityIcon = (amenity) => {
    const s = amenity.toLowerCase();
    if (s.includes('ac') || s.includes('air')) return Thermometer;
    if (s.includes('stage') || s.includes('decor')) return Sparkles;
    if (s.includes('audio') || s.includes('sound') || s.includes('music')) return Music;
    if (s.includes('generat') || s.includes('backup')) return Zap;
    if (s.includes('park') || s.includes('valet')) return Truck;
    if (s.includes('chang') || s.includes('room')) return Users;
    if (s.includes('coffee') || s.includes('dining')) return Coffee;
    return Check;
  };

  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg text-red-600 bg-red-50 p-6 rounded-2xl border border-red-100">Failed to load venue</div></div>;
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#3a1224]">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-[#C0A04C]/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-[#C0A04C] rounded-full border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-8 text-[#C0A04C] font-display text-xl tracking-widest animate-pulse">SHUBHAM VENUE</p>
    </div>
  );
  if (!venueData) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg text-[#6B7280]">Venue not found</div></div>;

  const diningText = (venueData.amenities || []).find(a => /buffet|dining|catering|restaurant|meal|kitchen/i.test(a)) || 'Fine Dining';

  return (
    <main className="min-h-screen bg-[#faf9f6]/50 relative selection:bg-[#C0A04C]/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-[#C0A04C]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-[#3a1224]/5 blur-[120px] rounded-full" />
      </div>
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/70 to-transparent pointer-events-none z-0" />

      <VenueHero venueData={venueData} images={images} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />

      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pb-8 lg:pb-12 relative z-10 pt-8 lg:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12">
          <div className="lg:col-span-8 space-y-8 lg:space-y-12">
            <VenueStats venueData={venueData} diningText={diningText} />
            <section className="relative">
              <div className="flex flex-col gap-6 lg:gap-10 xl:gap-12">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                    <div className="w-8 sm:w-12 h-[1px] bg-[#C0A04C]" />
                    <span className="text-[10px] sm:text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.3em] sm:tracking-[0.4em]">About This Space</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-[#3a1224] leading-tight max-w-2xl">Exceptional Venue for Your Celebrations</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 lg:gap-12 items-start">
                  <div>
                    <p className="text-sm sm:text-lg text-[#3a1224]/70 leading-[1.8] font-light border-l-4 border-[#C0A04C]/20 pl-4 sm:pl-8">
                      {venueData.description || 'Welcome to a world of beauty and great service. Experience premium hospitality with world-class facilities.'}
                    </p>
                  </div>
                  <div>
                    <div className="bg-white p-4 sm:p-8 rounded-2xl border border-gray-100 shadow-[0_20px_50px_rgba(58,18,36,0.05)] hover:shadow-[0_30px_60px_rgba(58,18,36,0.1)] transition-all duration-500">
                      <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                        <div className="w-6 sm:w-8 h-[1px] bg-[#C0A04C]" />
                        <span className="text-[9px] sm:text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.2em] sm:tracking-[0.3em]">Highlights</span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-display font-bold text-[#3a1224] mb-4 sm:mb-6">Key Features</h4>
                      <ul className="space-y-3 sm:space-y-4">
                        {['AC / Climate Control', 'Premium Sound System', 'Private Suites'].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-[#3a1224] hover:text-[#C0A04C] transition-colors">
                            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-[#C0A04C] flex-shrink-0" /> <span className="break-words">{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#3a1224]/5 flex items-center justify-between">
                        <div className="text-[8px] sm:text-[10px] font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[#3a1224]/40">Since</div>
                        <div className="text-xl sm:text-2xl font-display font-bold text-[#C0A04C]">2026</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="bg-gradient-to-br from-white to-[#fdfaf6] p-8 lg:p-12 xl:p-16 rounded-[2.5rem] shadow-[0_20px_60px_rgba(58,18,36,0.08)] border border-white/50">
              <div className="mb-12 lg:mb-16 xl:mb-20 space-y-4 lg:space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-[1px] bg-[#C0A04C]" />
                  <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Amenities</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#3a1224] leading-tight">Premium Amenities & Facilities</h2>
                <p className="text-sm sm:text-lg text-[#3a1224]/60 font-light max-w-2xl">Comprehensive facilities designed to ensure your event is perfect</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-10">
                {(venueData.amenities?.length ? venueData.amenities : ['Air Conditioning','Stage Decor','Sound Systems','Power Backup','Changing Rooms','Valet Parking'])
                  .map((am, i) => {
                    const IconComponent = getAmenityIcon(am);
                    return (
                      <div key={i} className="group p-4 sm:p-6 lg:p-7 bg-white rounded-2xl border border-gray-200 shadow-[0_10px_30px_rgba(58,18,36,0.04)] hover:shadow-[0_20px_50px_rgba(58,18,36,0.12)] hover:border-[#C0A04C]/30 transition-all duration-500 cursor-default">
                        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                          <div className="relative w-11 sm:w-14 h-11 sm:h-14 bg-gradient-to-br from-[#C0A04C]/10 to-[#3a1224]/5 border border-[#C0A04C]/20 rounded-xl flex items-center justify-center group-hover:from-[#C0A04C]/20 group-hover:to-[#3a1224]/10 transition-all duration-500 flex-shrink-0">
                            <IconComponent className="w-5 sm:w-6 h-5 sm:h-6 text-[#3a1224] group-hover:text-[#C0A04C] transition-colors duration-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm sm:text-base font-bold text-[#3a1224] group-hover:text-[#C0A04C] transition-colors truncate">{am}</p>
                            <p className="text-[8px] sm:text-[10px] text-[#3a1224]/40 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mt-1">Included</p>
                          </div>
                        </div>
                        <div className="w-full h-1 bg-gradient-to-r from-[#C0A04C] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-full" />
                      </div>
                    );
                  })}
              </div>
            </section>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#C0A04C]/20 to-[#3a1224]/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
                <div className="relative rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(58,18,36,0.15)] h-[300px] sm:h-[450px] border-4 border-white bg-white">
                  <LocationMapWrapper venueData={venueData} />
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                    <a 
                      href={venueData?.location?.address ? `https://www.google.com/maps/search/${encodeURIComponent(venueData.location.address)}` : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-6 py-3 bg-white/95 backdrop-blur-md rounded-lg text-[11px] font-black text-[#3a1224] shadow-2xl border border-gray-100 flex items-center gap-2 hover:shadow-[0_10px_30px_rgba(196,160,76,0.3)] transition-all hover:border-[#C0A04C]/50 cursor-pointer group/btn"
                    >
                      <Navigation className="w-4 h-4 text-[#C0A04C]" /> 
                      <span>Get Directions</span>
                    </a>
                  </div>
                </div>
              </div>
              <div className="space-y-8 lg:space-y-10">
                <div className="space-y-4 lg:space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-[1px] bg-[#C0A04C]" />
                    <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Location</span>
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-[#3a1224] leading-tight mb-4">Easy to Reach</h2>
                    <p className="text-lg text-[#3a1224]/60 leading-relaxed font-light">Conveniently located in {venueData.location?.city || 'the city'}, our premium venue is easily accessible for all your guests with excellent connectivity.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 lg:gap-8 p-4 sm:p-7 lg:p-8 bg-white rounded-2xl shadow-[0_10px_30px_rgba(58,18,36,0.06)] border border-gray-100 hover:shadow-[0_20px_50px_rgba(58,18,36,0.12)] hover:border-[#C0A04C]/30 group transition-all duration-500 cursor-pointer">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#3a1224] to-[#3a1224]/80 rounded-xl flex items-center justify-center text-[#C0A04C] group-hover:shadow-lg transition-all duration-500">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.25em]">Full Address</span>
                    <p className="text-base font-bold text-[#3a1224] group-hover:text-[#C0A04C] transition-colors">{venueData.location?.address || 'View Location Details'}</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <div className="lg:col-span-4">
            <BookingWidget 
              venueData={venueData} currencyFormatter={currencyFormatter} displayMonth={displayMonth} prevMonth={prevMonth} nextMonth={nextMonth}
              generateCalendarDays={generateCalendarDays} today={today} occupiedDates={occupiedDates} date={date} shift={shift} guests={guests}
              setValue={setValue} register={register} handleSubmit={handleSubmit} submitBooking={submitBooking}
            />
          </div>
        </div>
        <MenuSection menusLoading={menusLoading} menuPackages={menuPackages} currencyFormatter={currencyFormatter} />
        <SimilarVenues similarVenues={similarVenues} />
        
        {/* Reviews Section */}
        <section className="space-y-12 mt-20 lg:mt-28">
          <ReviewStats hallId={venueData._id} />
          <ReviewForm hallId={venueData._id} onReviewSubmitted={() => window.location.reload()} />
          <ReviewList hallId={venueData._id} />
        </section>
      </div>
    </main>
  );
}

       