'use client';

import { Search } from 'lucide-react';
import { CalendarPicker } from 'components/ui/CalendarPicker';

const fieldCls =
  'w-full rounded-2xl border border-[#e8dcc8] bg-[#fbf8f2] px-4 py-3 text-sm font-medium text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15 hover:border-[#d4c4a8]';

export const AvailabilityForm = ({
  watch,
  setValue,
  register,
  handleSubmit,
  checkAvailability,
  isSubmitting,
  errors,
  minDate,
  disableMorning,
  disableAfternoon,
  disableEvening,
  SLOT_LABELS,
}) => {
  const date = watch('date');

  return (
    <form
      onSubmit={handleSubmit(checkAvailability)}
      className="rounded-2xl border border-[#e8dcc8] bg-white p-5 shadow-sm"
    >
      <div className="grid gap-5 sm:grid-cols-[1fr_1.3fr_0.7fr_auto] sm:items-start">

        {/* Calendar */}
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/50">
            Date
          </label>
          <CalendarPicker
            value={date}
            onChange={(iso) => setValue('date', iso)}
            minDate={minDate}
          />
          {errors.date && <p className="mt-1.5 text-xs font-bold text-red-600">• {errors.date.message}</p>}
          {/* hidden field so react-hook-form validation still works */}
          <input type="hidden" {...register('date', {
            required: 'Choose an event date.',
            validate: (v) => v >= minDate || 'Bookings must be made at least 1 day in advance.',
          })} />
        </div>

        {/* Slot */}
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/50">
            Time slot
          </label>
          <select
            {...register('slot', { required: 'Choose a time slot.' })}
            className={`${fieldCls} cursor-pointer`}
          >
            <option value="">Select slot</option>
            <option value="morning" disabled={disableMorning}>{SLOT_LABELS.morning}</option>
            <option value="afternoon" disabled={disableAfternoon}>{SLOT_LABELS.afternoon}</option>
            <option value="evening" disabled={disableEvening}>{SLOT_LABELS.evening}</option>
            <option value="wholeday">{SLOT_LABELS.wholeday}</option>
          </select>
          {errors.slot && <p className="mt-1.5 text-xs font-bold text-red-600">• {errors.slot.message}</p>}
        </div>

        {/* Guests */}
        <div>
          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[#3a1224]/50">
            Guests
          </label>
          <input
            type="number"
            min="1"
            placeholder="50"
            {...register('guests', {
              required: 'Enter guest count.',
              min: { value: 1, message: 'At least 1 guest.' },
            })}
            className={fieldCls}
          />
          {errors.guests && <p className="mt-1.5 text-xs font-bold text-red-600">• {errors.guests.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#3a1224] px-5 text-[11px] font-black uppercase tracking-[0.18em] text-[#C0A04C] transition hover:bg-[#4a172d] disabled:opacity-50 sm:mt-[28px]"
        >
          {isSubmitting ? (
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#C0A04C] border-t-transparent" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
          {isSubmitting ? 'Checking…' : 'Check'}
        </button>
      </div>
    </form>
  );
};
