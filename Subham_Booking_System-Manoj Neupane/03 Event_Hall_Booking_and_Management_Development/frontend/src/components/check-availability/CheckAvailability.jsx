'use client';

import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/contexts/AuthProvider';

const SLOT_LABELS = {
  morning: 'Morning (08:00–13:00)',
  evening: 'Evening (17:00–23:00)',
  wholeday: 'Whole day (08:00–23:00)',
};

export default function CheckAvailability({ hallId, hallName, hallSlug, hallCapacity, showAllHalls }) {
  const [status, setStatus] = useState(null);
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const router = useRouter();
  
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
      const payload = {
        date: formData.date,
        slot: formData.slot,
        guests: Number(formData.guests),
      };

      const res = hallId
        ? await axiosInstance.post(`/api/v1/halls/${hallId}/availability`, payload)
        : await axiosInstance.get(`/api/v1/halls/availability`, { params: payload });

      setStatus(res.data.halls || res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "Network error");
    }
  }

  const handleBookNow = (hall) => {
    if (!user) {
      // Save booking intent to localStorage
      const bookingIntent = {
        hallId: hall._id,
        hallSlug: hall.slug,
        hallName: hall.name,
        date,
        slot,
        guests,
        timestamp: Date.now()
      };
      
      localStorage.setItem('bookingIntent', JSON.stringify(bookingIntent));

      // Redirect to login with return URL
      const returnUrl = `/venues/${hall.slug}/book?date=${date}&slot=${slot}&guests=${guests}`;
      router.push(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
    } else {
      // User is authenticated, go to booking page
      router.push(`/venues/${hall.slug}/book?date=${date}&slot=${slot}&guests=${guests}`);
    }
  };

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

      {/* Multiple halls view */}
      {status && Array.isArray(status) && showAllHalls && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Available Halls</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {status.map(h => (
              <div
                key={h._id}
                className={`bg-white rounded-lg shadow-md border-2 overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  h.available ? 'border-emerald-200 hover:border-emerald-400' : 'border-gray-200 opacity-60'
                }`}
              >
                {/* Card Header */}
                <div className={`p-4 ${h.available ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                  <h4 className="text-lg font-semibold text-gray-800">{h.name}</h4>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">
                      <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Capacity: {h.capacity}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      h.available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {h.available ? 'Available' : 'Booked'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {date}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {SLOT_LABELS[slot]}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {guests} guests
                    </div>
                  </div>

                  {/* ✅ Changed: Button instead of <a> tag */}
                  {h.available ? (
                    <button
                      onClick={() => handleBookNow(h)}
                      className="block w-full text-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Book Now
                    </button>
                  ) : (
                    <button
                      disabled
                      className="block w-full text-center px-4 py-2 bg-gray-300 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed"
                    >
                      Not Available
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* No results message */}
          {status.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No halls found matching your criteria.
            </div>
          )}
        </div>
      )}

      {/* Single hall view */}
      {status && !Array.isArray(status) && hallId && (
        <div className={`p-3 rounded-md ${status.available ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
          {status.available ? (
            <>
              <div className="text-sm font-semibold text-emerald-800">Available</div>
              {/* ✅ Changed: Button instead of <a> tag */}
              <button
                onClick={() => handleBookNow({ _id: hallId, slug: hallSlug, name: hallName })}
                className="mt-2 inline-block px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-sm"
              >
                Book Now
              </button>
            </>
          ) : (
            <div className="text-sm font-semibold text-red-800">Not available</div>
          )}
        </div>
      )}
    </div>
  );
}
