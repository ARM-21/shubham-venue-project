'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import Step1EventDetails from './steps/Step1EventDetails';
import StepIndicator from './indicator/StepIndicator';
import Step2MenuSelection from './steps/Step2MenuSelection';
import Step3Decorations from './steps/Step3Decorations';
import BookingSummary from './BookingSummary';

export default function BookingFlow({ hall, initialDate, initialSlot, initialGuests }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    hallId: hall._id,
    hallSlug: hall.slug,
    hallName: hall.name,
    date: initialDate,
    slot: initialSlot,
    guests: initialGuests,
    eventType: '',
    eventName: '',
    specialRequirements: '',
    selectedMenu: [],
    menuTotal: 0,
    decorationScheme: null,
    addons: [],
    decorationTotal: 0,
  });
  
  // Only needed for Step 4
  const [reservationId, setReservationId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isReserved, setIsReserved] = useState(false);

  // Countdown timer (only active in Step 4)
  useEffect(() => {
    if (currentStep !== 4 || !timeLeft) return;

    if (timeLeft <= 0) {
      toast.error('Reservation expired. Please try again.');
      setIsReserved(false);
      setReservationId(null);
      router.push(`/venues/${hall.slug}`);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, currentStep, router, hall.slug]);

  // ✅ Create reservation ONLY when entering Step 4
  const createReservation = async () => {
    try {
      toast.loading('Reserving hall...');
      
      const res = await axiosInstance.post('/api/v1/bookings/reserve', {
        hallId: hall._id,
        date: initialDate,
        slot: initialSlot,
        guests: initialGuests,
      });
      
      toast.dismiss();
      toast.success('Hall reserved for 5 minutes!');
      
      setReservationId(res.data.reservationId);
      setTimeLeft(res.data.expiresIn); // 300 seconds (5 min)
      setIsReserved(true);
      
    } catch (error) {
      toast.dismiss();
      
      if (error.response?.status === 400) {
        // Hall was just booked by someone else
        toast.error('Sorry, this hall was just booked. Please select another time.');
        router.push(`/venues/${hall.slug}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to reserve hall');
      }
      
      throw error;
    }
  };

  const updateBookingData = (newData) => {
    setBookingData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = async () => {
    // When moving to Step 4, create reservation
    if (currentStep === 3) {
      try {
        await createReservation();
        setCurrentStep(4);
      } catch (error) {
        // Error handled in createReservation
        return;
      }
    } else if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    // If going back from Step 4, release reservation
    if (currentStep === 4 && reservationId) {
      releaseReservation();
    }
    
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const releaseReservation = async () => {
    if (!reservationId) return;
    
    try {
      await axiosInstance.delete(`/api/v1/bookings/reserve/${reservationId}`);
      setReservationId(null);
      setTimeLeft(null);
      setIsReserved(false);
    } catch (error) {
      console.error('Failed to release reservation:', error);
    }
  };

  const calculateTotal = () => {
    const hallPrice = hall.pricePerHour * (bookingData.slot === 'wholeday' ? 15 : 5);
    return hallPrice + bookingData.menuTotal + bookingData.decorationTotal;
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Show countdown only in Step 4 (thinking of using temporary reservation during payment) */}
      {currentStep === 4 && isReserved && timeLeft && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-yellow-800 font-medium">
                Complete payment within:
              </span>
            </div>
            <span className="text-2xl font-bold text-red-600">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <p className="text-xs text-yellow-700 mt-2">
            Hall is reserved for you. Complete payment to confirm booking.
          </p>
        </div>
      )}

      {/* Progress Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Booking Summary Card */}
  
      <BookingSummary
        hall={hall}
        bookingData={bookingData}
        calculateTotal={calculateTotal}
      />
      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {currentStep === 1 && (
          <Step1EventDetails
            data={bookingData}
            onUpdate={updateBookingData}
            onNext={nextStep}
          />
        )}
        {currentStep === 2 && (
          <Step2MenuSelection
            data={bookingData}
            onUpdate={updateBookingData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
         {currentStep === 3 && (
          <Step3Decorations
            data={bookingData}
            onUpdate={updateBookingData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
      </div>
    </div>
  );
}
