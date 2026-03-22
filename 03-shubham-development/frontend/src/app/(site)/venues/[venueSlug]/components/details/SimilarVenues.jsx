"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { ROUTES } from 'config/routes';
import { useRouter } from 'next/navigation';

export const SimilarVenues = ({ similarVenues }) => {
  const router = useRouter();

  return (
    <section className="mt-40 mb-20">
      <div className="flex flex-col items-center text-center mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-[1px] bg-[#C0A04C]" />
          <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Explore More</span>
          <div className="w-12 h-[1px] bg-[#C0A04C]" />
        </div>
        <h2 className="text-4xl font-display font-bold text-[#3a1224]">Similar Places</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {similarVenues.length > 0 ? (
          similarVenues.map((venue, idx) => (
            <motion.div
              key={venue._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => router.push(ROUTES.SITE.VENUE_DETAILS(venue.slug))}
              className="group cursor-pointer"
            >
              <div className="relative h-80 overflow-hidden mb-6 border border-[#3a1224]/5">
                <img 
                  src={venue.images?.[0] || '/assets/business-images/placeholder.jpg'} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={venue.name} 
                />
                <div className="absolute inset-0 bg-[#3a1224]/20 group-hover:bg-transparent transition-all" />
                <div className="absolute bottom-4 left-4">
                  <div className="px-4 py-2 bg-white/90 backdrop-blur-md text-[#3a1224] text-[10px] font-black uppercase tracking-[0.2em]">
                    {venue.location?.city}
                  </div>
                </div>
              </div>
              <h4 className="text-xl font-display font-bold text-[#3a1224] mb-2 group-hover:text-[#C0A04C] transition-colors">
                {venue.name}
              </h4>
              <div className="flex items-center gap-4 text-[10px] text-[#3a1224]/40 font-bold uppercase tracking-widest">
                <Users className="w-3 h-3" /> {venue.capacity} Pax
                <div className="w-1 h-1 rounded-full bg-[#C0A04C]" />
                {venue.category || 'Event Venue'}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border border-dashed border-[#3a1224]/10">
             <p className="text-[#3a1224]/30 font-display italic">No similar venues found in this area.</p>
          </div>
        )}
      </div>
    </section>
  );
};
