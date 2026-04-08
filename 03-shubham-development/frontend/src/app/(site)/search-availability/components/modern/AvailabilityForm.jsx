'use client';
import React from 'react';
import { Calendar, Users, Clock, Sparkles } from 'lucide-react';

export const AvailabilityForm = ({ register, handleSubmit, checkAvailability, isSubmitting, errors, minDate, disableMorning, disableAfternoon, disableEvening, SLOT_LABELS }) => {
  return (
    <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-[0_20px_50px_rgba(58,18,36,0.05)] border border-gray-100 overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-[1px] bg-[#C0A04C]" />
        <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Check Availability</span>
      </div>

      <form onSubmit={handleSubmit(checkAvailability)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 items-end">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#3a1224] uppercase tracking-[0.2em] flex items-center gap-2">
            <Calendar className="w-3 h-3 text-[#C0A04C]" /> Date
          </label>
          <input
            type="date"
            min={minDate}
            {...register('date', { required: 'Date is required' })}
            className="w-full px-5 py-4 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C0A04C]/20 transition-all text-sm font-medium text-[#3a1224]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#3a1224] uppercase tracking-[0.2em] flex items-center gap-2">
            <Clock className="w-3 h-3 text-[#C0A04C]" /> Time Slot
          </label>
          <select
            {...register('slot', { required: 'Slot is required' })}
            className="w-full px-5 py-4 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C0A04C]/20 transition-all text-sm font-medium text-[#3a1224] appearance-none"
          >
            <option value="">Select Slot</option>
            <option value="morning" disabled={disableMorning}>Morning (08:00 AM - 01:00 PM)</option>
            <option value="afternoon" disabled={disableAfternoon}>Afternoon (01:00 PM - 05:00 PM)</option>
            <option value="evening" disabled={disableEvening}>Evening (05:00 PM - 11:00 PM)</option>
            <option value="wholeday">Whole Day (08:00 AM - 11:00 PM)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-[#3a1224] uppercase tracking-[0.2em] flex items-center gap-2">
            <Users className="w-3 h-3 text-[#C0A04C]" /> Guests
          </label>
          <input
            type="number"
            {...register('guests', { required: true, min: 1 })}
            className="w-full px-5 py-4 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C0A04C]/20 transition-all text-sm font-medium text-[#3a1224]"
            placeholder="Pax"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-[#3a1224] text-[#C0A04C] rounded-xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:bg-[#4a172d] transition-all disabled:opacity-50"
        >
          {isSubmitting ? <><div className="w-4 h-4 border-2 border-[#C0A04C] border-t-transparent rounded-full animate-spin" /> Checking...</> : <><Sparkles className="w-4 h-4" /> Check Availability</>}
        </button>
      </form>
      {Object.keys(errors).length > 0 && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-4">Please fill all fields correctly.</p>}
    </div>
  );
};
