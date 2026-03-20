"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

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
    <section className="container mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#6b1f3a]">Upcoming events</p>
          <h2 className="text-2xl md:text-3xl font-bold text-[#3f1228] mt-2">
            Discover events hosted by verified organizers
          </h2>
        </div>
        <button
          onClick={() => router.push(ROUTES.SITE.EVENTS)}
          className="px-4 py-2.5 rounded-lg bg-[#9e1c3f] text-white text-sm font-semibold hover:bg-[#b32346] transition"
        >
          Explore Events
        </button>
      </div>

      {error ? (
        <div className="text-red-600 text-sm mb-4">{error}</div>
      ) : null}

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-600">Loading events...</div>
      ) : events.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <article
              key={event._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition"
            >
              <div className="relative h-40 w-full">
                <Image
                  src={event.bannerUrl || PLACEHOLDER_IMAGE}
                  alt={event.name || "Event"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className="p-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-500">{event.type || "Event"}</p>
                  <h3 className="text-base font-semibold text-gray-900">{event.name}</h3>
                </div>
                <p className="text-xs text-gray-600">
                  {event.hallId?.name || "Venue"}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDateTime(event.startDateTime)}
                </p>
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
          No upcoming events yet. Check back soon.
        </div>
      )}
    </section>
  );
}
