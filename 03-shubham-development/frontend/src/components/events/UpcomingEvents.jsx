"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { Calendar, MapPin, ArrowRight, Ticket } from "lucide-react";

export default function UpcomingEvents() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchEvents() {
      try {
        setLoading(true);
        const res = await axiosInstance.get(ROUTES.API.EVENTS.PUBLIC, {
          params: { limit: 4 },
        });
        if (!ignore) {
          setEvents(res.data?.events || []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError("Failed to load upcoming events");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchEvents();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="py-5 px-6 bg-[#FDFCFB]">
      <div className="max-w-8xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
          <div className="max-w-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[1px] bg-[#C0A04C]" />
              <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">The Calendar</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-[#3a1224] uppercase tracking-tighter leading-none">
              Upcoming <span className="text-[#C0A04C] italic serif lowercase">experiences</span>
            </h2>
            <p className="text-[#3a1224]/60 text-lg font-medium italic border-l-4 border-[#C0A04C]/20 pl-6 py-1">
              "Join us for unforgettable celebrations, workshops, and grand community gatherings."
            </p>
          </div>
          <button
            onClick={() => router.push(ROUTES.SITE.EVENTS)}
            className="group flex items-center justify-center py-5 px-12 rounded-2xl bg-white border-2 border-[#3a1224] text-[#3a1224] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#3a1224] hover:text-white transition-all duration-500"
          >
            Full Calendar <ArrowRight size={16} className="ml-3 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        {error ? (
          <div className="bg-red-50 p-8 rounded-[2rem] text-red-600 text-center font-black uppercase text-[10px] tracking-widest">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 h-[500px] rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : events.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {events.map((event) => {
              const banner = event.bannerUrl ? (event.bannerUrl.startsWith('http') ? event.bannerUrl : `${process.env.NEXT_PUBLIC_API_BASE_URL}${event.bannerUrl}`) : '/assets/business-images/placeholder.jpg';
              
              const date = new Date(event.startDateTime);
              const day = date.getDate();
              const month = date.toLocaleString('default', { month: 'short' });

              return (
                <article
                  key={event._id}
                  className="group relative flex flex-col cursor-pointer h-full"
                  onClick={() => router.push(ROUTES.SITE.EVENT_DETAIL(event._id))}
                >
                  <div className="relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#3a1224]/5 group-hover:shadow-[#3a1224]/10 transition-all duration-700">
                    <Image
                      src={banner}
                      alt={event.name || "Event"}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    
                    {/* Date Badge */}
                    <div className="absolute top-6 left-6 z-10 w-14 h-16 bg-white/95 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center shadow-2xl border border-white">
                      <span className="text-xl font-black text-[#3a1224] leading-none mb-1">{day}</span>
                      <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-widest">{month}</span>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224] via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-700" />
                    
                    {/* Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-[#C0A04C] text-[8px] font-black text-[#3a1224] uppercase tracking-widest rounded-full">
                          {event.type || "Public Event"}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white leading-tight mb-4 uppercase tracking-tighter group-hover:text-[#C0A04C] transition-colors">
                        {event.name}
                      </h3>
                      <div className="flex items-center gap-2 text-white/60">
                        <MapPin size={10} className="text-[#C0A04C]" />
                        <p className="text-[10px] font-bold uppercase tracking-widest truncate">
                          {event.hallId?.name || "The Grand Palace"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between px-4 group/btn">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em] mb-1">Tickets</span>
                      <span className="text-xs font-black text-[#3a1224] uppercase">Available Now</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 shadow-xl flex items-center justify-center group-hover/btn:bg-[#3a1224] group-hover/btn:text-white transition-all duration-500">
                       <Ticket size={20} className="group-hover/btn:rotate-12 transition-transform" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#3a1224]/5 rounded-[3rem] p-24 text-center shadow-sm">
            <div className="w-24 h-24 bg-[#3a1224]/5 rounded-full flex items-center justify-center mx-auto mb-8">
              <Calendar size={32} className="text-[#3a1224]/20" />
            </div>
            <h3 className="text-2xl font-black text-[#3a1224] uppercase tracking-tight mb-4">No Scheduled Experiences</h3>
            <p className="text-[#3a1224]/50 max-w-sm mx-auto font-medium italic">"We are currently curating new moments of joy. Please return soon."</p>
          </div>
        )}
      </div>
    </div>
  );
}
