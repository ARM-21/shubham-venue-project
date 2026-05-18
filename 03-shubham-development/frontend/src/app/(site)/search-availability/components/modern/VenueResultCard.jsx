'use client';

import React from 'react';
import { Check, MapPin, Users } from 'lucide-react';
import { cn } from 'components/site/SitePrimitives';

const VenueResultCardComponent = ({ venue, isSelected, onSelect }) => {
  const isAvailable = venue.available !== false;
  const city = venue.location?.city || venue.location?.address || '';
  const price = venue.pricePerHour
    ? `${venue.currency || 'NPR'} ${Number(venue.pricePerHour).toLocaleString()}`
    : '—';

  return (
    <article
      className={cn(
        'rounded-2xl border bg-white p-4 transition',
        isSelected
          ? 'border-[#C0A04C] shadow-[0_0_0_1px_#C0A04C]'
          : 'border-[#e8dcc8] hover:border-[#C0A04C]/50',
        !isAvailable && 'opacity-55'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-[#3a1224]">{venue.name}</h3>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#3a1224]/50">
            {city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 shrink-0 text-[#C0A04C]" />
                {city}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 shrink-0 text-[#C0A04C]" />
              {venue.capacity || '—'} capacity
            </span>
          </div>
        </div>
        <span
          className={cn(
            'shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.16em]',
            isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-[#f5f0eb] text-[#3a1224]/40'
          )}
        >
          {isAvailable ? 'Available' : 'Reserved'}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#e8dcc8] pt-3">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">From</p>
          <p className="mt-0.5 text-lg font-black text-[#3a1224]">{price}</p>
          <p className="text-[10px] text-[#3a1224]/40">per slot</p>
        </div>

        <button
          type="button"
          onClick={() => isAvailable && onSelect(venue)}
          disabled={!isAvailable}
          className={cn(
            'flex h-9 items-center gap-1.5 rounded-2xl px-4 text-[11px] font-black uppercase tracking-[0.14em] transition disabled:cursor-not-allowed',
            isSelected
              ? 'bg-[#C0A04C]/15 text-[#3a1224]'
              : isAvailable
              ? 'bg-[#3a1224] text-[#C0A04C] hover:bg-[#4a172d]'
              : 'bg-[#f5f0eb] text-[#3a1224]/30'
          )}
        >
          {isSelected && <Check className="h-3.5 w-3.5" />}
          {isSelected ? 'Selected' : 'Select'}
        </button>
      </div>
    </article>
  );
};

export const VenueResultCard = React.memo(VenueResultCardComponent);
