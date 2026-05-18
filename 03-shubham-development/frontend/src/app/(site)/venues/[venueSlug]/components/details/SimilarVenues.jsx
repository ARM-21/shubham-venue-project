"use client";
import { Users } from 'lucide-react';
import { ROUTES } from 'config/routes';
import { useRouter } from 'next/navigation';
import { resolveImage } from 'components/site/SitePrimitives';

function normalizeImage(src) {
  if (typeof src === 'string') return src;
  if (!src || typeof src !== 'object') return '';
  return src.url || src.secureUrl || src.location || src.path || src.src || '';
}

export const SimilarVenues = ({ similarVenues }) => {
  const router = useRouter();

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="site-eyebrow mb-2">Nearby options</p>
          <h2 className="text-2xl font-black text-[#3a1224]">Similar venues</h2>
        </div>
        <p className="max-w-xs text-sm leading-6 text-[#3a1224]/50">
          Explore other spaces if this date or capacity doesn't fit.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {similarVenues.length > 0 ? (
          similarVenues.map((venue) => (
            <div
              key={venue._id}
              onClick={() => router.push(ROUTES.SITE.VENUES(venue.slug || venue._id))}
              className="group cursor-pointer rounded-2xl border border-[#e8dcc8] bg-white p-3 transition hover:-translate-y-1 hover:border-[#C0A04C]/40 hover:shadow-[0_16px_40px_rgba(58,18,36,0.1)]"
            >
              <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl bg-[#f4eadb]">
                <img
                  src={resolveImage(normalizeImage(venue.images?.[0]), '/assets/business-images/placeholder2.jpg')}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt={venue.name}
                />
                {venue.location?.city && (
                  <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#3a1224]">
                    {venue.location.city}
                  </div>
                )}
              </div>
              <h4 className="px-1 text-[15px] font-black text-[#3a1224] transition-colors group-hover:text-[#C0A04C]">
                {venue.name}
              </h4>
              <div className="mt-1.5 flex items-center gap-2.5 px-1 pb-1 text-[10px] font-bold uppercase tracking-widest text-[#3a1224]/40">
                <Users className="h-3 w-3" />
                {venue.capacity} pax
                <span className="h-1 w-1 rounded-full bg-[#C0A04C]" />
                {venue.category || 'Event Venue'}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-[#3a1224]/10 bg-white py-12 text-center">
            <p className="text-sm text-[#3a1224]/30">No similar venues found nearby.</p>
          </div>
        )}
      </div>
    </div>
  );
};
