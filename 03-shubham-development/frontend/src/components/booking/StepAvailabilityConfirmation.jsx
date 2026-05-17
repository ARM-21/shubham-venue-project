'use client';

import { useState, useEffect } from 'react';
import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import { AlertCircle, CheckCircle, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { ROUTES } from 'config/routes';
import { BOOKING_LEAD_TIME_MESSAGE, SLOT_LABELS } from 'constants/slots';

export default function StepAvailabilityConfirmation({ 
  hallId, 
  date, 
  slot, 
  guests, 
  reservationId,
  onConfirm, 
  onChangeSelection 
}) {
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const getUnavailableMessage = () => {
    if (availability?.message) return availability.message;
    if (availability?.reason === 'LEAD_TIME_REQUIRED') return BOOKING_LEAD_TIME_MESSAGE;
    if (availability?.reason === 'PAST_DATE') return 'Past dates cannot be booked.';
    if (availability?.reason === 'EXCEEDS_CAPACITY') return 'Guest count exceeds this hall capacity.';
    if (availability?.reason === 'BOOKED') return 'This slot is already reserved.';
    return availability?.reason || 'This slot is no longer available. Please try another time.';
  };

  useEffect(() => {
    checkAvailability();
  }, [hallId, date, slot, guests]);

  const checkAvailability = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        ROUTES.API.BOOKINGS.CHECK_AVAILABILITY(hallId),
        {
          date,
          slot,
          guests,
          reservationId,
        }
      );

      setAvailability(response.data);
    } catch (error) {
      toast.error('Failed to check availability');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!availability?.available) {
      toast.error('Selected slot is no longer available');
      return;
    }

    setConfirming(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onConfirm();
    } catch (error) {
      toast.error('Failed to confirm availability');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-[#C0A04C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAvailable = availability?.available;
  const hasAlternatives = availability?.alternativeSlots && availability.alternativeSlots.length > 0;

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-6 bg-[#C0A04C]"></div>
        <div>
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Step 0</p>
          <h2 className="text-2xl font-display font-black text-[#3a1224]">Confirm Availability</h2>
          <p className="text-sm text-[#3a1224]/60 mt-1">Verifying your selected date and time</p>
        </div>
      </div>

      {/* Status Card */}
      <div className={`border rounded-3xl p-8 shadow-lg ${
        isAvailable 
          ? 'border-green-200 bg-green-50' 
          : 'border-red-200 bg-red-50'
      }`}>
        <div className="flex items-start gap-4">
          <div className="pt-1">
            {isAvailable ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div className="flex-1">
            <h3 className={`text-xl font-black ${isAvailable ? 'text-green-900' : 'text-red-900'}`}>
              {isAvailable ? 'Slot Available' : 'Slot Unavailable'}
            </h3>
            <p className={`text-sm mt-2 ${isAvailable ? 'text-green-800' : 'text-red-800'}`}>
              {isAvailable 
                ? 'This slot is available for your selected date and guest count.'
                : getUnavailableMessage()}
            </p>
          </div>
        </div>
      </div>

      {/* Booking Details Card */}
      <div className="bg-white/95 border border-[#3a1224]/5 rounded-3xl p-6 shadow-lg">
        <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-6">Your Selection</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#3a1224]/10">
              <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Date</span>
              <span className="font-black text-[#3a1224] text-lg">{date}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-[#3a1224]/10">
              <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Time Slot</span>
              <span className="font-black text-[#3a1224] text-lg">{SLOT_LABELS[slot] || slot}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#3a1224]/10">
              <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Guests</span>
              <span className="font-black text-[#3a1224] text-lg">{guests} Person{guests > 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center justify-between pb-4 border-b border-[#3a1224]/10">
              <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Status</span>
              <div className="flex items-center gap-2">
                {isAvailable ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-black text-green-600">Available</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="font-black text-red-600">Booked</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {isAvailable && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[9px] font-black text-amber-900 uppercase tracking-widest">5-Minute Hold</p>
              <p className="text-sm text-amber-800 mt-1">This slot will be held for 5 minutes while you complete booking</p>
            </div>
          </div>
        )}
      </div>

      {/* Alternative Slots */}
      {!isAvailable && hasAlternatives && (
        <div className="bg-white/95 border border-[#3a1224]/5 rounded-3xl p-6 shadow-lg">
          <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-4">Alternative Slots Available</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availability.alternativeSlots.map((alt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onChangeSelection({ slot: alt.slot, date: alt.date });
                  checkAvailability();
                }}
                className="p-4 border border-[#3a1224]/10 rounded-xl hover:bg-gray-50 transition-colors text-left cursor-pointer"
              >
                <p className="font-black text-[#3a1224]">{alt.date} - {alt.slot}</p>
                <p className="text-sm text-[#3a1224]/60 mt-1">Capacity: {alt.capacity}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6">
        <button
          type="button"
          onClick={onChangeSelection}
          className="flex-1 h-12 px-6 border border-[#3a1224]/10 text-[#3a1224] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Change Selection
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!isAvailable || confirming}
          className="flex-1 h-12 px-6 bg-[#3a1224] text-[#C0A04C] font-black text-[9px] uppercase tracking-widest rounded-xl hover:bg-[#4a172d] transition-colors shadow-lg cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {confirming ? 'Confirming...' : (
            <>
              Confirm & Continue
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
