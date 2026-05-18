'use client';

import { useState } from 'react';
import { Check, Edit2, ShieldCheck, Sparkles, UtensilsCrossed } from 'lucide-react';
import { getSlotMultiplier } from '../../utils/booking.utils';
import { SLOT_LABELS } from 'constants/slots';
import toast from 'react-hot-toast';
import { cn } from 'components/site/SitePrimitives';

const formatDate = (d) => {
  if (!d) return '—';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return d;
};

export default function StepBookingReview({
  hall,
  bookingData,
  calculateTotal,
  onPrev,
  onNext,
  onEditStep,
}) {
  const [termsAccepted, setTermsAccepted] = useState(false);

  const pricePerHour = Number(hall?.pricePerHour) || Number(hall?.price) || Number(hall?.costPerHour) || 0;
  const multiplier = getSlotMultiplier(bookingData?.slot);
  const hallPrice = pricePerHour * multiplier;
  const total = calculateTotal();
  const isOrganizer = bookingData.bookingPurpose === 'organizer';

  const handleSubmit = () => {
    if (!termsAccepted) {
      toast.error('Please accept the terms and conditions to proceed.');
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-4">
      {/* Venue & booking */}
      <ReviewCard label="Venue & booking" onEdit={() => onEditStep('availability')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <ReviewRow label="Hall" value={hall?.name} />
          <ReviewRow label="Date" value={formatDate(bookingData.date)} />
          <ReviewRow label="Time slot" value={SLOT_LABELS[bookingData.slot] || bookingData.slot} />
          <ReviewRow
            label="Guests"
            value={`${bookingData.guests || 0} guest${bookingData.guests === 1 ? '' : 's'}`}
          />
          <ReviewRow
            label="Booking type"
            value={isOrganizer ? 'Organizer venue booking' : 'Private booking'}
          />
        </div>
      </ReviewCard>

      {/* Contact information */}
      <ReviewCard label="Contact information" onEdit={() => onEditStep('contact')}>
        <div className="grid gap-3 sm:grid-cols-2">
          <ReviewRow label="Full name" value={bookingData.fullName} />
          <ReviewRow label="Phone" value={bookingData.phone} />
          <ReviewRow label="Email" value={bookingData.email} />
          {bookingData.deliveryAddress && (
            <ReviewRow
              label="Address"
              value={[bookingData.deliveryAddress, bookingData.city].filter(Boolean).join(', ')}
              colSpan
            />
          )}
        </div>
      </ReviewCard>

      {/* Event details */}
      {!isOrganizer && (bookingData.eventType || bookingData.eventName) && (
        <ReviewCard label="Event details" onEdit={() => onEditStep('details')}>
          <div className="grid gap-3 sm:grid-cols-2">
            {bookingData.eventType && <ReviewRow label="Event type" value={bookingData.eventType} />}
            {bookingData.eventName && <ReviewRow label="Event name" value={bookingData.eventName} />}
            {bookingData.specialRequirements && (
              <ReviewRow label="Special requirements" value={bookingData.specialRequirements} colSpan />
            )}
          </div>
        </ReviewCard>
      )}

      {/* Menu */}
      {!isOrganizer && Number(bookingData.menuTotal) > 0 && (
        <ReviewCard
          label="Menu selection"
          onEdit={() => onEditStep('menu')}
          icon={<UtensilsCrossed className="h-3.5 w-3.5" />}
        >
          {bookingData.selectedPackage ? (
            <div className="flex items-center justify-between rounded-xl bg-[#fbf8f2] px-4 py-3">
              <div>
                <p className="text-sm font-black text-[#3a1224]">{bookingData.selectedPackage.name}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[#3a1224]/45">Package</p>
              </div>
              <p className="text-sm font-black text-[#3a1224]">
                NPR {Number(bookingData.menuTotal).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {bookingData.selectedMenu?.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-[#fbf8f2] px-4 py-2.5"
                >
                  <div>
                    <p className="text-sm font-bold text-[#3a1224]">{item.name}</p>
                    {item.category && (
                      <p className="text-[10px] uppercase tracking-wide text-[#3a1224]/45">
                        {item.category}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#3a1224]">× {item.quantity}</p>
                    <p className="text-xs text-[#3a1224]/55">
                      NPR {Number(item.price || item.pricePerUnit || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between rounded-xl border border-[#e8dcc8] px-4 py-2.5">
                <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/50">
                  Menu total
                </span>
                <span className="text-sm font-black text-[#3a1224]">
                  NPR {Number(bookingData.menuTotal).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </ReviewCard>
      )}

      {/* Decorations */}
      {!isOrganizer && Number(bookingData.decorationTotal) > 0 && (
        <ReviewCard
          label="Decorations"
          onEdit={() => onEditStep('decor')}
          icon={<Sparkles className="h-3.5 w-3.5" />}
        >
          <div className="space-y-2">
            {bookingData.decorationScheme && (
              <div className="flex items-center justify-between rounded-xl bg-[#fbf8f2] px-4 py-2.5">
                <p className="text-sm font-bold text-[#3a1224]">{bookingData.decorationScheme.name}</p>
                <p className="text-sm font-black text-[#3a1224]">
                  NPR {Number(bookingData.decorationScheme.price || 0).toLocaleString()}
                </p>
              </div>
            )}
            {bookingData.addons?.map((addon, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-[#fbf8f2] px-4 py-2.5"
              >
                <p className="text-sm font-bold text-[#3a1224]">{addon.name}</p>
                <p className="text-sm font-black text-[#3a1224]">
                  NPR {Number(addon.price || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </ReviewCard>
      )}

      {/* Pricing summary */}
      <div className="rounded-2xl bg-[#3a1224] p-5 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">
          Price breakdown
        </p>
        <div className="mt-4 space-y-2.5">
          <PriceRow label={`Hall rental (${multiplier}h)`} value={hallPrice} />
          {!isOrganizer && Number(bookingData.menuTotal) > 0 && (
            <PriceRow label="Menu" value={Number(bookingData.menuTotal)} />
          )}
          {!isOrganizer && Number(bookingData.decorationTotal) > 0 && (
            <PriceRow label="Decorations" value={Number(bookingData.decorationTotal)} />
          )}
        </div>
        <div className="mt-4 flex items-end justify-between border-t border-white/15 pt-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">Total</p>
            <p className="mt-0.5 text-xs text-white/50">Before payment confirmation</p>
          </div>
          <p className="text-2xl font-black text-white">NPR {total.toLocaleString()}</p>
        </div>
      </div>

      {/* Terms */}
      <div className="rounded-2xl border border-[#e8dcc8] bg-[#fbf8f2] p-4">
        <div className="flex items-start gap-3 text-xs leading-5 text-[#3a1224]/65">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#C0A04C]" />
          <ul className="space-y-1">
            <li>All information provided is accurate and complete</li>
            <li>Slot is held for 5 minutes once payment starts — it must be completed in time</li>
            <li>Cancellations are subject to the venue's refund policy</li>
          </ul>
        </div>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <span
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition',
              termsAccepted ? 'border-[#C0A04C] bg-[#C0A04C]' : 'border-[#d4c4a8] bg-white'
            )}
          >
            {termsAccepted && <Check className="h-3 w-3 text-white" />}
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="sr-only"
            />
          </span>
          <span className="text-sm font-bold text-[#3a1224]">
            I confirm all details are correct and agree to the terms and conditions.
          </span>
        </label>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-[#e8dcc8] bg-white text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224] transition hover:bg-[#f8f4ed]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!termsAccepted}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#3a1224] text-[11px] font-black uppercase tracking-[0.18em] text-[#C0A04C] transition hover:bg-[#4a172d] disabled:opacity-50"
        >
          Proceed to payment
        </button>
      </div>
    </div>
  );
}

function ReviewCard({ label, onEdit, icon, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e8dcc8] bg-white">
      <div className="flex items-center justify-between border-b border-[#e8dcc8] bg-[#fbf8f2] px-4 py-3">
        <div className="flex items-center gap-2 text-[#C0A04C]">
          {icon}
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">{label}</p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/45 transition hover:bg-[#e8dcc8] hover:text-[#3a1224]"
        >
          <Edit2 className="h-3 w-3" />
          Edit
        </button>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ReviewRow({ label, value, colSpan = false }) {
  return (
    <div className={cn('space-y-0.5', colSpan && 'sm:col-span-2')}>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/40">{label}</p>
      <p className="text-sm font-bold text-[#3a1224]">{value || '—'}</p>
    </div>
  );
}

function PriceRow({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/60">{label}</span>
      <span className="font-black text-white">NPR {Number(value || 0).toLocaleString()}</span>
    </div>
  );
}
