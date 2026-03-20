"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from 'lib/axios';
import Image from 'next/image';
import { ROUTES } from 'config/routes';
import { Users, Ruler, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function VenuesPage() {
  const [halls, setHalls] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('price-desc');
  const [filters, setFilters] = useState({
    date: '',
    timeSlot: '',
    capacity: 'Any Capacity',
    price: 500000,
  });
  const priceDebounce = useRef(null);
  
  const router = useRouter();
  const today = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  useEffect(() => {
    async function fetchHalls() {
      try {
        setLoading(true);
        const response = await axiosInstance.get(ROUTES.API.HALLS.ROOT);
        const list = response.data.halls || response.data || [];
        setHalls(list);
        setFilteredHalls(list);
        console.log('Venues:', response.data);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHalls();
  }, []);

  const handleViewDetails = (slug) => {
    router.push(ROUTES.SITE.VENUES(slug));
  };

  const handleBookNow = (slug) => {
    const params = new URLSearchParams();
    if (filters.date) params.set('date', filters.date);
    if (filters.timeSlot) params.set('slot', filters.timeSlot);
    const url = `${ROUTES.SITE.SEARCH_AVAILABILITY(slug)}${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(url);
  };

  function parseCapacityToGuests(capStr) {
    if (!capStr || capStr === 'Any Capacity') return null;
    const m = capStr.match(/(\d+)/);
    if (!m) return null;
    return Number(m[0]);
  }

  function mapClientSlotToServer(slot) {
    if (!slot) return null;
    if (slot === 'full') return 'wholeday';
    if (slot === 'morning') return 'morning';
    // map afternoon/night to evening slot for server compatibility
    return 'evening';
  }

  async function applyFilters() {
    try {
      setLoading(true);

      // capacity -> guests param for availability API
      const guestsFromCap = parseCapacityToGuests(filters.capacity) || 1;

      let list = halls.slice();

      // If date + timeslot provided, call availability endpoint to get only available halls
      if (filters.date && filters.timeSlot) {
        const serverSlot = mapClientSlotToServer(filters.timeSlot);
        try {
          const resp = await axiosInstance.get(ROUTES.API.HALLS.AVAILABILITY, {
            params: { date: filters.date, slot: serverSlot, guests: guestsFromCap },
          });
          // resp.data may be { halls: [...] } or array
          const returned = resp.data?.halls ?? resp.data ?? [];
          // filter to only available ones if API returns available flag
          list = returned.filter(h => typeof h.available === 'undefined' ? true : Boolean(h.available));
        } catch (err) {
          console.warn('Availability API error, falling back to client-side filter', err);
          // fallback: keep original list
          list = halls.slice();
        }
      }

      // capacity filter (client-side refinement)
      if (filters.capacity && filters.capacity !== 'Any Capacity') {
        const min = parseCapacityToGuests(filters.capacity) || 0;
        if (filters.capacity.includes('-')) {
          const parts = filters.capacity.match(/(\d+)\s*-\s*(\d+)/);
          if (parts) {
            const lo = Number(parts[1]);
            const hi = Number(parts[2]);
            list = list.filter(h => h.capacity >= lo && h.capacity <= hi);
          }
        } else if (filters.capacity.includes('+')) {
          list = list.filter(h => h.capacity >= min);
        } else {
          list = list.filter(h => h.capacity >= min);
        }
      }

      // price filter: treat filters.price as max price
      if (typeof filters.price === 'number') {
        list = list.filter(h => (h.pricePerHour ?? 0) <= filters.price);
      }


      // sort
      if (sortBy === 'price-asc') {
        list.sort((a,b) => (a.pricePerHour||0) - (b.pricePerHour||0));
      } else if (sortBy === 'price-desc') {
        list.sort((a,b) => (b.pricePerHour||0) - (a.pricePerHour||0));
      } else if (sortBy === 'capacity-desc') {
        list.sort((a,b) => (b.capacity||0) - (a.capacity||0));
      }

      setFilteredHalls(list);
    } finally {
      setLoading(false);
    }
  }

  // Apply sorting immediately when sortBy changes
  useEffect(() => {
    // if user changes sort, reapply filters/sort
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading venues...</div>
      </div>
    );
  }

  if (halls.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600 mb-4">No venues available</div>
        <button
          onClick={() => router.push(ROUTES.HOME)}
          className="bg-[var(--maroon-primary)] text-white px-6 py-2 rounded-lg hover:bg-[var(--maroon-hover)] transition"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-dark-gray font-body">
      {/* Hero */}
      <section className="relative bg-[var(--soft-cream)] py-16">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2098&auto=format&fit=crop')` }} />
        <div className="absolute inset-0 bg-white/70" />
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-[var(--maroon-primary)] mb-4">Find Your Perfect Venue</h1>
          <p className="text-dark-gray max-w-2xl mx-auto font-medium">Explore our diverse collection of halls suitable for weddings, corporate events, and grand celebrations.</p>
        </div>
      </section>

      <main className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <aside className="w-full lg:w-1/4">
          <div className="bg-[var(--soft-cream)] p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-xl font-bold text-dark-gray">Filters</h3>
              <button className="text-xs text-[var(--maroon-primary)] hover:text-red-700 underline" onClick={() => { setFilters({date:'', timeSlot:'', capacity:'Any Capacity', price:500000, amenities:[]}); setFilteredHalls(halls); setSortBy('recommended'); }}>Reset All</button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-gray mb-2">Event Date</label>
              <div className="relative">
                <input value={filters.date} onChange={(e)=>setFilters(f=>({...f, date: e.target.value}))} className="w-full bg-white border border-gray-300 text-dark-gray rounded px-3 py-2 focus:ring-[var(--maroon-primary)] focus:border-[var(--maroon-primary)]" type="date" min={today} />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-gray mb-2">Time Slot</label>
              <select value={filters.timeSlot} onChange={(e)=>setFilters(f=>({...f, timeSlot: e.target.value}))} className="w-full bg-white border border-gray-300 text-dark-gray rounded px-3 py-2">
                <option value="">Any Slot</option>
                <option value="morning">Morning (08:00 - 12:00)</option>
                <option value="afternoon">Afternoon (12:00 - 16:00)</option>
                <option value="evening">Evening (16:00 - 20:00)</option>
                <option value="night">Night (20:00 - 23:00)</option>
                <option value="full">Full Day</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-dark-gray mb-2">Guest Capacity</label>
              <select value={filters.capacity} onChange={(e)=>setFilters(f=>({...f, capacity: e.target.value}))} className="w-full bg-white border border-gray-300 text-dark-gray rounded px-3 py-2 focus:ring-[var(--maroon-primary)] focus:border-[var(--maroon-primary)]">
                <option>Any Capacity</option>
                <option>50 - 100 Guests</option>
                <option>100 - 300 Guests</option>
                <option>300 - 500 Guests</option>
                <option>500+ Guests</option>
              </select>
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2 items-center">
                <label className="block text-sm font-medium text-dark-gray">Price Range</label>
                <span className="text-xs text-gray-500">Up to <span className="font-semibold">NPR {filters.price.toLocaleString()}</span></span>
              </div>
              <input
                value={filters.price}
                onChange={(e)=>{
                  const val = Number(e.target.value || 0);
                  setFilters(f=>({...f, price: val}));
                  if (priceDebounce.current) clearTimeout(priceDebounce.current);
                  priceDebounce.current = setTimeout(()=> applyFilters(), 300);
                }}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[var(--maroon-primary)]"
                max="500000" min="10000" type="range" />
            </div>

            <button onClick={applyFilters} className="w-full bg-[var(--maroon-primary)] hover:bg-[#5e1d30] text-white font-bold py-3 px-4 rounded transition-colors shadow-md">Apply Filters</button>
          </div>
        </aside>

        {/* Grid */}
        <section className="w-full lg:w-3/4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-2 sm:mb-0">Showing <span className="font-bold text-dark-gray">{filteredHalls.length}</span> available halls</p>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="bg-transparent border-none text-sm font-semibold text-dark-gray focus:ring-0 cursor-pointer">
                <option value="price-asc" className="bg-white">Price: Low to High</option>
                <option value="price-desc" className="bg-white">Price: High to Low</option>
                <option value="capacity-desc" className="bg-white">Capacity: High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHalls.map((hall) => {
              const firstImage = (hall.images && hall.images.length && hall.images[0]) ? hall.images[0] : '/assets/business-images/placeholder.jpg';
              return (
                <div key={hall._id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100 flex flex-col h-full">
                  <div className="relative h-48 overflow-hidden">
                    <Image alt={hall.name} src={firstImage} fill className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 text-white">
                      <h3 className="font-display font-bold text-lg text-shadow-sm">{hall.name}</h3>
                    </div>
                  </div>

                  <div className="p-4 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex items-center text-gray-500 text-xs mb-3 space-x-3">
                        <span className="flex items-center"><Users size={14} className="mr-1 text-gray-500" /> {hall.capacity} Capacity</span>
                        <span className="flex items-center"><Ruler size={14} className="mr-1 text-gray-500" /> {hall.area || '—'} sq ft</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{hall.description}</p>
                    </div>

                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-xs text-gray-500">Starting from</p>
                        <p className="font-bold text-[var(--maroon-primary)]">{hall.currency} {hall.pricePerHour?.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleViewDetails(hall.slug)} className="text-xs font-bold uppercase text-[var(--maroon-primary)] hover:text-red-700 transition-colors flex items-center">View / Book <ArrowRight size={16} className="ml-1" /></button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          
        </section>
      </main>
    </div>
  );
}