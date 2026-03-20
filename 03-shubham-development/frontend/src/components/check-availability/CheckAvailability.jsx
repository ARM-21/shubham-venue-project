'use client';

import React, { useState, useEffect } from 'react';
import { DateTime } from 'luxon';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
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
  const [selectedHall, setSelectedHall] = useState(hallId ? { _id: hallId, name: hallName, slug: hallSlug, capacity: hallCapacity } : null);

  useEffect(() => {
    if (hallId) setSelectedHall({ _id: hallId, name: hallName, slug: hallSlug, capacity: hallCapacity });
  }, [hallId, hallName, hallSlug, hallCapacity]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
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

  const searchParams = useSearchParams();

  // If URL contains ?date=&slot=&guests= prefill the form but DO NOT auto-submit.
  useEffect(() => {
    if (!searchParams) return;
    const qDate = searchParams.get('date');
    const qSlot = searchParams.get('slot');
    const qGuests = searchParams.get('guests');

    if (qDate) setValue('date', qDate);
    if (qGuests) setValue('guests', Number(qGuests));
    if (qSlot) {
      // ensure 'day' maps to server slot 'wholeday'
      const mapped = qSlot === 'day' ? 'wholeday' : qSlot;
      setValue('slot', mapped);
    }
  // only run on mount / searchParams change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, setValue]);

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
      const serverSlot = slot === 'day' ? 'wholeday' : slot;
      const returnUrl = `${ROUTES.SITE.VENUE_BOOK(hall.slug)}?date=${date}&slot=${serverSlot}&guests=${guests}`;
      router.push(`${ROUTES.AUTH.ROOT}?redirect=${encodeURIComponent(returnUrl)}`);
    } else {
      // User is authenticated, go to booking page
      const serverSlot = slot === 'day' ? 'wholeday' : slot;
      router.push(`${ROUTES.SITE.VENUE_BOOK(hall.slug)}?date=${date}&slot=${serverSlot}&guests=${guests}`);
    }
  };

  const minDate = now.startOf('day').toFormat('yyyy-MM-dd');

  const getSelectedAvailability = () => {
    if (!selectedHall || !status) return undefined;
    if (Array.isArray(status)) {
      const found = status.find(s => String(s._id) === String(selectedHall._id));
      return found ? found.available : undefined;
    }
    return status?.available;
  };

  const selectedAvailable = getSelectedAvailability();
  const isFormFilled = !!date && !!slot && !!guests && Number(guests) > 0;
  const canProceed = !!selectedHall && isFormFilled && (selectedAvailable === undefined ? true : selectedAvailable === true);

  const handleProceedToBooking = () => {
    if (!selectedHall || !isFormFilled) return;
    const serverSlot = slot === 'day' ? 'wholeday' : slot;
    const url = `${ROUTES.SITE.VENUE_BOOK(selectedHall.slug)}?date=${date}&slot=${serverSlot}&guests=${guests}`;
    if (!user) {
      const bookingIntent = { hallId: selectedHall._id, hallSlug: selectedHall.slug, hallName: selectedHall.name, date, slot, guests, timestamp: Date.now() };
      localStorage.setItem('bookingIntent', JSON.stringify(bookingIntent));
      router.push(`${ROUTES.AUTH.ROOT}?redirect=${encodeURIComponent(url)}`);
    } else {
      router.push(url);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-body text-gray-800">
      <div className="bg-[#eab308] text-[#3f1228] py-1 px-4 text-xs font-bold text-center">Call us directly for urgent bookings: +977 981-2345678</div>

      <main className="container mx-auto px-4 py-8 md:py-12">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Venue card + Booking summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
              <div className="relative h-48">
                <img alt={selectedHall?.name || hallName || 'Venue Image'} className="w-full h-full object-cover" src={selectedHall?.images?.[0] || '/assets/business-images/placeholder.jpg'} />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h2 className="text-white font-display text-2xl font-bold">{selectedHall?.name || hallName || 'Venue'}</h2>
                  <p className="text-gray-200 text-sm">Capacity: {selectedHall?.capacity || hallCapacity || '—'} Guests</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-yellow-500">
                    <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .587l3.668 7.431L24 9.748l-6 5.851L19.335 24 12 20.201 4.665 24 6 15.599 0 9.748l8.332-1.73z"/></svg>
                    <span className="text-xs ml-2 text-gray-400">(4.8/5)</span>
                  </div>
                  <span className="text-[#3f1228] font-bold text-lg">NPR — <span className="text-xs font-normal text-gray-500">/day</span></span>
                </div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{hallName ? `${hallName} — view availability and proceed to booking.` : 'Select a date to check availability.'}</p>
                <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Amenities</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2"><span className="text-green-600">●</span><span>Air Conditioning</span></li>
                  <li className="flex items-center space-x-2"><span className="text-green-600">●</span><span>Valet Parking</span></li>
                  <li className="flex items-center space-x-2"><span className="text-green-600">●</span><span>Bridal Suite</span></li>
                </ul>
              </div>
            </div>

            <div className="bg-[#3f1228] text-white p-6 rounded-xl shadow-lg sticky top-24 hidden lg:block">
              <h3 className="font-display font-bold text-xl mb-4 border-b border-white/20 pb-2">Booking Summary</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-300">Venue</span><span className="font-semibold">{selectedHall?.name || hallName || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Selected Date</span><span className="font-semibold text-[#eab308]" id="summary-date">{date || 'Select a date'}</span></div>
                <div className="flex justify-between"><span className="text-gray-300">Shift</span><span className="font-semibold">{SLOT_LABELS[slot] || 'Full Day'}</span></div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/20">
                <div className="flex justify-between items-end mb-4"><span className="text-gray-300">Total Estimate</span><span className="font-display text-2xl font-bold">{selectedHall?.currency || 'NPR'} {selectedHall?.pricePerHour?.toLocaleString() || '—'}</span></div>

                {!selectedHall && <p className="text-xs text-yellow-100 mb-2">Select a venue from results to enable booking.</p>}
                {selectedHall && selectedAvailable === false && <p className="text-xs text-red-200 mb-2">Selected venue is booked for the chosen date/slot.</p>}
                {(!date || !slot) && <p className="text-xs text-gray-200 mb-2">Please select date and slot.</p>}

                <button
                  onClick={handleProceedToBooking}
                  disabled={!canProceed}
                  className={`w-full bg-[#9e1c3f] hover:bg-[#b32346] ${!canProceed ? 'opacity-60 cursor-not-allowed' : ''} text-white font-bold py-3 px-4 rounded transition-all shadow-md uppercase text-sm tracking-wider flex justify-center items-center gap-2`}
                >
                  <span>{canProceed ? 'Proceed to Booking' : 'Proceed to Booking'}</span>
                  <span className="text-sm">→</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Form + Calendar + Results */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                  <h1 className="font-display text-3xl font-bold text-[#3f1228]">Check Availability</h1>
                  <p className="text-gray-500 mt-1">Select a date to check status {hallName ? `for ${hallName}` : ''}</p>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-medium">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-100 border border-green-500"></span><span className="text-gray-600">Available</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-100 border border-red-500 opacity-50"></span><span className="text-gray-600">Booked</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#3f1228] border border-[#3f1228]"></span><span className="text-gray-600">Selected</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300"></span><span className="text-gray-600">Past</span></div>
                </div>
              </div>

              {/* Form (kept from original logic) */}
              <form onSubmit={handleSubmit(checkAvailability)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

                <div className="flex justify-center items-center">
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

              {/* Results */}
              {status && Array.isArray(status) && showAllHalls && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Castle className="text-[#502538]" size={24} />Available Venues</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {status.map(h => (
                      <div key={h._id} className={`bg-white rounded-2xl shadow-md border-2 overflow-hidden transition-all duration-300 hover:shadow-xl ${h.available ? 'border-[#502538]/30 hover:border-[#502538]' : 'border-gray-200 opacity-60'} ${selectedHall && String(selectedHall._id) === String(h._id) ? 'ring-2 ring-[#502538] shadow-xl' : ''}`}>
                        <div className={`p-5 ${h.available ? 'bg-[#502538]/5' : 'bg-gray-50'}`}>
                          <div className="flex items-start justify-between">
                            <h4 className="text-lg font-bold text-gray-900">{h.name}</h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${h.available ? 'bg-green-700 text-white' : 'bg-gray-300 text-gray-600'}`}>{h.available ? 'Available' : 'Booked'}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-3 text-sm text-gray-600"><Castle size={16} className="text-[#502538]" /><span className="font-medium">Capacity: {h.capacity} guests</span></div>
                        </div>
                        <div className="p-5">
                          <div className="space-y-3 text-sm text-gray-700 mb-5">
                            <div className="flex items-center gap-2"><CalendarCheck size={18} className="text-[#502538]" /><span className="font-medium">{date}</span></div>
                            <div className="flex items-center gap-2"><Clock size={18} className="text-[#502538]" /><span className="font-medium">{SLOT_LABELS[slot]}</span></div>
                            <div className="flex items-center gap-2"><Users size={18} className="text-[#502538]" /><span className="font-medium">{guests} guests</span></div>
                          </div>
                          {h.available ? (
                            <button
                              onClick={() => { setSelectedHall(h); document.getElementById('summary-date')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                              className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 text-sm ${selectedHall && String(selectedHall._id) === String(h._id) ? 'bg-[#502538] text-white' : 'bg-white border border-gray-200 text-gray-700'}`}
                            >
                              {selectedHall && String(selectedHall._id) === String(h._id) ? 'Selected' : 'Select Venue'}
                            </button>
                          ) : (
                            <button disabled className="w-full px-4 py-3 bg-gray-200 text-gray-500 rounded-xl font-semibold cursor-not-allowed text-sm">Not Available</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {status.length === 0 && (
                    <div className="text-center py-12 px-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
                      <Castle size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 font-medium text-lg">No venues found matching your criteria.</p>
                      <p className="text-gray-500 text-sm mt-2">Try adjusting your date, time slot, or guest count.</p>
                    </div>
                  )}
                </div>
              )}

              {status && !Array.isArray(status) && hallId && (
                <div className={`p-6 rounded-2xl border-2 ${status.available ? 'bg-[#502538]/5 border-[#502538]/30' : 'bg-red-50 border-red-200'}`}>
                  {status.available ? (
                    <div>
                      <div className="flex items-center gap-2 mb-4"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div><span className="text-lg font-bold text-[#502538]">Venue Available!</span></div>
                      <p className="text-gray-700 mb-4">{hallName} is available for {SLOT_LABELS[slot]} on {date} for {guests} guests.</p>
                      <button onClick={() => setSelectedHall({ _id: hallId, slug: hallSlug, name: hallName, capacity: hallCapacity })} className={`inline-block px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-300 ${selectedHall && String(selectedHall._id) === String(hallId) ? 'bg-gray-400 text-white' : 'bg-[#502538] hover:bg-[#3a0c23] text-white'}`}>
                        {selectedHall && String(selectedHall._id) === String(hallId) ? 'Selected' : 'Select Venue'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-2"><div className="w-3 h-3 bg-red-500 rounded-full"></div><span className="text-lg font-bold text-red-700">Not Available</span></div>
                      <p className="text-gray-700">{hallName} is already booked for {SLOT_LABELS[slot]} on {date}.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
