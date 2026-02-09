'use client';

import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { useAuth } from '@/contexts/AuthProvider';
import { ROUTES } from '@/config/routes';
import { Castle, CalendarCheck, Clock, Users } from 'lucide-react';

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
        ? await axiosInstance.post(ROUTES.API.HALLS.BY_ID_AVAILABILITY(hallId), payload)
        : await axiosInstance.get(ROUTES.API.HALLS.AVAILABILITY, { params: payload });

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
      const returnUrl = `${ROUTES.SITE.VENUE_BOOK(hall.slug)}?date=${date}&slot=${slot}&guests=${guests}`;
      router.push(`${ROUTES.AUTH.ROOT}?redirect=${encodeURIComponent(returnUrl)}`);
    } else {
      // User is authenticated, go to booking page
      router.push(`${ROUTES.SITE.VENUE_BOOK(hall.slug)}?date=${date}&slot=${slot}&guests=${guests}`);
    }
  };

  const minDate = now.startOf('day').toFormat('yyyy-MM-dd');

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white border-2 border-gray-200 rounded-2xl shadow-lg mb-6 ">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {hallName ? `Check Availability - ${hallName}` : 'Check Venue Availability'}
      </h2>

      <form onSubmit={handleSubmit(checkAvailability)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4  mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date</label>
          <input 
            type="date" 
            min={minDate} 
            {...register('date', { required: 'Date is required' })} 
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#502538] focus:ring-2 focus:ring-[#502538]/20 transition-all duration-300 text-sm"
          />
          {errors.date && <p className="text-xs text-red-600 mt-1 font-medium">{errors.date.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Slot</label>
          <select 
            {...register('slot', { required: 'Slot is required' })} 
            defaultValue="" 
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#502538] focus:ring-2 focus:ring-[#502538]/20 transition-all duration-300 text-sm"
          >
            <option value="" disabled>Select Time Slot</option>
            <option value="morning" disabled={disableMorning}>{SLOT_LABELS.morning}</option>
            <option value="evening" disabled={disableEvening}>{SLOT_LABELS.evening}</option>
            <option value="wholeday" disabled={disableMorning && disableEvening}>{SLOT_LABELS.wholeday}</option>
          </select>
          {errors.slot && <p className="text-xs text-red-600 mt-1 font-medium">{errors.slot.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Guests</label>
          <input 
            type="number" 
            {...register('guests', { required: 'Number of guests is required', min: 1, max: hallCapacity })} 
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#502538] focus:ring-2 focus:ring-[#502538]/20 transition-all duration-300 text-sm"
          />
          {hallCapacity && <p className="text-xs text-gray-500 mt-1">Max capacity: {hallCapacity} guests</p>}
          {errors.guests && <p className="text-xs text-red-600 mt-1 font-medium">{errors.guests.message}</p>}
        </div>

        <div className=" flex justify-center items-center">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full px-6 py-[14px] bg-[#502538] text-white rounded-xl font-semibold shadow-md hover:bg-[#3a0c23] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer md:my-7"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Checking...
              </>
            ) : (
              'Check Availability'
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Multiple halls view */}
      {status && Array.isArray(status) && showAllHalls && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Castle className="text-[#502538]" size={24} />
            Available Venues
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {status.map(h => (
              <div
                key={h._id}
                className={`bg-white rounded-2xl shadow-md border-2 overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  h.available 
                    ? 'border-[#502538]/30 hover:border-[#502538]' 
                    : 'border-gray-200 opacity-60'
                }`}
              >
                {/* Card Header */}
                <div className={`p-5 ${h.available ? 'bg-[#502538]/5' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between">
                    <h4 className="text-lg font-bold text-gray-900">{h.name}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      h.available 
                        ? 'bg-green-700 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {h.available ? 'Available' : 'Booked'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-sm text-gray-600">
                    <Castle size={16} className="text-[#502538]" />
                    <span className="font-medium">Capacity: {h.capacity} guests</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5">
                  <div className="space-y-3 text-sm text-gray-700 mb-5">
                    <div className="flex items-center gap-2">
                      <CalendarCheck size={18} className="text-[#502538]" />
                      <span className="font-medium">{date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={18} className="text-[#502538]" />
                      <span className="font-medium">{SLOT_LABELS[slot]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-[#502538]" />
                      <span className="font-medium">{guests} guests</span>
                    </div>
                  </div>

                  {h.available ? (
                    <button
                      onClick={() => handleBookNow(h)}
                      className="w-full px-4 py-3 bg-[#502538] hover:bg-[#3a0c23] text-white rounded-xl font-semibold shadow-md transition-all duration-300 text-sm cursor-pointer"
                    >
                      Book Now →
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full px-4 py-3 bg-gray-200 text-gray-500 rounded-xl font-semibold cursor-not-allowed text-sm"
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
            <div className="text-center py-12 px-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
              <Castle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 font-medium text-lg">No venues found matching your criteria.</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your date, time slot, or guest count.</p>
            </div>
          )}
        </div>
      )}

      {/* Single hall view */}
      {status && !Array.isArray(status) && hallId && (
        <div className={`p-6 rounded-2xl border-2 ${
          status.available 
            ? 'bg-[#502538]/5 border-[#502538]/30' 
            : 'bg-red-50 border-red-200'
        }`}>
          {status.available ? (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-lg font-bold text-[#502538]">Venue Available!</span>
              </div>
              <p className="text-gray-700 mb-4">
                {hallName} is available for {SLOT_LABELS[slot]} on {date} for {guests} guests.
              </p>
              <button
                onClick={() => handleBookNow({ _id: hallId, slug: hallSlug, name: hallName })}
                className="inline-block px-6 py-3 bg-[#502538] hover:bg-[#3a0c23] text-white rounded-xl font-semibold shadow-md transition-all duration-300 cursor-pointer"
              >
                Book Now →
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-lg font-bold text-red-700">Not Available</span>
              </div>
              <p className="text-gray-700">
                {hallName} is already booked for {SLOT_LABELS[slot]} on {date}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
