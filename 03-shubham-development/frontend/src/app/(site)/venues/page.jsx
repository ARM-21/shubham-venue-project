"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ROUTES } from 'config/routes';
import toast from 'react-hot-toast';
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
import { useQueryHallsPublic } from '@queries/customer/halls-public';
import { useQueryAvailability } from '@queries/customer/availability';

export default function VenuesPage() {
  const [sortBy, setSortBy] = useState('price-desc');
  const [filters, setFilters] = useState({
    date: '',
    timeSlot: '',
    capacity: 'Any Capacity',
    price: 500000,
  });
  
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  // Query hooks for fetching data
  const { data: hallsData, isLoading: hallsLoading, error: hallsError } = useQueryHallsPublic();
  const hallsList = hallsData?.halls || hallsData || [];

  // Availability query - only fetch when date and timeSlot are set
  const availabilityParams = filters.date && filters.timeSlot 
    ? { 
        date: filters.date, 
        slot: mapClientSlotToServer(filters.timeSlot), 
        guests: parseCapacityToGuests(filters.capacity) || 1 
      }
    : null;

  const { data: availabilityData, isLoading: availabilityLoading } = useQueryAvailability(
    availabilityParams,
    { enabled: !!availabilityParams }
  );

  // Animation styles
  const animationStyle = `
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.6s ease-out forwards;
    }
  `;

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

  // Apply filters and sorting to halls
  const applyFilters = (halls) => {
    let list = [...halls];

    // If availability data is available, filter by it
    if (availabilityData?.halls) {
      const availableIds = new Set(availabilityData.halls.map(h => h._id));
      list = list.filter(h => availableIds.has(h._id));
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
    list.sort((a, b) => {
      if (sortBy === 'price-asc') return (a.pricePerHour || 0) - (b.pricePerHour || 0);
      if (sortBy === 'price-desc') return (b.pricePerHour || 0) - (a.pricePerHour || 0);
      if (sortBy === 'capacity-desc') return (b.capacity || 0) - (a.capacity || 0);
      return 0;
    });

    return list;
  };

  // Memoized filtered halls
  const processedHalls = useMemo(() => {
    return applyFilters(hallsList);
  }, [hallsList, filters, sortBy, availabilityData]);

  // Memoized event handlers to prevent unnecessary re-renders
  const handleDateChange = useCallback((e) => {
    setFilters(f => ({...f, date: e.target.value}));
  }, []);

  const handleTimeSlotChange = useCallback((e) => {
    setFilters(f => ({...f, timeSlot: e.target.value}));
  }, []);

  const handleCapacityChange = useCallback((e) => {
    setFilters(f => ({...f, capacity: e.target.value}));
  }, []);

  const handlePriceChange = useCallback((e) => {
    const val = Number(e.target.value);
    setFilters(f => ({...f, price: val}));
  }, []);

  const handleSortChange = useCallback((optionId) => {
    setSortBy(optionId);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({date:'', timeSlot:'', capacity:'Any Capacity', price:500000});
    setSortBy('price-desc');
    toast.success('Filters reset');
  }, []);

  const handleVenueClick = useCallback((hallSlug) => {
    router.push(ROUTES.SITE.VENUES(hallSlug));
  }, [router]);

  const isLoading = hallsLoading || availabilityLoading;

  if (isLoading && hallsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#3a1224]">
        <div className="w-12 h-12 border-4 border-[#C0A04C] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#C0A04C] font-black text-[10px] uppercase tracking-[0.4em]">Searching Collection</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6] selection:bg-[#C0A04C]/30 overflow-hidden">
      {/* Dark Gradient Header Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/80 to-[#342d2d] pointer-events-none z-0" />

      {/* Header Section */}
      <section className="pt-40 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[#C0A04C]" />
            <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Exclusive Venues</span>
          </div>
          <div className="mb-12">
            <h1 className="text-6xl lg:text-8xl font-display font-bold text-white mb-6 leading-[0.9]">
              Signature <span className="text-[#C0A04C] italic font-serif">Spaces</span>
            </h1>
            <p className="text-white/70 text-lg font-light leading-relaxed max-w-2xl">
              Discover exquisite venues perfect for your most memorable occasions. Filter by capacity, availability, and budget to find your ideal celebration space.
            </p>
          </div>

          {/* Search/Filter Bar - Premium Style */}
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 flex items-center px-4 sm:px-6 py-3 sm:py-4 bg-[#3a1224]/40 sm:bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <Calendar className="text-[#C0A04C] flex-shrink-0" size={20} />
                <input 
                  type="date" 
                  min={today}
                  value={filters.date}
                  onChange={handleDateChange}
                  className="w-full bg-transparent text-white text-[10px] sm:text-[11px] font-black uppercase outline-none ml-3 sm:ml-4 placeholder-white/50 cursor-pointer"
                  placeholder="Select Date"
                />
              </div>
              <div className="flex-1 flex items-center px-4 sm:px-6 py-3 sm:py-4 bg-[#3a1224]/40 sm:bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <Clock className="text-[#C0A04C] flex-shrink-0" size={20} />
                <select 
                  value={filters.timeSlot}
                  onChange={handleTimeSlotChange}
                  className="w-full bg-transparent text-white text-[10px] sm:text-[11px] font-black uppercase outline-none appearance-none ml-3 sm:ml-4 cursor-pointer"
                >
                  <option value="" className="bg-[#3a1224] text-white">Any Time Slot</option>
                  <option value="morning" className="bg-[#3a1224] text-white">Morning</option>
                  <option value="afternoon" className="bg-[#3a1224] text-white">Afternoon</option>
                  <option value="evening" className="bg-[#3a1224] text-white">Evening</option>
                  <option value="full" className="bg-[#3a1224] text-white">Full Day</option>
                </select>
              </div>
              <div className="flex-1 flex items-center px-4 sm:px-6 py-3 sm:py-4 bg-[#3a1224]/40 sm:bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                <Users className="text-[#C0A04C] flex-shrink-0" size={20} />
                <select 
                  value={filters.capacity}
                  onChange={handleCapacityChange}
                  className="w-full bg-transparent text-white text-[10px] sm:text-[11px] font-black uppercase outline-none appearance-none ml-3 sm:ml-4 cursor-pointer"
                >
                  <option className="bg-[#3a1224] text-white">Any Capacity</option>
                  <option className="bg-[#3a1224] text-white">50 - 100 Guests</option>
                  <option className="bg-[#3a1224] text-white">100 - 300 Guests</option>
                  <option className="bg-[#3a1224] text-white">300 - 500 Guests</option>
                  <option className="bg-[#3a1224] text-white">500+ Guests</option>
                </select>
              </div>
              <button 
                onClick={() => {
                  if (!filters.date || !filters.timeSlot) {
                    toast.error('Please select date and time slot');
                    return;
                  }
                }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#C0A04C] to-[#C0A04C]/95 text-[#3a1224] rounded-2xl text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-[#C0A04C]/30 transition-all flex items-center justify-center gap-2 sm:gap-3 flex-shrink-0 cursor-pointer"
              >
                <Search size={16} /> <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row gap-16 relative z-10">
        {/* Sidebar Filters */}
        <aside className="lg:w-1/4 space-y-12">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border border-white/20 shadow-lg">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[12px] font-black text-[#3a1224] uppercase tracking-[0.3em]">Refine Collection</h3>
              <button 
                onClick={handleResetFilters}
                className="text-[9px] font-bold text-[#C0A04C] uppercase tracking-widest border-b border-[#C0A04C] hover:text-[#3a1224] transition-colors cursor-pointer"
              >
                Reset All
              </button>
            </div>

            {/* Price Range */}
            <div className="space-y-6 pb-8 border-b border-[#3a1224]/10">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-[#3a1224]/60 uppercase tracking-widest">Budget Range</span>
                <span className="text-sm font-black text-[#C0A04C]">NPR {filters.price.toLocaleString()}</span>
              </div>
              <input 
                type="range" 
                min="10000" 
                max="500000" 
                step="5000"
                value={filters.price}
                onChange={handlePriceChange}
                className="w-full h-2 bg-gradient-to-r from-gray-200 to-[#C0A04C]/30 rounded-lg appearance-none cursor-pointer accent-[#C0A04C] hover:cursor-pointer"
              />
            </div>

            {/* Sort Options */}
            <div className="space-y-4 pt-8">
              <span className="text-[10px] font-black text-[#3a1224]/60 uppercase tracking-widest">Sort By</span>
              <div className="flex flex-col gap-3">
                {[
                  { id: 'price-desc', label: 'Highest Luxury' },
                  { id: 'price-asc', label: 'Best Value' },
                  { id: 'capacity-desc', label: 'Largest Spaces' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSortChange(option.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                      sortBy === option.id 
                        ? 'bg-gradient-to-r from-[#3a1224] to-[#3a1224]/80 text-white shadow-lg shadow-[#3a1224]/20' 
                        : 'bg-white border border-gray-200 text-[#3a1224] hover:border-[#C0A04C]/50'
                    }`}
                  >
                    {option.label}
                    {sortBy === option.id && <div className="w-2 h-2 rounded-full bg-[#C0A04C]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Grid */}
        <section className="lg:w-3/4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-[11px] font-black text-[#3a1224] uppercase tracking-[0.4em]">
              {processedHalls.length} Elite <span className="text-[#C0A04C]">Venues</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {processedHalls.map((hall, idx) => (
              <div 
                key={hall._id}
                className="group relative opacity-0 animate-fadeIn"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="absolute -inset-1 bg-gradient-to-b from-[#C0A04C]/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                
                <div className="relative bg-white/95 rounded-3xl overflow-hidden border border-[#3a1224]/5 flex flex-col shadow-lg backdrop-blur-sm">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                    <Image 
                      src={hall.images?.[0] || '/assets/business-images/placeholder.jpg'} 
                      alt={hall.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/60 via-transparent to-transparent" />
                    
                    <div className="absolute top-6 left-6">
                      <div className="bg-white/90 backdrop-blur-xl px-3 py-1.5 rounded-full border border-white/50 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[8px] font-black text-[#3a1224] uppercase tracking-widest">Available</span>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={10} className="text-[#C0A04C]" />
                        <span className="text-[9px] font-bold text-white uppercase tracking-[0.2em]">{hall.location?.city || 'Premium Location'}</span>
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-tight">{hall.name}</h3>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-6 mb-8 pb-8 border-b border-[#3a1224]/10">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-widest">Guest Count</span>
                          <div className="flex items-center gap-2 text-[#3a1224]">
                            <Users size={14} className="text-[#C0A04C]" />
                            <span className="text-sm font-black">{hall.capacity}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-widest">Dimensions</span>
                          <div className="flex items-center gap-2 text-[#3a1224]">
                            <Ruler size={14} className="text-[#C0A04C]" />
                            <span className="text-sm font-black">{hall.area || '2850'} FT²</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[#3a1224]/70 text-[10px] font-medium leading-relaxed line-clamp-2 mb-10">
                        {hall.description || 'A masterpiece destination tailored for distinguished assemblies and lifelong celebrations.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-8 border-t border-[#3a1224]/10">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-widest">Starting From</span>
                        <p className="text-2xl font-display font-bold text-[#3a1224]">NPR {hall.pricePerHour?.toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => handleVenueClick(hall.slug)}
                        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3a1224] to-[#3a1224]/80 text-white flex items-center justify-center hover:shadow-lg hover:shadow-[#C0A04C]/30 hover:scale-110 transition-all duration-500 cursor-pointer"
                      >
                        <ArrowRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {processedHalls.length === 0 && (
            <div className="text-center py-48 border-2 border-dashed border-[#3a1224]/20 rounded-[3rem] bg-white/50">
              <Search size={48} className="text-[#3a1224]/20 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-[#3a1224] uppercase tracking-widest mb-2">No Matches Found</h3>
              <p className="text-[10px] font-bold text-[#3a1224]/50 uppercase tracking-widest">Adjust your filters and try again</p>
            </div>
          )}
        </section>
      </main>

      <style>{animationStyle}</style>
    </div>
  );
}
