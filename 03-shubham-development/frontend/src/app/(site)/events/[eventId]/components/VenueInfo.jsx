import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { ROUTES } from "config/routes";

function formatLocation(venue) {
  const location = venue?.location;
  if (typeof venue?.address === "string" && venue.address.trim()) return venue.address;
  if (typeof location === "string" && location.trim()) return location;
  if (location && typeof location === "object") {
    return [location.address, location.city, location.state, location.country].filter(Boolean).join(", ");
  }
  return [venue?.city, venue?.state, venue?.country].filter(Boolean).join(", ") || "Location on venue page";
}

export function VenueInfo({ venue }) {
  if (!venue) return null;

  const location = formatLocation(venue);

  return (
    <section>
      <div className="mb-5">
        <p className="site-eyebrow mb-1.5">Venue</p>
        <h2 className="text-2xl font-black text-[#3a1224]">{venue.name}</h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white divide-y divide-[#e8dcc8]">
        <div className="flex items-start gap-4 px-5 py-4">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#fbf8f2] text-[#C0A04C]">
            <MapPin className="h-4 w-4" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/40">Address</p>
            <p className="mt-0.5 text-[15px] font-bold text-[#3a1224]">{location}</p>
          </div>
        </div>

        {venue.capacity && (
          <div className="flex items-start gap-4 px-5 py-4">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#fbf8f2] text-[#C0A04C]">
              <Users className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/40">Capacity</p>
              <p className="mt-0.5 text-[15px] font-bold text-[#3a1224]">{Number(venue.capacity).toLocaleString()} guests</p>
            </div>
          </div>
        )}
      </div>

      {venue.slug && (
        <div className="mt-3">
          <Link
            href={ROUTES.SITE.VENUES(venue.slug)}
            className="inline-flex h-10 items-center rounded-2xl bg-[#3a1224] px-5 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830]"
          >
            View venue page
          </Link>
        </div>
      )}
    </section>
  );
}
