import { Building2, CalendarDays, Clock, ShieldCheck, Users } from 'lucide-react';
import { getSlotMultiplier } from '../../utils/booking.utils';
import { SLOT_LABELS } from 'constants/slots';
import { resolveImage } from 'components/site/SitePrimitives';

const normalizeImage = (image) => {
  if (typeof image === 'string') return image;
  return image?.url || image?.secureUrl || image?.src || image?.path || image?.key || '';
};

const formatDisplayDate = (value) => {
  if (!value) return 'Not selected';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return value;
};

export default function BookingSidebarSummary({
  hall,
  bookingData,
  calculateTotal,
  isCompactView = false,
}) {
  const total = calculateTotal();
  const pricePerHour = Number(hall?.pricePerHour) || Number(hall?.price) || Number(hall?.costPerHour) || 0;
  const multiplier = getSlotMultiplier(bookingData?.slot);
  const hallPrice = pricePerHour * multiplier;
  const imageSrc = resolveImage(normalizeImage(hall?.images?.[0]), '/assets/business-images/placeholder2.jpg');

  return (
    <div className={`rounded-3xl border border-[#eadcc6] bg-white shadow-[0_16px_44px_-38px_rgba(58,18,36,0.65)] ${isCompactView ? 'p-3' : 'p-4'}`}>
      <div className="overflow-hidden rounded-2xl bg-[#f4eadb]">
        <img
          src={imageSrc}
          alt={hall?.name || 'Selected venue'}
          className="h-28 w-full object-cover"
        />
      </div>

      <div className="mt-4">
        <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">Booking summary</p>
        <h3 className="mt-1.5 text-lg font-black leading-tight text-[#3a1224]">{hall?.name || 'Selected venue'}</h3>
      </div>

      <div className="mt-4 space-y-2.5 rounded-2xl border border-[#eadcc6] bg-[#fbf8f2] p-3">
        <SummaryLine
          icon={<CalendarDays className="h-4 w-4" />}
          label="Date"
          value={formatDisplayDate(bookingData.date)}
        />
        <SummaryLine
          icon={<Clock className="h-4 w-4" />}
          label="Slot"
          value={SLOT_LABELS[bookingData.slot] || bookingData.slot || 'Not selected'}
        />
        <SummaryLine
          icon={<Users className="h-4 w-4" />}
          label="Guests"
          value={`${bookingData.guests || 0} guest${bookingData.guests === 1 ? '' : 's'}`}
        />
        <SummaryLine
          icon={<Building2 className="h-4 w-4" />}
          label="Purpose"
          value={bookingData.bookingPurpose === 'organizer' ? 'Organizer venue booking' : 'Private booking'}
        />
      </div>

      <div className="mt-4 space-y-2.5 border-t border-[#eadcc6] pt-4">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#3a1224]/50">Price details</p>
        <PriceLine label={`Hall rental (${multiplier}h)`} value={hallPrice} />
        {bookingData.bookingPurpose !== 'organizer' && Number(bookingData.menuTotal) > 0 ? (
          <PriceLine label="Menu" value={Number(bookingData.menuTotal)} />
        ) : null}
        {bookingData.bookingPurpose !== 'organizer' && Number(bookingData.decorationTotal) > 0 ? (
          <PriceLine label="Decoration" value={Number(bookingData.decorationTotal)} />
        ) : null}
      </div>

      <div className="mt-4 rounded-2xl bg-[#3a1224] p-4 text-white">
        <div className="flex items-end justify-between gap-3">
          <span>
            <span className="block text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">Total</span>
            <span className="mt-1 block text-xs text-white/60">Before final confirmation</span>
          </span>
          <span className="text-xl font-black">NPR {total.toLocaleString()}</span>
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-xs leading-5 text-emerald-800">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <span>Your slot is reserved only after the payment step starts.</span>
      </div>
    </div>
  );
}

function SummaryLine({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#C0A04C] shadow-sm">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/50">{label}</span>
        <span className="mt-1 block text-sm font-bold leading-5 text-[#3a1224]">{value}</span>
      </span>
    </div>
  );
}

function PriceLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-[#3a1224]/60">{label}</span>
      <span className="font-black text-[#3a1224]">NPR {Number(value || 0).toLocaleString()}</span>
    </div>
  );
}
