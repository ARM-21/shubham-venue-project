'use client';

import { Lock } from 'lucide-react';
import { cn } from 'components/site/SitePrimitives';

function getMissingMessage({ selectedHall, date, slot, guests, selectedAvailable }) {
  if (!date || !slot || !guests) return 'Add date, slot, and guest count first.';
  if (!selectedHall) return 'Select an available hall to continue.';
  if (selectedAvailable === false) return 'This hall is not available for the selected details.';
  return '';
}

const formatDate = (d) => {
  if (!d) return null;
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }
  return d;
};

export const BookingSummary = ({
  selectedHall,
  date,
  slot,
  guests,
  SLOT_LABELS,
  canProceed,
  handleProceedToBooking,
  user,
  selectedAvailable,
}) => {
  const price = selectedHall?.pricePerHour
    ? `${selectedHall.currency || 'NPR'} ${Number(selectedHall.pricePerHour).toLocaleString()}`
    : null;
  const missingMessage = getMissingMessage({ selectedHall, date, slot, guests, selectedAvailable });

  return (
    <div className="rounded-2xl border border-[#C0A04C]/20 bg-[#3a1224] p-5 text-white">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">
        Booking summary
      </p>

      <div className="mt-4 divide-y divide-white/10">
        <SummaryRow label="Hall" value={selectedHall?.name || '—'} />
        <SummaryRow label="Date" value={formatDate(date) || '—'} />
        <SummaryRow label="Slot" value={SLOT_LABELS[slot] || '—'} />
        <SummaryRow label="Guests" value={guests ? `${guests} guests` : '—'} />
        {price && <SummaryRow label="From" value={price} highlight />}
      </div>

      {!canProceed && missingMessage && (
        <p className="mt-4 text-xs leading-5 text-white/45">{missingMessage}</p>
      )}

      <button
        type="button"
        onClick={handleProceedToBooking}
        disabled={!canProceed}
        className={cn(
          'mt-5 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[11px] font-black uppercase tracking-[0.18em] transition',
          canProceed
            ? 'bg-[#C0A04C] text-[#3a1224] hover:bg-[#d2b95f]'
            : 'cursor-not-allowed bg-white/10 text-white/30'
        )}
      >
        {user ? 'Continue to booking' : 'Log in to continue'}
        {!user && <Lock className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
};

function SummaryRow({ label, value, highlight }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">{label}</span>
      <span className={cn('text-right text-sm font-bold', highlight ? 'text-[#C0A04C]' : 'text-white')}>
        {value}
      </span>
    </div>
  );
}
