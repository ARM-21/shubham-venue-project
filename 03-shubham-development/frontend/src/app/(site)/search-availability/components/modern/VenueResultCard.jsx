'use client';

import React from 'react';
import { ArrowRight, Check, MapPin, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const VenueResultCardComponent = ({ venue, isSelected, onSelect }) => {
  const isAvailable = venue.available !== false;
  const city = venue.location?.city || venue.location?.address || 'Location listed';
  const price = venue.pricePerHour ? `${venue.currency || 'NPR'} ${venue.pricePerHour.toLocaleString()}` : 'Price listed';

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className={`rounded-2xl border bg-white p-4 transition ${
        isSelected
          ? 'border-[#C0A04C] shadow-[0_20px_50px_rgba(192,160,76,0.18)]'
          : 'border-[#eadcc7] shadow-sm hover:border-[#C0A04C]/60'
      } ${isAvailable ? '' : 'opacity-60'}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
              isAvailable ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {isAvailable ? 'Available' : 'Reserved'}
            </span>
            {isSelected ? (
              <span className="rounded-full bg-[#C0A04C]/15 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#3a1224]">
                Selected
              </span>
            ) : null}
          </div>

          <h3 className="truncate text-xl font-black text-[#3a1224]">{venue.name}</h3>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#3a1224]/50">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#C0A04C]" />
              {city}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-[#C0A04C]" />
              {venue.capacity || '—'} guests
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4 border-t border-[#3a1224]/5 pt-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#C0A04C]">Starting price</p>
          <p className="mt-1 text-2xl font-black text-[#3a1224]">{price}</p>
          <p className="text-xs text-[#3a1224]/50">per slot</p>
        </div>

        <button
          type="button"
          onClick={() => isAvailable && onSelect(venue)}
          disabled={!isAvailable}
          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.12em] transition disabled:cursor-not-allowed ${
            isAvailable
              ? isSelected
                ? 'bg-[#C0A04C] text-[#3a1224]'
                : 'bg-[#3a1224] text-white hover:bg-[#4a172d]'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {isSelected ? (
            <>
              <Check className="h-4 w-4" />
              Selected
            </>
          ) : (
            <>
              Select hall
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </motion.article>
  );
};

export const VenueResultCard = React.memo(VenueResultCardComponent);
