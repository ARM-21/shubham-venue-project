'use client';

import React, { useState } from 'react';
import { DateTime } from 'luxon';
import { useForm } from 'react-hook-form';

const SLOT_LABELS = {
  morning: 'Morning (08:00–13:00)',
  evening: 'Evening (17:00–23:00)',
  wholeday: 'Whole day (08:00–23:00)',
};

export default function CheckAvailability({ hallId, hallName, hallCapacity, showAllHalls }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { guests: hallCapacity ? Math.min(50, hallCapacity) : 50 }
  });

  const date = watch('date');
  const slot = watch('slot');
  const guests = watch('guests');

  const TZ = 'Asia/Kathmandu';
  const now = DateTime.now().setZone(TZ);
  const todayStr = now.toFormat('yyyy-MM-dd');
  const currentHour = now.hour;
  const isToday = date === todayStr;

  const disableMorning = isToday && currentHour >= 13;
  const disableEvening = isToday && currentHour >= 23;

  async function checkAvailability(formData) {
    setStatus(null);
    setError(null);
    try {
      const url = hallId
        ? `/api/v1/halls/${hallId}/availability`
        : `/api/v1/halls/availability?date=${formData.date}&slot=${formData.slot}&guests=${formData.guests}`;

      const res = await fetch(url, {
        method: hallId ? 'POST' : 'GET',
        headers: hallId ? { 'Content-Type': 'application/json' } : undefined,
        body: hallId ? JSON.stringify(formData) : null,
      });

      const data = await res.json();

      if (!res.ok) setError(data.message || 'Failed to check availability');
      else setStatus(data);
    } catch {
      setError('Network error');
    }
  }

  const minDate = now.startOf('day').toFormat('yyyy-MM-dd');

  return (
    <div className="max-w-3xl mx-auto p-6 border rounded-md shadow-sm mb-6">
      <h2 className="text-xl font-semibold mb-4">{hallName ?? 'Check Availability'}</h2>

      <form onSubmit={handleSubmit(checkAvailability)} className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600">Date</label>
          <input type="date" min={minDate} {...register('date', { required: 'Date is required' })} className="mt-1 w-full border rounded-md p-2 text-sm" />
          {errors.date && <p className="text-xs text-red-600">{errors.date.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600">Slot</label>
          <select {...register('slot', { required: 'Slot is required' })} defaultValue="" className="mt-1 w-full border rounded-md p-2 text-sm">
            <option value="" disabled>Select Slot</option>
            <option value="morning" disabled={disableMorning}>{SLOT_LABELS.morning}</option>
            <option value="evening" disabled={disableEvening}>{SLOT_LABELS.evening}</option>
            <option value="wholeday" disabled={disableMorning && disableEvening}>{SLOT_LABELS.wholeday}</option>
          </select>
          {errors.slot && <p className="text-xs text-red-600">{errors.slot.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600">Guests</label>
          <input type="number" {...register('guests', { required: 'Guests is required', min: 1, max: hallCapacity })} className="mt-1 w-full border rounded-md p-2 text-sm" />
          {hallCapacity && <p className="text-xs text-gray-400 mt-1">Capacity: {hallCapacity}</p>}
          {errors.guests && <p className="text-xs text-red-600">{errors.guests.message}</p>}
        </div>

        <div className="flex items-end">
          <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">
            {isSubmitting ? 'Checking...' : 'Check Availability'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {status && Array.isArray(status) && showAllHalls && (
        <div className="space-y-2">
          {status.map(h => (
            <div key={h.id} className="p-2 border rounded-md flex justify-between items-center">
              <div>{h.name} - Capacity: {h.capacity}</div>
              {h.available ? (
                <a href={`/venues/${h.id}/book?date=${date}&slot=${slot}&guests=${guests}`} className="px-3 py-1 bg-emerald-600 text-white rounded-md text-sm">
                  Book Now
                </a>
              ) : (
                <span className="text-red-600 text-sm">Not Available</span>
              )}
            </div>
          ))}
        </div>
      )}

      {status && !Array.isArray(status) && hallId && (
        <div className={`p-3 rounded-md ${status.available ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
          {status.available ? (
            <>
              <div className="text-sm font-semibold text-emerald-800">Available</div>
              <a href={`/venues/${hallId}/book?date=${date}&slot=${slot}&guests=${guests}`} className="mt-2 inline-block px-3 py-1 bg-emerald-600 text-white rounded-md text-sm">Book Now</a>
            </>
          ) : (
            <div className="text-sm font-semibold text-red-800">Not available</div>
          )}
        </div>
      )}
    </div>
  );
}
