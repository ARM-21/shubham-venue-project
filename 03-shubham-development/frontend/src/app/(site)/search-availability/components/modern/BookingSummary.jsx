'use client';

import { ArrowRight, CalendarCheck, Clock, Lock, MapPin, Users } from 'lucide-react';

function getMissingMessage({ selectedHall, date, slot, guests, selectedAvailable }) {
  if (!date || !slot || !guests) return 'Add date, slot, and guest count first.';
  if (!selectedHall) return 'Select an available hall to continue.';
  if (selectedAvailable === false) return 'This hall is not available for the selected details.';
  return '';
}

export const BookingSummary = ({
  selectedHall,
  date,
  slot,
  guests,
  SLOT_LABELS,
  canProceed,
  handleProceedToBooking,
  user,
  selectedAvailable
}) => {
  const price = selectedHall?.pricePerHour
    ? `${selectedHall.currency || 'NPR'} ${selectedHall.pricePerHour.toLocaleString()}`
    : 'Select hall';
  const missingMessage = getMissingMessage({ selectedHall, date, slot, guests, selectedAvailable });

  return (
    <div className="rounded-[1.7rem] border border-[#C0A04C]/25 bg-[#3a1224] p-5 text-white shadow-[0_28px_80px_rgba(58,18,36,0.24)] sm:p-6">
      <div className="mb-6">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C0A04C]">Booking Summary</p>
        <h2 className="mt-2 text-2xl font-black">Ready when the fit is right.</h2>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Your selected details will carry into the booking step.
        </p>
      </div>

      <div className="space-y-3">
        <SummaryRow icon={MapPin} label="Hall" value={selectedHall?.name || 'No hall selected'} />
        <SummaryRow icon={CalendarCheck} label="Date" value={date || 'Choose date'} />
        <SummaryRow icon={Clock} label="Slot" value={SLOT_LABELS[slot] || 'Choose slot'} />
        <SummaryRow icon={Users} label="Guests" value={guests ? `${guests} guests` : 'Add guests'} />
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.08] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C0A04C]">Estimated venue price</p>
        <p className="mt-2 text-3xl font-black">{price}</p>
        <p className="text-xs text-white/50">per selected slot</p>
      </div>

      {!canProceed && missingMessage ? (
        <p className="mt-4 rounded-xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm leading-6 text-white/[0.65]">
          {missingMessage}
        </p>
      ) : null}

      <button
        type="button"
        onClick={handleProceedToBooking}
        disabled={!canProceed}
        className={`mt-5 flex w-full items-center justify-center gap-3 rounded-full px-5 py-4 text-sm font-black uppercase tracking-[0.14em] transition ${
          canProceed
            ? 'cursor-pointer bg-[#C0A04C] text-[#3a1224] hover:bg-[#d2b95f]'
            : 'cursor-not-allowed bg-white/10 text-white/[0.35]'
        }`}
      >
        {user ? 'Continue booking' : 'Login to continue'}
        {user ? <ArrowRight className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
      </button>
    </div>
  );
};

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.08] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C0A04C] text-[#3a1224]">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#C0A04C]">{label}</p>
        <p className="truncate text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}
