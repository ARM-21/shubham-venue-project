"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from 'lib/axios';
import Image from 'next/image';
import { ROUTES } from 'config/routes';
import { 
  Users, 
  Ruler, 
  ArrowRight, 
  Search, 
  MapPin, 
  Settings2, 
  Calendar,
  Clock,
  Circle
} from 'lucide-react';

export default function VenuesPage() {
  const [halls, setHalls] = useState([]);
  const [filteredHalls, setFilteredHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('price-desc');
  const [filters, setFilters] = useState({
    date: '',
    timeSlot: '',
    capacity: 'Any Capacity',
    price: 500000,
  });
  
  const router = useRouter();
  const priceDebounce = useRef(null);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    async function fetchHalls() {
      try {
        setLoading(true);
        const response = await axiosInstance.get(ROUTES.API.HALLS.ROOT);
        const list = response.data.halls || response.data || [];
        setHalls(list);
        setFilteredHalls(list);
      } catch (error) {
        console.error('Error fetching venues:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHalls();
  }, []);

  function parseCapacityToGuests(capStr) {
    if (!capStr || capStr === 'Any Capacity') return null;
    const m = capStr.match(/(\d+)/);
    return m ? Number(m[0]) : null;
  }

  function mapClientSlotToServer(slot) {
    if (!slot) return null;
    if (slot === 'full') return 'wholeday';
    if (slot === 'morning') return 'morning';
    return 'evening';
  }

  const applyFilters = async () => {
    setLoading(true);
    try {
      const guestsFromCap = parseCapacityToGuests(filters.capacity) || 1;
      let list = [...halls];

      if (filters.date && filters.timeSlot) {
        const serverSlot = mapClientSlotToServer(filters.timeSlot);
        try {
          const resp = await axiosInstance.get(ROUTES.API.HALLS.AVAILABILITY, {
            params: { date: filters.date, slot: serverSlot, guests: guestsFromCap },
          });
          const returned = resp.data?.halls ?? resp.data ?? [];
          list = returned.filter(h => h.available !== false);
        } catch (err) {
          console.warn('Availability API error', err);
        }
      }

      // Capacity filter
      if (filters.capacity !== 'Any Capacity') {
        const min = parseCapacityToGuests(filters.capacity) || 0;
        if (filters.capacity.includes('-')) {
          const parts = filters.capacity.match(/(\d+)\s*-\s*(\d+)/);
          if (parts) {
            const lo = Number(parts[1]), hi = Number(parts[2]);
            list = list.filter(h => h.capacity >= lo && h.capacity <= hi);
          }
        } else {
          list = list.filter(h => h.capacity >= min);
        }
      }

      // Price filter
      list = list.filter(h => (h.pricePerHour ?? 0) <= filters.price);

      // Sorting
      list.sort((a,b) => {
        if (sortBy === 'price-asc') return (a.pricePerHour||0) - (b.pricePerHour||0);
        if (sortBy === 'price-desc') return (b.pricePerHour||0) - (a.pricePerHour||0);
        if (sortBy === 'capacity-desc') return (b.capacity||0) - (a.capacity||0);
        return 0;
      });

      setFilteredHalls(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (halls.length > 0) applyFilters();
  }, [sortBy, filters.date, filters.timeSlot, filters.capacity, halls]);

  if (loading && halls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#3a1224]">
        <div className="w-12 h-12 border-4 border-[#C0A04C] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#C0A04C] font-black text-[10px] uppercase tracking-[0.4em]">Searching Collection</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Header Section */}
      <section className="bg-[#3a1224] pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[#C0A04C]" />
            <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">The Collection</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none mb-12">
            Signature <span className="text-[#C0A04C] italic serif">spaces</span>
          </h1>

          {/* Search/Filter Bar - Modern Profile Style */}
          <div className="bg-white p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center px-6 gap-4 border-b md:border-b-0 md:border-r border-gray-100 py-4">
              <Calendar className="text-[#C0A04C]" size={20} />
              <input 
                type="date" 
                min={today}
                value={filters.date}
                onChange={(e) => setFilters(f => ({...f, date: e.target.value}))}
                className="w-full bg-transparent text-[#3a1224] text-[11px] font-black uppercase outline-none"
              />
            </div>
            <div className="flex-1 flex items-center px-6 gap-4 border-b md:border-b-0 md:border-r border-gray-100 py-4">
              <Clock className="text-[#C0A04C]" size={20} />
              <select 
                value={filters.timeSlot}
                onChange={(e) => setFilters(f => ({...f, timeSlot: e.target.value}))}
                className="w-full bg-transparent text-[#3a1224] text-[11px] font-black uppercase outline-none appearance-none cursor-pointer"
              >
                <option value="">Any Time Slot</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="full">Full Day</option>
              </select>
            </div>
            <div className="flex-1 flex items-center px-6 gap-4 py-4">
              <Users className="text-[#C0A04C]" size={20} />
              <select 
                value={filters.capacity}
                onChange={(e) => setFilters(f => ({...f, capacity: e.target.value}))}
                className="w-full bg-transparent text-[#3a1224] text-[11px] font-black uppercase outline-none appearance-none cursor-pointer"
              >
                <option>Any Capacity</option>
                <option>50 - 100 Guests</option>
                <option>100 - 300 Guests</option>
                <option>300 - 500 Guests</option>
                <option>500+ Guests</option>
              </select>
            </div>
            <button 
              onClick={applyFilters}
              className="bg-[#3a1224] text-white px-10 py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-[#C0A04C] transition-all flex items-center justify-center gap-3"
            >
              <Search size={16} /> Search
            </button>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row gap-16">
        {/* Sidebar Filters */}
        <aside className="lg:w-1/4 space-y-12">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-black text-[#3a1224] uppercase tracking-[0.3em]">Refine Collection</h3>
              <button 
                onClick={() => {
                  setFilters({date:'', timeSlot:'', capacity:'Any Capacity', price:500000});
                  setSortBy('price-desc');
                }}
                className="text-[9px] font-bold text-[#C0A04C] uppercase tracking-widest border-b border-[#C0A04C]"
              >
                Reset
              </button>
            </div>

            {/* Price Range */}
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing Max</span>
                <span className="text-sm font-black text-[#3a1224]">NPR {filters.price.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="500000" 
                step="5000"
                value={filters.price}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFilters(f => ({...f, price: val}));
                  if(priceDebounce.current) clearTimeout(priceDebounce.current);
                  priceDebounce.current = setTimeout(applyFilters, 300);
                }}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#3a1224]"
              />
            </div>

            {/* Sort Options */}
            <div className="space-y-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order By</span>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'price-desc', label: 'Highest Luxury' },
                  { id: 'price-asc', label: 'Value First' },
                  { id: 'capacity-desc', label: 'Grand Space' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSortBy(option.id)}
                    className={`flex items-center justify-between p-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      sortBy === option.id ? 'bg-[#3a1224] text-white' : 'bg-white border border-gray-100 text-[#3a1224]'
                    }`}
                  >
                    {option.label}
                    {sortBy === option.id && <Circle size={8} fill="#C0A04C" className="text-[#C0A04C]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Grid */}
        <section className="lg:w-3/4">
          <div className="flex items-center justify-between mb-12">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">
              Showing {filteredHalls.length} Elite Spaces
            </p>
            <Settings2 size={18} className="text-gray-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredHalls.map((hall) => (
              <div 
                key={hall._id} 
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-[#3a1224]/5 transition-all duration-700 flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                  <Image 
                    src={hall.images?.[0] || '/assets/business-images/placeholder.jpg'} 
                    alt={hall.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                  <div className="absolute top-6 left-6">
                    <div className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full border border-white flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-[#C0A04C]" />
                       <span className="text-[9px] font-black text-[#3a1224] uppercase tracking-widest">Verified</span>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/80 via-transparent to-transparent flex flex-col justify-end p-8">
                    <div className="flex items-center gap-2 mb-2">
                       <MapPin size={10} className="text-[#C0A04C]" />
                       <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">{hall.location?.city || 'Waling'}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{hall.name}</h3>
                  </div>
                </div>

                <div className="p-10 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-8 mb-8 pb-8 border-b border-gray-50">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Guest Count</span>
                        <div className="flex items-center gap-2 text-[#3a1224]">
                          <Users size={14} className="text-[#C0A04C]" />
                          <span className="text-xs font-black">{hall.capacity}</span>
                        </div>
                      </div>
                      <div className="space-y-1 border-l border-gray-100 pl-8">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Dimensions</span>
                        <div className="flex items-center gap-2 text-[#3a1224]">
                          <Ruler size={14} className="text-[#C0A04C]" />
                          <span className="text-xs font-black">{hall.area || '2850'} FT²</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-[#3a1224]/60 text-[11px] font-medium leading-relaxed uppercase tracking-wide italic line-clamp-2 mb-10">
                      {hall.description || 'A masterpiece destination tailored for distinguished assemblies and lifelong celebrations.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-8 border-t border-gray-50">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest italic">Starting From</span>
                      <p className="text-lg font-black text-[#3a1224]">NPR {hall.pricePerHour?.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => router.push(ROUTES.SITE.VENUES(hall.slug))}
                      className="w-12 h-12 rounded-2xl bg-[#3a1224] text-white flex items-center justify-center hover:bg-[#C0A04C] transition-all duration-500 shadow-xl shadow-[#3a1224]/20"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredHalls.length === 0 && (
            <div className="text-center py-40 border-2 border-dashed border-gray-100 rounded-[3rem]">
              <Search size={48} className="text-gray-100 mx-auto mb-6" />
              <h3 className="text-xl font-black text-[#3a1224] uppercase tracking-widest">No Matches Found</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Adjust your refinement settings</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
