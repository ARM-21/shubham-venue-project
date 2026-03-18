"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axiosInstance from "@/lib/axios";
import { ROUTES } from "@/config/routes";

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
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(ROUTES.API.EVENTS.PUBLIC, {
        params: {
          page,
          limit: PAGE_SIZE,
          q: searchTerm || undefined,
        },
      });
      const payload = res.data || {};
      setEvents(payload.events || []);
      setPages(payload.pages || 1);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <main className="min-h-screen bg-[#fdfbf7]">
      <section className="bg-gradient-to-r from-[#3f1228] via-[#5a1b33] to-[#7a2445] text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">Events</p>
          <h1 className="text-3xl md:text-4xl font-bold mt-3">Explore upcoming events</h1>
          <p className="text-sm text-white/80 mt-3 max-w-2xl">
            Browse events hosted by verified organizers and reserve your tickets instantly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by event name or type"
              className="w-full md:w-[320px] px-4 py-2 rounded-lg text-sm text-gray-900"
            />
            <button
              onClick={() => {
                setPage(1);
                setSearchTerm(searchInput.trim());
              }}
              className="px-4 py-2 rounded-lg bg-white text-[#3f1228] text-sm font-semibold"
            >
              Search
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">{error}</div>
        ) : null}

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-600">Loading events...</div>
        ) : events.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <article
                key={event._id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                <div className="relative h-44 w-full">
                  <Image
                    src={event.bannerUrl || PLACEHOLDER_IMAGE}
                    alt={event.name || "Event"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-xs text-gray-500">{event.type || "Event"}</p>
                  <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-600">{event.hallId?.name || "Venue"}</p>
                  <p className="text-xs text-gray-500">{formatDateTime(event.startDateTime)}</p>
                  <button
                    onClick={() => router.push(ROUTES.SITE.EVENT_DETAIL(event._id))}
                    className="text-sm text-[#6b1f3a] font-semibold hover:underline"
                  >
                    View details
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-600">
            No events found.
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <span className="text-xs text-gray-500">Page {page} of {pages}</span>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 rounded bg-white border border-gray-200 text-sm text-gray-700 disabled:opacity-40"
              onClick={() => canPrev && setPage((p) => p - 1)}
              disabled={!canPrev}
            >
              Prev
            </button>
            <button
              className="px-3 py-1 rounded bg-white border border-gray-200 text-sm text-gray-700 disabled:opacity-40"
              onClick={() => canNext && setPage((p) => p + 1)}
              disabled={!canNext}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
