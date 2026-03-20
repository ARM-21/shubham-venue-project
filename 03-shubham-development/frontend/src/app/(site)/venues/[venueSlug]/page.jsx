"use client";
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';
import { useParams, useRouter } from 'next/navigation';
import { Image as ImageIcon, MapPin, Share2, Heart, Users, Ruler, Coffee, Truck, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ArrowRight, HelpCircle, Star, Check, Thermometer, Music, Zap } from 'lucide-react';
import { ROUTES } from '@/config/routes';

export default function Venue({ params }) {
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

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid }, control } = useForm({ 
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
  const mainImage = images[activeIndex];

  // Fetch venue data
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

  // Fetch menus
  useEffect(() => {
    if (!venueData) return;
    async function fetchMenus() {
      setMenusLoading(true);
      try {
        const res = await axiosInstance.get(ROUTES.API.MENUS.ROOT);
        const payload = res.data?.data ?? res.data;
        let menus = Array.isArray(payload) ? payload : (payload.menus || []);
        const filtered = menus.filter(m => 
          m.venueSlug === venueSlug || 
          (m.halls?.includes(venueData._id)) ||
          (venueData.menus?.includes(m._id || m.slug))
        );
        setMenuPackages(filtered.length ? filtered : menus.slice(0, 3));
      } catch (err) {
        console.error('Error fetching menus', err);
      } finally {
        setMenusLoading(false);
      }
    }
    fetchMenus();
  }, [venueData, venueSlug]);

  // Fetch similar venues
  useEffect(() => {
    if (!venueData?.location?.city) return;
    async function fetchSimilar() {
      try {
        const city = venueData.location.city;
        let list = [];
        if (date) {
          const serverSlot = shift === 'day' ? 'wholeday' : shift;
          const resp = await axiosInstance.get(ROUTES.API.HALLS.AVAILABILITY, { 
            params: { date, slot: serverSlot, guests: guests || 1, city } 
          });
          list = (resp.data?.halls ?? resp.data ?? [])
            .filter(h => String(h._id) !== String(venueData._id) && h.available !== false)
            .slice(0, 3);
        } else {
          const resp = await axiosInstance.get(ROUTES.API.HALLS.ROOT, { params: { city } });
          list = (resp.data?.halls ?? resp.data ?? [])
            .filter(h => String(h._id) !== String(venueData._id) && h.isActive)
            .slice(0, 3);
        }
        setSimilarVenues(list);
      } catch (err) {
        console.error('fetch similar venues', err);
      }
    }
    fetchSimilar();
  }, [venueData, date, shift, guests]);

  // Fetch occupied dates
  useEffect(() => {
    if (!venueData?._id) return;
    async function fetchOccupied() {
      try {
        const days = generateCalendarDays(displayMonth).filter(Boolean);
        const isoDays = days.map(dt => dt.toISOString().split('T')[0]);
        const results = await Promise.all(isoDays.map(async iso => {
          try {
            const res = await axiosInstance.post(ROUTES.API.HALLS.BY_ID_AVAILABILITY(venueData._id), { 
              date: iso, slot: 'wholeday', guests: Number(guests) || 1 
            });
            return { date: iso, available: !!res.data?.available };
          } catch {
            return { date: iso, available: true };
          }
        }));
        setOccupiedDates(new Set(results.filter(r => !r.available).map(r => r.date)));
      } catch (err) {
        console.error('Error fetching occupied dates', err);
      }
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
    const params = new URLSearchParams({
      date: values.date,
      slot: serverSlot,
      guests: String(Number(values.guests))
    });
    router.push(`${ROUTES.SITE.SEARCH_AVAILABILITY(venueSlug)}?${params.toString()}`);
  };

  if (error) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg text-red-600">{error}</div></div>;
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg text-[#6B7280]">Loading...</div></div>;
  if (!venueData) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg text-[#6B7280]">Venue not found</div></div>;

  const diningText = (venueData.amenities || []).find(a => /buffet|dining|catering|restaurant|meal|kitchen/i.test(a)) || '—';
  const parkingText = (venueData.amenities || []).find(a => /park|valet/i.test(a)) || '—';

  const getAmenityIcon = (amenity) => {
    const s = amenity.toLowerCase();
    if (s.includes('ac') || s.includes('air')) return Thermometer;
    if (s.includes('stage') || s.includes('decor')) return Star;
    if (s.includes('audio') || s.includes('sound') || s.includes('av') || s.includes('music')) return Music;
    if (s.includes('generat') || s.includes('backup')) return Zap;
    if (s.includes('park') || s.includes('valet')) return Truck;
    if (s.includes('chang') || s.includes('room')) return Users;
    if (s.includes('coffee') || s.includes('dining')) return Coffee;
    return Check;
  };

  return (
    <main className="min-h-screen pb-16 bg-section-bg/30">
      {/* Hero Images */}
      <div className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3 h-[400px] md:h-[500px] mb-8">
            <div className="md:col-span-2 md:row-span-2 relative group overflow-hidden rounded-lg">
              <img alt={venueData.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={mainImage} />
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded text-sm flex items-center gap-1">
                <ImageIcon className="w-4 h-4" /> {images.length} Photos
              </div>
            </div>
            {images.slice(1, 4).map((img, i) => (
              <div key={i} className="relative group overflow-hidden rounded-lg cursor-pointer" onClick={() => setActiveIndex(i + 1)}>
                <img alt={`thumb-${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={img} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-gray-100 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-text-dark">{venueData.name}</h1>
                <span className={`bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-semibold uppercase tracking-wide`}>
                  {venueData.isActive ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-5 h-5 text-[var(--primary)]" />
                <span>{venueData.location?.address || 'Address not provided'}{venueData.location?.city ? `, ${venueData.location.city}` : ''}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600">
                <Share2 className="w-5 h-5" /> Share
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600">
                <Heart className="w-5 h-5" /> Save
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-section-bg rounded-xl p-6">
            <div className="p-3 flex flex-col items-center justify-center text-center">
              <Users className="w-7 h-7 text-gray-700 mb-2" />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">CAPACITY</p>
              <p className="font-bold text-text-dark">{venueData.capacity || '—'} Pax</p>
            </div>
            <div className="p-3 flex flex-col items-center justify-center text-center border-l border-gray-200">
              <Ruler className="w-7 h-7 text-gray-700 mb-2" />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">SIZE</p>
              <p className="font-bold text-text-dark">{venueData.size || '—'}</p>
            </div>
            <div className="p-3 flex flex-col items-center justify-center text-center border-l border-gray-200">
              <Coffee className="w-7 h-7 text-gray-700 mb-2" />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">DINING</p>
              <p className="font-bold text-text-dark">{diningText}</p>
            </div>
            <div className="p-3 flex flex-col items-center justify-center text-center border-l border-gray-200">
              <Truck className="w-7 h-7 text-gray-700 mb-2" />
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">PARKING</p>
              <p className="font-bold text-text-dark">{parkingText}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-display font-semibold mb-4 text-text-dark">About this Venue</h2>
            <div className="prose max-w-none text-gray-600 leading-relaxed">
              <p>{venueData.description || 'No description available for this venue.'}</p>
              {venueData.description && (
                <p className="mt-4">The hall is fully air-conditioned and includes a dedicated bridal suite and a separate dining area.</p>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-display font-semibold mb-6 text-text-dark">Amenities & Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
              {(venueData.amenities?.length ? venueData.amenities : ['Central AC','Stage Decoration','Audio/Visual System','Backup Generator','Changing Rooms','Valet Parking'])
                .map((am, i) => {
                  const IconComponent = getAmenityIcon(am);
                  return (
                    <div key={i} className="flex items-center gap-3 text-gray-700">
                      <IconComponent className="w-4 h-4 text-green-600" />
                      <span>{am}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Menu Packages */}
          <div className="border-t border-gray-100 pt-8">
            <h2 className="text-2xl font-semibold mb-6 text-text-dark">Menu Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {menusLoading ? (
                <div className="col-span-3 text-center text-gray-500">Loading menu packages...</div>
              ) : menuPackages.length ? (
                menuPackages.map((menu, idx) => {
                  const img = menu.image || menu.thumbnail || '/assets/business-images/placeholder.jpg';
                  const title = menu.title || menu.name || 'Menu';
                  const desc = (menu.description || menu.summary || '').slice(0, 80) + '...';
                  const priceVal = menu.pricePerPerson ?? menu.price ?? menu.pricePerHead ?? null;
                  const isPopular = !!menu.isPopular || !!menu.popular;
                  return (
                    <div key={menu._id || menu.slug || idx} 
                         onClick={() => router.push(ROUTES.SITE.MENU_DETAILS(menu.slug || menu._id || ''))} 
                         className={`bg-white border ${isPopular ? 'border-secondary/50 shadow-md hover:-translate-y-0.5' : 'border-gray-200 hover:shadow-lg'} rounded-xl p-5 cursor-pointer group overflow-hidden transition-all`}>
                      {isPopular && <div className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>}
                      <div className="h-36 rounded-xl bg-gray-100 mb-4 overflow-hidden">
                        <img alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src={img} />
                      </div>
                      <h3 className="font-semibold text-lg text-text-dark">{title}</h3>
                      <p className="text-xs text-gray-500 mb-3">{desc}</p>
                      <div className="text-[var(--primary)] font-bold text-lg">
                        {priceVal ? currencyFormatter.format(priceVal) : 'Contact'} <span className="text-xs text-gray-500">/ person</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center text-gray-500">No menu packages available.</div>
              )}
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h2 className="text-xl font-display font-semibold mb-6 text-text-dark">Guest Reviews</h2>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-sm">SK</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-text-dark text-sm">Sanjay K.</h4>
                    <div className="flex text-secondary text-xs mt-1">
                      {Array(5).fill().map((_, i) => <Star key={i} className="w-4 h-4" />)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">2 weeks ago</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">Amazing venue for our wedding. The decoration team did a fantastic job!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-gray-100">
              <div className="bg-[var(--maroon-primary)] p-6 text-center text-white">
                <h3 className="text-sm font-medium opacity-90 mb-1">Starting Price</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl font-display font-bold">
                    {venueData.currency || 'NPR'} {venueData.pricePerHour?.toLocaleString() || '—'}
                  </span>
                  <span className="text-xs opacity-80">/ shift</span>
                </div>
                <p className="text-[10px] mt-2 opacity-75 border-t border-white/20 pt-2 inline-block px-4">
                  * Decoration & Catering charges extra
                </p>
              </div>
              <div className="p-6">
                {/* Date Input */}
                <div className="mb-5">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select Date</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                      <CalendarIcon className="w-5 h-5" />
                    </span>
                    <input 
                      readOnly 
                      placeholder="mm/dd/yyyy" 
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm font-medium shadow-sm cursor-default" 
                      value={date ? new Date(date).toLocaleDateString() : ''} 
                    />
                    <input type="hidden" {...register('date', { required: 'Please select a date' })} />
                  </div>
                </div>

                {/* Shift Selection */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Select Shift</label>
                  <input type="hidden" {...register('slot', { required: 'Please select a shift' })} />
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'morning', label: 'Morning', time: '7 AM - 11 AM' },
                      { value: 'day', label: 'Day', time: '10 AM - 4 PM' },
                      { value: 'evening', label: 'Evening', time: '6 PM - 11 PM' }
                    ].map(({ value, label, time }) => (
                      <button 
                        key={value}
                        className={`border py-2 px-1 rounded-lg text-center ${shift === value ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] border-2' : 'border-gray-200 text-gray-500'}`}
                        onClick={() => setValue('slot', value, { shouldValidate: true, shouldDirty: true })}
                      >
                        <div className="font-bold text-sm">{label}</div>
                        <div className="text-[10px] font-medium opacity-80">{time}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Guests */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Number of Guests</label>
                  <input
                    type="number"
                    {...register('guests', { 
                      required: 'Number of guests is required', 
                      min: { value: 1, message: 'At least 1 guest' }, 
                      max: { value: venueData?.capacity || 10000, message: `Max ${venueData?.capacity || 10000} guests` } 
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#502538] focus:ring-2 focus:ring-[#502538]/20 transition-all duration-300 text-sm"
                  />
                  {errors.guests && <p className="text-xs text-red-600 mt-1 font-medium">{errors.guests.message}</p>}
                </div>

                {/* Calendar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-text-dark">
                      {displayMonth.toLocaleString('default', { month: 'long' })} {displayMonth.getFullYear()}
                    </span>
                    <div className="flex gap-1">
                      <button onClick={prevMonth} className="text-gray-400 hover:text-[var(--maroon-primary)]">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={nextMonth} className="text-gray-400 hover:text-[var(--maroon-primary)]">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] mb-1 text-gray-400 font-medium">
                    <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {generateCalendarDays(displayMonth).map((dt, idx) => {
                      if (!dt) return <span key={idx} className="p-1.5 text-gray-300" />;
                      const iso = dt.toISOString().split('T')[0];
                      const isSelected = date === iso;
                      const isBooked = occupiedDates.has(iso);
                      const isPast = iso <= today;

                      if (isPast) {
                        return <button key={idx} disabled className="p-1.5 text-gray-300 bg-white rounded cursor-not-allowed">{dt.getDate()}</button>;
                      }
                      if (isBooked) {
                        return <button key={idx} className="p-1.5 text-white bg-red-400 rounded opacity-95 cursor-not-allowed">{dt.getDate()}</button>;
                      }
                      const isToday = iso === today;
                      return (
                        <button
                          key={idx}
                          onClick={() => setValue('date', iso, { shouldValidate: true, shouldDirty: true })}
                          className={`p-1.5 rounded ${isSelected ? 'font-bold text-white bg-green-400 shadow-sm' : isToday ? 'font-semibold text-[var(--primary)]' : 'text-gray-700 hover:bg-gray-100'}`}
                        >
                          {dt.getDate()}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-3 justify-center text-[10px] text-gray-500 font-medium">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400" /> Available</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Booked</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {errors.date && <div className="text-sm text-red-600 mb-2">{errors.date.message}</div>}
                  {errors.slot && <div className="text-sm text-red-600 mb-2">{errors.slot.message}</div>}
                  <button onClick={handleSubmit(submitBooking)} className="w-full bg-[var(--maroon-primary)] hover:bg-[var(--maroon-hover)] text-white shadow-lg font-bold py-3.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2">
                    Book Now <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3.5 px-4 rounded-lg transition-colors">
                    Contact Host
                  </button>
                </div>
              </div>
            </div>

            {/* Help Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-blue-900">Need help booking?</h4>
                <p className="text-xs text-blue-700 mt-1">Call <span className="font-semibold">+977 01-442233</span> for assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Venues */}
      <div className="bg-section-bg py-16 border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display font-bold text-text-dark">Other Available Halls</h2>
            <div className="w-16 h-1 bg-[var(--primary)] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarVenues.length ? similarVenues.map(v => (
              <div key={v._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="h-56 overflow-hidden relative">
                  <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                       src={v.images?.[0] || '/assets/business-images/placeholder.jpg'} 
                       alt={v.name} />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-3 py-1 rounded-full shadow-sm text-gray-800">
                    Capacity: {v.capacity || '—'}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-text-dark text-xl mb-1">{v.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {(v.description || '').slice(0, 80) + '...'}
                  </p>
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                    <span className="text-text-dark font-bold text-lg">
                      {v.currency || 'NPR'} {v.pricePerHour?.toLocaleString() || '—'}
                    </span>
                    <button onClick={() => router.push(ROUTES.SITE.VENUES(v.slug))} 
                            className="text-xs font-bold text-gray-500 hover:text-[var(--primary)] uppercase tracking-wider">
                      View Detail
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center text-gray-500">No other halls available.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
