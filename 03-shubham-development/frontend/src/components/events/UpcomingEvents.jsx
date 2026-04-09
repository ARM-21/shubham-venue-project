"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ROUTES } from "config/routes";
import { useQueryEventsPublic } from '@queries/customer/events-public';
import { Calendar, MapPin, ArrowRight, Ticket, Sparkles } from "lucide-react";

export default function UpcomingEvents() {
  const router = useRouter();
  const { data: eventsData = {}, isLoading, error } = useQueryEventsPublic({ limit: 4 });
  
  const events = eventsData?.events || [];

  return (
    <div className="py-6 sm:py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#FDFCFB] via-white to-[#fdfaf6]">
      <div className="max-w-8xl mx-auto">
        
        {/* Professional Header */}
        <div className="mb-16 sm:mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-[2px] bg-gradient-to-r from-[#C0A04C] to-[#C0A04C]/50" />
            <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.3em]">
              Featured Experiences
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-8">
            <div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-[#3a1224] mb-4">
                Upcoming Events
              </h2>
              <p className="text-base sm:text-lg text-[#3a1224]/60 font-light max-w-2xl">
                Discover curated experiences and exclusive gatherings happening near you
              </p>
            </div>
            {events.length > 0 && (
              <div className="flex-shrink-0">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#C0A04C]/10 border border-[#C0A04C]/30 rounded-full">
                  <Sparkles size={16} className="text-[#C0A04C]" />
                  <span className="text-sm font-black text-[#3a1224] uppercase tracking-wider">
                    {events.length} Events
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-[#C0A04C]/50 via-[#C0A04C]/20 to-transparent" />
        </div>

        {error ? (
          <div className="bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 p-8 rounded-2xl text-red-700 text-center">
            <p className="font-black uppercase text-[10px] tracking-[0.25em] mb-2">Unable to Load</p>
            <p className="text-sm font-medium">We're having trouble loading events. Please try again later.</p>
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group">
                <div className="relative aspect-[3/4] w-full rounded-[2rem] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 animate-pulse shadow-lg" />
                <div className="mt-6 space-y-3">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4 animate-pulse" />
                  <div className="h-3 bg-gray-50 rounded-full w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {events.map((event) => {
              const date = new Date(event.startDateTime);
              const day = date.getDate();
              const month = date.toLocaleString('default', { month: 'short' });
              const isRegistrationOpen = event.registrationStartDate 
                ? new Date(event.registrationStartDate) <= new Date()
                : true;
              const isEventEnded = event.endDateTime 
                ? new Date(event.endDateTime) < new Date()
                : false;

              return (
                <article
                  key={event._id}
                  className="group h-full flex flex-col cursor-pointer transition-all duration-500 hover:scale-[1.02]"
                  onClick={() => router.push(ROUTES.SITE.EVENT_DETAIL(event._id))}
                >
                  {/* Card Container */}
                  <div className="relative flex flex-col h-full rounded-[2rem] overflow-hidden bg-white border border-[#3a1224]/5 shadow-lg hover:shadow-2xl transition-all duration-500">
                    
                    {/* Image Section */}
                    <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-gray-200 to-gray-100 overflow-hidden">
                      <Image
                        src={event.bannerUrl || '/assets/business-images/placeholder.jpg'}
                        alt={event.name || "Event"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        priority={false}
                      />
                      
                      {/* Date Badge - Professional */}
                      <div className="absolute top-4 left-4 z-10 w-16 h-20 bg-white/95 backdrop-blur-md rounded-xl flex flex-col items-center justify-center shadow-xl border border-white/80 hover:shadow-2xl transition-shadow">
                        <span className="text-2xl font-black text-[#3a1224] leading-none">{day}</span>
                        <span className="text-[9px] font-black text-[#C0A04C] uppercase tracking-widest mt-1">{month}</span>
                      </div>

                      {/* Status Badge */}
                      {isEventEnded ? (
                        <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-gray-600/90 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-wider rounded-full">
                          Ended
                        </div>
                      ) : !isRegistrationOpen && (
                        <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-blue-500/90 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-wider rounded-full">
                          Coming Soon
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224] via-[#3a1224]/40 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-700" />
                      
                      {/* Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 bg-[#C0A04C] text-[8px] font-black text-[#3a1224] uppercase tracking-widest rounded-full shadow-lg">
                            {event.type || "Public Event"}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight group-hover:text-[#C0A04C] transition-colors duration-300 line-clamp-2">
                          {event.name}
                        </h3>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                      {/* Venue Info */}
                      <div className="flex items-center gap-2 text-[#3a1224]/60 mb-4">
                        <MapPin size={14} className="text-[#C0A04C] flex-shrink-0" />
                        <p className="text-[12px] font-semibold uppercase tracking-wider truncate">
                          {event.hallId?.name || "Venue"}
                        </p>
                      </div>

                      {/* Footer with CTA */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isEventEnded) {
                            router.push(ROUTES.SITE.EVENT_DETAIL(event._id));
                          }
                        }}
                        disabled={isEventEnded}
                        className="flex items-center justify-between w-full pt-4 border-t border-[#3a1224]/5 group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-[#3a1224]/50 uppercase tracking-[0.15em]">
                            {isEventEnded 
                              ? "Event Finished" 
                              : isRegistrationOpen 
                              ? "Get Tickets" 
                              : "Registration Opens"}
                          </span>
                          <span className="text-xs font-black text-[#3a1224] uppercase mt-1">
                            {isEventEnded 
                              ? "View Archive" 
                              : isRegistrationOpen 
                              ? "View Details" 
                              : "Coming Soon"}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-[#C0A04C]/10 flex items-center justify-center group-hover/btn:bg-[#3a1224] group-disabled:bg-gray-100 transition-all duration-300">
                          <ArrowRight size={16} className={`group-hover/btn:text-white group-hover/btn:translate-x-0.5 transition-all ${isEventEnded ? 'text-gray-400' : 'text-[#C0A04C]'}`} />
                        </div>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#C0A04C]/20 to-[#3a1224]/10 rounded-full flex items-center justify-center mb-8">
              <Calendar size={40} className="text-[#3a1224]/30" />
            </div>
            <h3 className="text-3xl font-display font-bold text-[#3a1224] mb-3 text-center">
              No Events Scheduled Yet
            </h3>
            <p className="text-[#3a1224]/60 max-w-md mx-auto font-light text-center mb-12 leading-relaxed">
              We're carefully curating extraordinary experiences for you. Check back soon for upcoming events and exclusive opportunities.
            </p>
            <button
              onClick={() => router.push(ROUTES.SITE.EVENTS)}
              className="px-8 py-3 bg-[#3a1224] text-white rounded-xl font-black text-sm uppercase tracking-wider hover:bg-[#C0A04C] hover:text-[#3a1224] transition-all duration-300 flex items-center gap-2 group"
            >
              <span>Explore All Events</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
