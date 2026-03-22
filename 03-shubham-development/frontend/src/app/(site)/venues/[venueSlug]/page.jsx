"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from 'lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Navigation, Sparkles, Check, Thermometer, Music, Zap, Users, Coffee, Truck } from 'lucide-react';
import { ROUTES } from 'config/routes';

// Extracted Sub-components
import { VenueHero } from './components/details/VenueHero';
import { VenueStats } from './components/details/VenueStats';
import { BookingWidget } from './components/details/BookingWidget';
import { MenuSection } from './components/details/MenuSection';
import { SimilarVenues } from './components/details/SimilarVenues';

export default function Venue() {
  const { venueSlug } = useParams();
  const [venueData, setVenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuPackages, setMenuPackages] = useState([]);
  const [menusLoading, setMenusLoading] = useState(false);
  const [similarVenues, setSimilarVenues] = useState([]);
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
  const currencyFormatter = new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 });
  const today = new Date().toISOString().split('T')[0];
  const images = (venueData?.images?.length) ? venueData.images : ['/assets/business-images/placeholder.jpg'];

  useEffect(() => {
    if (!venueSlug) return;
    async function fetchVenue() {
      try {
        const response = await axiosInstance.get(`${ROUTES.API.HALLS.BY_SLUG(encodeURIComponent(venueSlug))}`);
        setVenueData(response.data.hall);
      } catch (err) {
        setError('Failed to load venue data.');
      } finally {
        setLoading(false);
      }
    }
    fetchVenue();
  }, [venueSlug]);

  useEffect(() => {
    if (!venueData) return;
    async function fetchMenus() {
      setMenusLoading(true);
      try {
        const res = await axiosInstance.get(ROUTES.API.MENUS.ROOT);
        const payload = res.data?.data ?? res.data;
        let menus = Array.isArray(payload) ? payload : (payload.menus || []);
        const filtered = menus.filter(m => 
          m.venueSlug === venueSlug || (m.halls?.includes(venueData._id)) || (venueData.menus?.includes(m._id || m.slug))
        );
        setMenuPackages(filtered.length ? filtered : menus.slice(0, 3));
      } catch (err) { console.error('Error fetching menus', err); } finally { setMenusLoading(false); }
    }
    fetchMenus();
  }, [venueData, venueSlug]);

  useEffect(() => {
    if (!venueData?.location?.city) return;
    async function fetchSimilar() {
      try {
        const city = venueData.location.city;
        let list = [];
        if (date) {
          const serverSlot = shift === 'day' ? 'wholeday' : shift;
          const resp = await axiosInstance.get(ROUTES.API.HALLS.AVAILABILITY, { params: { date, slot: serverSlot, guests: guests || 1, city } });
          list = (resp.data?.halls ?? resp.data ?? []).filter(h => String(h._id) !== String(venueData._id) && h.available !== false).slice(0, 3);
        } else {
          const resp = await axiosInstance.get(ROUTES.API.HALLS.ROOT, { params: { city } });
          list = (resp.data?.halls ?? resp.data ?? []).filter(h => String(h._id) !== String(venueData._id) && h.isActive).slice(0, 3);
        }
        setSimilarVenues(list);
      } catch (err) { console.error('fetch similar venues', err); }
    }
    fetchSimilar();
  }, [venueData, date, shift, guests]);

  useEffect(() => {
    if (!venueData?._id) return;
    async function fetchOccupied() {
      try {
        const days = generateCalendarDays(displayMonth).filter(Boolean);
        const isoDays = days.map(dt => dt.toISOString().split('T')[0]);
        const results = await Promise.all(isoDays.map(async iso => {
          try {
            const res = await axiosInstance.post(ROUTES.API.HALLS.BY_ID_AVAILABILITY(venueData._id), { date: iso, slot: 'wholeday', guests: Number(guests) || 1 });
            return { date: iso, available: !!res.data?.available };
          } catch { return { date: iso, available: true }; }
        }));
        setOccupiedDates(new Set(results.filter(r => !r.available).map(r => r.date)));
      } catch (err) { console.error('Error fetching occupied dates', err); }
    }
    fetchOccupied();
  }, [displayMonth, venueData, guests]);

  const generateCalendarDays = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
  };

  const prevMonth = () => setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const submitBooking = (values) => {
    const serverSlot = values.slot === 'day' ? 'wholeday' : values.slot;
    const params = new URLSearchParams({ date: values.date, slot: serverSlot, guests: String(Number(values.guests)) });
    router.push(`${ROUTES.SITE.SEARCH_AVAILABILITY(venueSlug)}?${params.toString()}`);
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

  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg text-red-600 bg-red-50 p-6 rounded-2xl border border-red-100">{error}</div></div>;
  if (loading) return (
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
    <main className="min-h-screen bg-[#faf9f6]/50 relative selection:bg-[#C0A04C]/30">
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-[#C0A04C]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-[#3a1224]/5 blur-[120px] rounded-full" />
      </div>
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/80 to-transparent pointer-events-none z-0" />

      <VenueHero venueData={venueData} images={images} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 pb-32 relative z-10 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-24">
            <VenueStats venueData={venueData} diningText={diningText} />
            <section className="relative">
              <div className="flex flex-col gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-[1px] bg-[#C0A04C]" />
                    <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">The Place</span>
                  </div>
                  <h2 className="text-4xl lg:text-5xl font-display font-bold text-[#3a1224] leading-tight max-w-xl">Beautiful place for your special day.</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">
                  <div className="md:col-span-3">
                    <p className="text-lg text-[#3a1224]/70 leading-[1.8] font-light italic border-l-4 border-[#C0A04C]/20 pl-8">
                      {venueData.description || 'Welcome to a world of beauty and great service.'}
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-8">
                    <div className="bg-[#3a1224] p-10 rounded-none text-white shadow-[0_30px_60px_rgba(58,18,36,0.2)] relative overflow-hidden group">
                      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#C0A04C]/20 blur-[60px] rounded-full transition-transform duration-1000 group-hover:scale-150" />
                      <h4 className="text-[#C0A04C] font-display text-2xl mb-6 relative z-10">Best Features</h4>
                      <ul className="space-y-5 relative z-10">
                        {['AC / Heating', 'Big Sound System', 'Private Suites'].map((item, idx) => (
                          <li key={idx} className="flex items-center gap-4 text-sm font-medium tracking-wide">
                            <div className="w-2 h-2 rounded-none bg-[#C0A04C]" /> {item}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between">
                        <div className="text-[10px] font-black tracking-[0.3em] uppercase text-white/40">Opened</div>
                        <div className="text-2xl font-display font-bold text-[#C0A04C]">2026</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className="bg-white p-12 rounded-2xl shadow-[0_40px_100px_rgba(58,18,36,0.04)] border border-gray-50">
              <div className="mb-16 space-y-4">
                <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Inside</span>
                <h2 className="text-4xl font-display font-bold text-[#3a1224]">Main Features</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12">
                {(venueData.amenities?.length ? venueData.amenities : ['Air Conditioning','Stage Decor','Sound Systems','Power Backup','Changing Rooms','Valet Parking'])
                  .map((am, i) => {
                    const IconComponent = getAmenityIcon(am);
                    return (
                      <div key={i} className="flex items-start gap-6 group cursor-default">
                        <div className="relative w-14 h-14 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl flex items-center justify-center group-hover:bg-[#3a1224] transition-all duration-500">
                          <IconComponent className="w-6 h-6 text-[#3a1224] group-hover:text-[#C0A04C] transition-colors duration-500" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-md font-bold text-[#3a1224] group-hover:text-[#C0A04C] transition-colors">{am}</p>
                          <p className="text-[9px] text-[#3a1224]/40 font-bold uppercase tracking-widest">Included</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </section>
            <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-[#fdfaf6]/50 p-6 rounded-2xl border border-[#3a1224]/5">
              <div className="rounded-xl overflow-hidden shadow-2xl h-[400px] relative group border-4 border-white">
                <div className="w-full h-full flex items-center justify-center bg-gray-50 uppercase tracking-[0.3em] font-black text-[#3a1224]/10 text-4xl -rotate-12">Map View</div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                   <div className="px-6 py-3 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black text-[#3a1224] shadow-2xl border border-gray-100 flex items-center gap-2">
                     <Navigation className="w-3 h-3 text-[#C0A04C]" /> Get Directions
                   </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Location</span>
                  <h2 className="text-4xl font-display font-bold text-[#3a1224] leading-tight">Easy to reach</h2>
                  <p className="text-[#3a1224]/60 text-lg leading-relaxed font-light">Located in {venueData.location?.city || 'the city'}, our venue is easy to find for your guests.</p>
                </div>
                <div className="flex items-center gap-6 p-6 bg-white rounded-xl shadow-sm border border-gray-50 group cursor-pointer hover:border-[#C0A04C]/30 transition-all">
                  <div className="w-12 h-12 bg-[#3a1224] rounded-lg flex items-center justify-center text-[#C0A04C]"><MapPin className="w-5 h-5" /></div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-[#3a1224]/30 uppercase tracking-[0.2em]">Address</span>
                    <p className="text-sm font-bold text-[#3a1224]">{venueData.location?.address || 'View Location Details'}</p>
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
      </div>
    </main>
  );
}

       