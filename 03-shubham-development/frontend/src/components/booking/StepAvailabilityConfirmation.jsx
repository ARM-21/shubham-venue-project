'use client';

import { useState, useEffect } from 'react';
import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import { AlertCircle, CalendarDays, Check, Clock, RefreshCw, Users } from 'lucide-react';
import { ROUTES } from 'config/routes';
import { BOOKING_LEAD_TIME_MESSAGE, SLOT_LABELS } from 'constants/slots';
import { cn } from 'components/site/SitePrimitives';

export default function StepAvailabilityConfirmation({
  hallId,
  date,
  slot,
  guests,
  reservationId,
  onConfirm,
  onChangeSelection,
}) {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const getUnavailableMessage = () => {
    if (availability?.message) return availability.message;
    if (availability?.reason === 'LEAD_TIME_REQUIRED') return BOOKING_LEAD_TIME_MESSAGE;
    if (availability?.reason === 'PAST_DATE') return 'Past dates cannot be booked.';
    if (availability?.reason === 'EXCEEDS_CAPACITY') return "Guest count exceeds this hall's capacity.";
    if (availability?.reason === 'BOOKED') return 'This slot is already reserved.';
    return 'This slot is no longer available. Please try another time.';
  };

  useEffect(() => {
    checkAvailability();
  }, [hallId, date, slot, guests]);

  const checkAvailability = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.post(ROUTES.API.BOOKINGS.CHECK_AVAILABILITY(hallId), {
        date,
        slot,
        guests,
        reservationId,
      });
      setAvailability(res.data);
    } catch {
      toast.error('Failed to check availability');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!availability?.available) {
      toast.error('Selected slot is no longer available');
      return;
    }
    setConfirming(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      onConfirm();
    } finally {
      setConfirming(false);
    }
  };

  const isAvailable = availability?.available;
  const hasAlternatives = availability?.alternativeSlots?.length > 0;

  const formatDate = (d) => {
    if (!d) return '—';
    if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      return new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    }
    return d;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[#e8dcc8] border-t-[#C0A04C]" />
        <p className="text-sm font-bold text-[#3a1224]/50">Checking availability…</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Status banner */}
      <div className={cn(
        'flex items-start gap-4 rounded-2xl border p-4',
        isAvailable ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
      )}>
        <span className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          isAvailable ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
        )}>
          {isAvailable ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
        </span>
        <div>
          <p className={cn('text-sm font-black', isAvailable ? 'text-emerald-900' : 'text-red-900')}>
            {isAvailable ? 'Slot is available' : 'Slot unavailable'}
          </p>
          <p className={cn('mt-1 text-sm leading-5', isAvailable ? 'text-emerald-700' : 'text-red-700')}>
            {isAvailable
              ? 'Your selected date, time, and guest count are open. Confirm to continue.'
              : getUnavailableMessage()}
          </p>
        </div>
      </div>

      {/* Booking details */}
      <div className="space-y-3 rounded-2xl border border-[#e8dcc8] bg-[#fbf8f2] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">Your selection</p>
        <DetailRow
          icon={<CalendarDays className="h-4 w-4" />}
          label="Date"
          value={formatDate(date)}
        />
        <DetailRow
          icon={<Clock className="h-4 w-4" />}
          label="Time slot"
          value={SLOT_LABELS[slot] || slot}
        />
        <DetailRow
          icon={<Users className="h-4 w-4" />}
          label="Guests"
          value={`${guests} guest${guests !== 1 ? 's' : ''}`}
        />
      </div>

      {/* 5-minute hold notice */}
      {isAvailable && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <span>
            This slot will be softly held for <strong>5 minutes</strong> once you proceed to
            payment. No charge until then.
          </span>
        </div>
      )}

      {/* Alternative slots */}
      {!isAvailable && hasAlternatives && (
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">
            Available alternatives
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {availability.alternativeSlots.map((alt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  onChangeSelection({ slot: alt.slot, date: alt.date });
                  checkAvailability();
                }}
                className="rounded-2xl border border-[#e8dcc8] bg-white px-4 py-3 text-left transition hover:border-[#C0A04C]/60 hover:bg-[#fbf8f2]"
              >
                <p className="text-sm font-black text-[#3a1224]">{alt.date}</p>
                <p className="mt-0.5 text-xs text-[#3a1224]/55">
                  {SLOT_LABELS[alt.slot] || alt.slot}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onChangeSelection}
          className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-[#e8dcc8] bg-white text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224] transition hover:bg-[#f8f4ed]"
        >
          Change selection
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isAvailable || confirming}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#3a1224] text-[11px] font-black uppercase tracking-[0.18em] text-[#C0A04C] transition hover:bg-[#4a172d] disabled:opacity-50"
        >
          {confirming ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Confirming…
            </>
          ) : (
            'Confirm & continue'
          )}
        </button>
      </div>
    </div>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#C0A04C] shadow-sm">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/45">
          {label}
        </span>
        <span className="mt-0.5 block text-sm font-bold text-[#3a1224]">{value}</span>
      </span>
    </div>
  );
}
