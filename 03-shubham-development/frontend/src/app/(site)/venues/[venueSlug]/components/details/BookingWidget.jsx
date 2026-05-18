"use client";
import { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';
import { BOOKING_LEAD_TIME_MESSAGE, SLOT_LABELS } from 'constants/slots';
import { CalendarPicker } from 'components/ui/CalendarPicker';

export const BookingWidget = ({
  venueData,
  currencyFormatter,
  minimumBookingDate,
  date,
  shift,
  setValue,
  handleSubmit,
  submitBooking,
}) => {
  const [availableSlots, setAvailableSlots] = useState(['morning', 'afternoon', 'evening', 'wholeday']);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotError, setSlotError] = useState(null);

  useEffect(() => {
    if (!date || !venueData?._id) {
      setAvailableSlots(['morning', 'afternoon', 'evening', 'wholeday']);
      return;
    }
    setSlotsLoading(true);
    setSlotError(null);
    const fetchSlots = async () => {
      try {
        const response = await axiosInstance.post(
          ROUTES.API.HALLS.BY_ID_AVAILABILITY(venueData._id),
          { date, slot: 'morning', guests: 50 }
        );
        const slots = response.data?.availableSlots || response.data?.slots || ['morning', 'afternoon', 'evening', 'wholeday'];
        const list = Array.isArray(slots) ? slots : ['morning', 'afternoon', 'evening', 'wholeday'];
        setAvailableSlots(list);
        setSlotError(null);
        if (list.length > 0 && !list.includes(shift)) setValue('slot', list[0]);
      } catch (err) {
        setSlotError(err?.response?.data?.message || err?.message || 'Failed to fetch slots');
        setAvailableSlots(['morning', 'afternoon', 'evening', 'wholeday']);
      } finally {
        setSlotsLoading(false);
      }
    };
    const t = setTimeout(fetchSlots, 300);
    return () => clearTimeout(t);
  }, [date, venueData?._id, shift, setValue]);

  const slotOptions = [
    { id: 'morning', label: SLOT_LABELS.morning },
    { id: 'afternoon', label: SLOT_LABELS.afternoon },
    { id: 'evening', label: SLOT_LABELS.evening },
    { id: 'wholeday', label: SLOT_LABELS.wholeday },
  ];

  return (
    <div className="lg:sticky lg:top-24 z-20">
      <div className="overflow-hidden rounded-3xl border border-[#eadcc6] bg-white shadow-[0_16px_44px_-38px_rgba(58,18,36,0.65)]">

        {/* Header */}
        <div className="bg-[#3a1224] p-5 sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#C0A04C]">Book this venue</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">
              {currencyFormatter.format(venueData?.pricePerHour || 0)}
            </span>
            <span className="text-sm text-white/60">/ slot</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/50">Capacity</span>
              <p className="mt-1 font-bold text-white">{venueData?.capacity || '—'} Guests</p>
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/50">Space</span>
              <p className="mt-1 font-bold text-white">{venueData?.size || 'Premium'}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-5 sm:p-6">
          <form className="space-y-6">

            {/* Date */}
            <div>
              <label className="mb-3 block text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/50">
                Select date
              </label>
              <CalendarPicker
                value={date}
                onChange={(iso) => setValue('date', iso)}
                minDate={minimumBookingDate}
              />
            </div>

            {/* Slot */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/50">
                  Time slot
                </label>
                {slotsLoading && (
                  <span className="text-[10px] font-bold text-[#C0A04C] animate-pulse">Checking…</span>
                )}
              </div>
              {slotError && (
                <p className="mb-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
                  Could not confirm live slots — you can still continue and we will verify on booking.
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {slotOptions.map((s) => {
                  const isAvailable = availableSlots.includes(s.id);
                  const isSelected = shift === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => isAvailable && setValue('slot', s.id)}
                      className={`rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
                        isSelected
                          ? 'border-[#3a1224] bg-[#3a1224] text-[#C0A04C]'
                          : isAvailable
                          ? 'border-[#e8dcc8] bg-[#fbf8f2] text-[#3a1224] hover:border-[#C0A04C]/50'
                          : 'border-[#e8dcc8] bg-[#f5f0eb] text-[#3a1224]/25 cursor-not-allowed'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); handleSubmit(submitBooking)(e); }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#3a1224] text-[11px] font-black uppercase tracking-[0.18em] text-[#C0A04C] transition hover:bg-[#3a1224]/90"
            >
              Check Availability
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#e8dcc8] bg-[#fbf8f2] px-4 py-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#C0A04C]" />
            <p className="text-xs leading-5 text-[#3a1224]/60">
              {BOOKING_LEAD_TIME_MESSAGE} Your selected details will carry into the booking step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
