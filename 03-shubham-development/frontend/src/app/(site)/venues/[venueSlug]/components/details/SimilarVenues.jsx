"use client";
import React from 'react';
import { motion } from 'framer-motion';
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
    <section className="mt-16 lg:mt-20">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="site-eyebrow mb-3">Nearby Options</p>
          <h2 className="site-heading text-[#3a1224]">Similar venues to compare.</h2>
        </div>
        <p className="max-w-sm text-sm leading-6 text-[#3a1224]/60">
          Check another space if the selected date or capacity does not fit your event.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {similarVenues.length > 0 ? (
          similarVenues.map((venue, idx) => (
            <motion.div
              key={venue._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => router.push(ROUTES.SITE.VENUES(venue.slug || venue._id))}
              className="group cursor-pointer rounded-2xl border border-[var(--color-sand)] bg-white p-3 shadow-[var(--shadow-card)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(58,18,36,0.12)]"
            >
              <div className="relative mb-5 aspect-[4/3] overflow-hidden rounded-xl bg-[var(--color-ivory)]">
                <img 
                  src={resolveImage(normalizeImage(venue.images?.[0]), '/assets/business-images/placeholder2.jpg')}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={venue.name}
                />
                <div className="absolute inset-0 bg-[#3a1224]/20 group-hover:bg-transparent transition-all" />
                <div className="absolute bottom-3 left-3">
                  <div className="rounded-full bg-white/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224] backdrop-blur-md">
                    {venue.location?.city}
                  </div>
                </div>
              </div>
              <h4 className="px-1 text-xl font-display font-bold text-[#3a1224] mb-2 group-hover:text-[#C0A04C] transition-colors">
                {venue.name}
              </h4>
              <div className="flex items-center gap-3 px-1 pb-2 text-[10px] text-[#3a1224]/50 font-bold uppercase tracking-widest">
                <Users className="w-3 h-3" /> {venue.capacity} Pax
                <div className="w-1 h-1 rounded-full bg-[#C0A04C]" />
                {venue.category || 'Event Venue'}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-[#3a1224]/10 bg-white py-16 text-center">
             <p className="text-[#3a1224]/30 font-display italic">No similar venues found in this area.</p>
          </div>
        )}
      </div>
    </section>
  );
};
