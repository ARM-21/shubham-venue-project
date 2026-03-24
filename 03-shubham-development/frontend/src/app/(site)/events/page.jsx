"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ROUTES } from "config/routes";
import { useQueryEventsPublic } from '@queries/customer/events-public';

const PAGE_SIZE = 9;
const PLACEHOLDER_IMAGE = "/assets/business-images/placeholder.jpg";

function formatDateTime(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

export default function EventsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: eventsData, isLoading, error } = useQueryEventsPublic({
    page,
    limit: PAGE_SIZE,
    q: searchTerm || undefined,
  });

  const events = eventsData?.events || [];
  const pages = eventsData?.pages || 1;
  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <main className="min-h-screen bg-[#fdfaf6] relative selection:bg-[#C0A04C]/30 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-[#C0A04C]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-[#3a1224]/5 blur-[120px] rounded-full" />
      </div>

      {/* Dark Gradient Header background */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/95 to-[#3c3a37] pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 pt-40 pb-12 relative z-10">
        <header className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-[1px] bg-[#C0A04C]" />
            <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Event Discovery</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-16">
            <div>
              <h1 className="text-6xl lg:text-8xl font-display font-bold text-white mb-6 leading-[0.9]">Explore <span className="text-[#C0A04C] italic font-serif">upcoming</span></h1>
              <p className="text-white/60 text-lg font-light leading-relaxed max-w-xl">
                Browse curated events and reserve your tickets instantly for an unforgettable experience.
              </p>
            </div>
          </div>

          {/* Search Bar - Modern Integrated Design */}
          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search events by name or type"
              className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/40 focus:outline-none focus:border-[#C0A04C]/50 focus:bg-white/15 transition-all backdrop-blur-md text-[10px] font-black uppercase tracking-widest"
            />
            <button
              onClick={() => {
                setPage(1);
                setSearchTerm(searchInput.trim());
              }}
              className="px-8 py-4 bg-[#C0A04C] text-[#3a1224] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-[#C0A04C]/30 transition-all"
            >
              Search
            </button>
          </div>
        </header>
      </div>

      {/* Events Grid Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm mb-6 font-semibold">{error?.message || "Failed to load events"}</div>
        ) : null}

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-[#C0A04C] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-6 text-[#3a1224]/60 text-sm font-semibold">Discovering amazing events...</p>
          </div>
        ) : events.length ? (
          <>
            <div className="mb-16">
              <div className="flex items-center gap-6 mb-12">
                <div className="w-12 h-[1px] bg-[#C0A04C]"></div>
                <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Featured Events • Page {page} of {pages}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => (
                  <div
                    key={event._id}
                    className="group bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-[#3a1224]/5 transition-all duration-700 flex flex-col cursor-pointer"
                    onClick={() => router.push(ROUTES.SITE.EVENT_DETAIL(event._id))}
                  >
                    {/* Image Section */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                      <Image
                        src={event.bannerUrl || PLACEHOLDER_IMAGE}
                        alt={event.name || "Event"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-1000"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/80 via-transparent to-transparent flex flex-col justify-end p-8">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] bg-[#C0A04C] px-3 py-1 rounded-full">{event.type || "Event"}</span>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none">{event.name}</h3>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-8 flex-1 flex flex-col justify-between">
                      <div className="space-y-5">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Host Venue</p>
                          <p className="font-bold text-[#3a1224]">{event.hallId?.name || "Venue"}</p>
                        </div>

                        <div className="space-y-2 p-4 bg-[#fdfaf6] rounded-2xl border border-[#3a1224]/5">
                          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Event Date & Time</p>
                          <p className="text-sm font-bold text-[#3a1224]">{formatDateTime(event.startDateTime)}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(ROUTES.SITE.EVENT_DETAIL(event._id));
                        }}
                        className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-3 text-[#3a1224] text-[10px] font-black uppercase tracking-widest group-hover:text-[#C0A04C] transition-colors"
                      >
                        View Event
                        <div className="w-10 h-10 rounded-full border border-[#3a1224]/10 flex items-center justify-center group-hover:border-[#C0A04C] group-hover:bg-[#C0A04C] group-hover:text-white transition-all">
                          <span>→</span>
                        </div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-[#3a1224]/10">
              <span className="text-xs text-[#3a1224]/50 font-bold uppercase tracking-wider">Showing {((page - 1) * 9) + 1} - {Math.min(page * 9, (page * 9))} of {pages * 9}</span>
              <div className="flex gap-3">
                <button
                  onClick={() => canPrev && setPage((p) => p - 1)}
                  disabled={!canPrev}
                  className="px-6 py-3 rounded-xl border border-[#3a1224]/20 text-sm font-black text-[#3a1224] hover:border-[#C0A04C] hover:text-[#C0A04C] disabled:opacity-40 disabled:cursor-not-allowed transition duration-300"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => canNext && setPage((p) => p + 1)}
                  disabled={!canNext}
                  className="px-6 py-3 rounded-xl border border-[#3a1224]/20 text-sm font-black text-[#3a1224] hover:border-[#C0A04C] hover:text-[#C0A04C] disabled:opacity-40 disabled:cursor-not-allowed transition duration-300"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-display font-bold text-[#3a1224] mb-3">No Events Found</h3>
            <p className="text-[#3a1224]/60 text-sm">Try a different search or check back later for new events.</p>
          </div>
        )}
      </div>
    </main>
  );
}
