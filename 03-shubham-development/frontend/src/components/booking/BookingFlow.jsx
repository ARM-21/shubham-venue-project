'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { ROUTES } from '@/config/routes';
import toast from 'react-hot-toast';
import Step1EventDetails from './steps/Step1EventDetails';
import StepIndicator from './indicator/StepIndicator';
import Step2MenuSelection from './steps/Step2MenuSelection';
import Step3Decorations from './steps/Step3Decorations';
import BookingSummary from './BookingSummary';
import Step4Payment from './steps/Step4Payment';
import { useAuth } from '@/contexts/AuthProvider';

export default function BookingFlow({ hall, initialDate, initialSlot, initialGuests }) {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [bookingData, setBookingData] = useState({
    hallId: hall._id,
    hallSlug: hall.slug,
    hallName: hall.name,
    date: initialDate,
    slot: initialSlot,
    guests: initialGuests,
    bookingPurpose: 'customer',
    eventType: '',
    eventName: '',
    specialRequirements: '',
    menuMode: 'package',
    selectedPackage: null,
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

  const isOrganizerEligible = Boolean(user?.isOrganizerEligible) || (user?.role || '').toLowerCase() === 'admin';

  const steps = useMemo(() => {
    if (bookingData.bookingPurpose === 'organizer') {
      return [
        { key: 'details', title: 'Event Details', description: 'Basic information' },
        { key: 'payment', title: 'Payment', description: 'Review & confirm' },
      ];
    }
    return [
      { key: 'details', title: 'Event Details', description: 'Basic information' },
      { key: 'menu', title: 'Menu Selection', description: 'Choose your menu' },
      { key: 'decor', title: 'Decorations', description: 'Select theme & addons' },
      { key: 'payment', title: 'Payment', description: 'Review & confirm' },
    ];
  }, [bookingData.bookingPurpose]);

  const currentStepKey = steps[currentStepIndex]?.key;
  const currentStep = currentStepIndex + 1;

  // Countdown timer (only active in Step 4)
  useEffect(() => {
    if (currentStepKey !== 'payment' || !timeLeft) return;

    if (timeLeft <= 0) {
      releaseReservation();
      toast.error('Reservation expired. Please try again.');
      setIsReserved(false);
      setReservationId(null);
      setCurrentStepIndex(0);
      router.push(ROUTES.SITE.VENUES(hall.slug));
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, currentStepKey, router, hall.slug]);

  // Create reservation ONLY when entering Step 4
  const createReservation = async () => {
    try {
      toast.loading('Reserving hall...');

      const res = await axiosInstance.post(ROUTES.API.BOOKINGS.RESERVE, {
        hallId: hall._id,
        date: initialDate,
        slot: initialSlot,
        guests: initialGuests,
        bookingPurpose: bookingData.bookingPurpose,
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
        router.push(ROUTES.SITE.VENUES(hall.slug));
      } else {
        toast.error(error.response?.data?.message || 'Failed to reserve hall');
      }

      throw error;
    }
  };

  const updateBookingData = (newData) => {
    setBookingData((prev) => ({ ...prev, ...newData }));
  };

  const handlePurposeChange = (purpose) => {
    if (purpose === bookingData.bookingPurpose) return;
    setBookingData((prev) => ({
      ...prev,
      bookingPurpose: purpose,
      eventType: '',
      menuMode: 'package',
      selectedPackage: null,
      selectedMenu: [],
      menuTotal: 0,
      decorationScheme: null,
      addons: [],
      decorationTotal: 0,
    }));
  };

  const nextStep = async () => {
    const nextIndex = currentStepIndex + 1;
    const nextKey = steps[nextIndex]?.key;
    if (!nextKey) return;

    if (nextKey === 'payment') {
      try {
        await createReservation();
        setCurrentStepIndex(nextIndex);
      } catch (error) {
        return;
      }
    } else {
      setCurrentStepIndex(nextIndex);
    }
  };

  const prevStep = () => {
    // If going back from Step 4, release reservation
    if (currentStepKey === 'payment' && reservationId) {
      releaseReservation();
    }

    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const releaseReservation = async () => {
    if (!reservationId) return;

    try {
      await axiosInstance.delete(ROUTES.API.BOOKINGS.RESERVE_BY_ID(reservationId));
      setReservationId(null);
      setTimeLeft(null);
      setIsReserved(false);
    } catch (error) {
      console.error('Failed to release reservation:', error);
    }
  };

  const calculateTotal = () => {
    const pricePerHour = Number(hall?.pricePerHour) || 0;
    const multiplier = (bookingData?.slot === 'wholeday') ? 15 : 5;
    const hallPrice = pricePerHour * multiplier;
    const menuTotal = bookingData.bookingPurpose === 'organizer' ? 0 : (Number(bookingData?.menuTotal) || 0);
    const decorationTotal = bookingData.bookingPurpose === 'organizer' ? 0 : (Number(bookingData?.decorationTotal) || 0);
    const total = hallPrice + menuTotal + decorationTotal;
    return Number.isFinite(total) ? total : 0;
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Show countdown only in Step 4 (thinking of using temporary reservation during payment) */}
      {currentStepKey === 'payment' && isReserved && timeLeft && (
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
      {isOrganizerEligible && currentStepIndex === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-gray-700 mb-3">Booking Type</p>
          <div className="flex flex-col md:flex-row gap-3">
            <button
              type="button"
              onClick={() => handlePurposeChange('customer')}
              className={`flex-1 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                bookingData.bookingPurpose === 'customer'
                  ? 'bg-[#66213f] text-white border-[#66213f]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#66213f]'
              }`}
            >
              Personal Booking
            </button>
            <button
              type="button"
              onClick={() => handlePurposeChange('organizer')}
              className={`flex-1 px-4 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                bookingData.bookingPurpose === 'organizer'
                  ? 'bg-[#66213f] text-white border-[#66213f]'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-[#66213f]'
              }`}
            >
              Organizer Booking
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Organizer booking skips menu and decoration selection.</p>
        </div>
      ) : null}

      <StepIndicator currentStep={currentStep} steps={steps} />

      {/* Booking Summary Card */}

      <BookingSummary
        hall={hall}
        bookingData={bookingData}
        calculateTotal={calculateTotal}
      />
      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {currentStepKey === 'details' && (
          <Step1EventDetails
            data={bookingData}
            onUpdate={updateBookingData}
            onNext={nextStep}
            bookingPurpose={bookingData.bookingPurpose}
          />
        )}
        {currentStepKey === 'menu' && (
          <Step2MenuSelection
            data={bookingData}
            onUpdate={updateBookingData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        {currentStepKey === 'decor' && (
          <Step3Decorations
            data={bookingData}
            onUpdate={updateBookingData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
        {currentStepKey === 'payment' && (
          <Step4Payment
            data={bookingData}
            reservationId={reservationId}
            onUpdate={updateBookingData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}
      </div>
    </div>
  );
}
