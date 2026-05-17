'use client';

import { Calendar, Clock, Search, Users } from 'lucide-react';

export const AvailabilityForm = ({
  register,
  handleSubmit,
  checkAvailability,
  isSubmitting,
  errors,
  minDate,
  disableMorning,
  disableAfternoon,
  disableEvening,
  SLOT_LABELS
}) => {
  return (
    <div className="rounded-[1.7rem] border border-[#eadcc7] bg-white p-4 shadow-[0_24px_70px_rgba(58,18,36,0.12)] sm:p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C0A04C]">Check Availability</p>
          <h2 className="mt-2 text-2xl font-black text-[#3a1224]">Start with event details.</h2>
        </div>
        <p className="max-w-md text-sm leading-6 text-[#3a1224]/55">
          Search by date, slot, and guest count before choosing a hall. Bookings start from tomorrow.
        </p>
      </div>

      <form onSubmit={handleSubmit(checkAvailability)} className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_1.15fr_0.8fr_auto] lg:items-start">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]">
            <Calendar className="h-3.5 w-3.5 text-[#C0A04C]" />
            Date
          </label>
          <input
            type="date"
            min={minDate}
            {...register('date', {
              required: 'Choose an event date.',
              validate: (value) => value >= minDate || 'Bookings must be made at least 1 day in advance.'
            })}
            className="w-full cursor-pointer rounded-xl border border-[#eadcc7] bg-[#fdfaf6] px-4 py-3.5 text-sm font-semibold text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20"
          />
          {errors.date ? <p className="text-xs font-semibold text-red-600">{errors.date.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]">
            <Clock className="h-3.5 w-3.5 text-[#C0A04C]" />
            Time Slot
          </label>
          <select
            {...register('slot', { required: 'Choose a time slot.' })}
            className="w-full cursor-pointer rounded-xl border border-[#eadcc7] bg-[#fdfaf6] px-4 py-3.5 text-sm font-semibold text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20"
          >
            <option value="">Select slot</option>
            <option value="morning" disabled={disableMorning}>{SLOT_LABELS.morning}</option>
            <option value="afternoon" disabled={disableAfternoon}>{SLOT_LABELS.afternoon}</option>
            <option value="evening" disabled={disableEvening}>{SLOT_LABELS.evening}</option>
            <option value="wholeday">{SLOT_LABELS.wholeday}</option>
          </select>
          {errors.slot ? <p className="text-xs font-semibold text-red-600">{errors.slot.message}</p> : null}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]">
            <Users className="h-3.5 w-3.5 text-[#C0A04C]" />
            Guests
          </label>
          <input
            type="number"
            min="1"
            {...register('guests', {
              required: 'Enter guest count.',
              min: { value: 1, message: 'Guests must be at least 1.' }
            })}
            className="w-full rounded-xl border border-[#eadcc7] bg-[#fdfaf6] px-4 py-3.5 text-sm font-semibold text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/20"
            placeholder="Pax"
          />
          {errors.guests ? <p className="text-xs font-semibold text-red-600">{errors.guests.message || 'Enter guest count.'}</p> : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 inline-flex h-[50px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3a1224] px-6 text-sm font-black uppercase tracking-[0.14em] text-[#C0A04C] transition hover:bg-[#4a172d] disabled:cursor-not-allowed disabled:opacity-60 lg:mt-6"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#C0A04C] border-t-transparent" />
              Checking
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              Search
            </>
          )}
        </button>
      </form>
    </div>
  );
};
