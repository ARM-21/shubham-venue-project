'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';
import toast from 'react-hot-toast';
import Step1EventDetails from './steps/Step1EventDetails';
import StepIndicator from './indicator/StepIndicator';
import Step2MenuSelection from './steps/Step2MenuSelection';
import Step3Decorations from './steps/Step3Decorations';
import BookingSummary from './BookingSummary';
import Step4Payment from './steps/Step4Payment';
import BookingSuccess from './BookingSuccess';
import StepAvailabilityConfirmation from './steps/StepAvailabilityConfirmation';
import StepContactInfo from './steps/StepContactInfo';
import StepBookingReview from './StepBookingReview';
import { useAuth } from 'contexts/AuthProvider';

export default function BookingFlow({ hall, initialDate, initialSlot, initialGuests }) {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingData, setBookingData] = useState({
    hallId: hall._id,
    hallSlug: hall.slug,
    hallName: hall.name,
    date: initialDate,
    slot: initialSlot,
    guests: initialGuests,
    bookingPurpose: 'customer',
    // Contact Information
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    phoneVerified: false,
    deliveryAddress: '',
    city: '',
    specialInstructions: '',
    contactPreference: 'email',
    saveAsDefault: false,
    // Event Details
    eventType: '',
    eventName: '',
    specialRequirements: '',
    // Menu
    menuMode: 'package',
    selectedPackage: null,
    selectedMenu: [],
    menuTotal: 0,
    // Decoration
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
        { key: 'availability', title: 'Confirm Availability', description: 'Check slot availability' },
        { key: 'contact', title: 'Contact Information', description: 'Your contact details' },
        { key: 'details', title: 'Event Details', description: 'Basic information' },
        { key: 'payment', title: 'Payment', description: 'Review & confirm' },
      ];
    }
    return [
      { key: 'availability', title: 'Confirm Availability', description: 'Check slot availability' },
      { key: 'contact', title: 'Contact Information', description: 'Your contact details' },
      { key: 'details', title: 'Event Details', description: 'Basic information' },
      { key: 'menu', title: 'Menu Selection', description: 'Choose your menu' },
      { key: 'decor', title: 'Decorations', description: 'Select theme & addons' },
      { key: 'review', title: 'Review Booking', description: 'Final review' },
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

  const handleEditStep = (stepKey) => {
    const stepIndex = steps.findIndex(s => s.key === stepKey);
    if (stepIndex !== -1) {
      setCurrentStepIndex(stepIndex);
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
    <div className="max-w-6xl mx-auto px-6 sm:px-8">
      {/* Show Success Page */}
      {bookingSuccess && (
        <BookingSuccess bookingReference={bookingSuccess} />
      )}

      {!bookingSuccess && (
        <>
          {/* Reservation Timer */}
          {currentStepKey === 'payment' && isReserved && timeLeft && (
            <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Time remaining</p>
                  <p className="text-sm text-amber-700 font-medium">Complete payment to secure booking</p>
                </div>
              </div>
              <div className="text-3xl font-display font-bold text-amber-600 tabular-nums">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}

          {/* Booking Type Selector */}
          {isOrganizerEligible && currentStepIndex === 0 && (
            <div className="mb-8 bg-white/95 rounded-3xl shadow-lg border border-[#3a1224]/5 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-[#C0A04C]" />
                <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Booking Type</span>
              </div>
              <p className="text-lg font-display font-bold text-[#3a1224] mb-6">Select booking type</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { value: 'customer', label: 'Personal Booking', desc: 'With menu & decoration' },
                  { value: 'organizer', label: 'Organizer Event', desc: 'Direct event creation' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handlePurposeChange(type.value)}
                    className={`p-6 rounded-2xl border-2 transition-all text-left cursor-pointer ${
                      bookingData.bookingPurpose === type.value
                        ? 'bg-[#3a1224] border-[#3a1224] text-white'
                        : 'bg-white border-[#3a1224]/10 hover:border-[#C0A04C]/30 text-[#3a1224]'
                    }`}
                  >
                    <p className="font-black text-sm uppercase tracking-widest">{type.label}</p>
                    <p className={`text-[11px] mt-2 ${bookingData.bookingPurpose === type.value ? 'text-white/70' : 'text-[#3a1224]/60'}`}>
                      {type.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} steps={steps} />

          {/* Booking Summary Card */}
          <BookingSummary
            hall={hall}
            bookingData={bookingData}
            calculateTotal={calculateTotal}
          />

          {/* Step Content */}
          <div className="bg-white/95 rounded-3xl shadow-lg border border-[#3a1224]/5 p-10 mb-8">
            {currentStepKey === 'availability' && (
              <StepAvailabilityConfirmation
                hallId={hall._id}
                selectedDate={bookingData.date}
                selectedSlot={bookingData.slot}
                guestCount={bookingData.guests}
                onConfirm={nextStep}
                onPrevious={prevStep}
              />
            )}
            {currentStepKey === 'contact' && (
              <StepContactInfo
                onNext={(contactData) => {
                  updateBookingData(contactData);
                  nextStep();
                }}
                onPrevious={prevStep}
              />
            )}
            {currentStepKey === 'details' && (
              <Step1EventDetails
                data={bookingData}
                onUpdate={updateBookingData}
                onNext={nextStep}
                onPrev={prevStep}
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
            {currentStepKey === 'review' && (
              <StepBookingReview
                bookingData={bookingData}
                selectedHall={hall}
                onNext={nextStep}
                onPrevious={prevStep}
                onEditStep={handleEditStep}
              />
            )}
            {currentStepKey === 'payment' && (
              <Step4Payment
                data={bookingData}
                reservationId={reservationId}
                onUpdate={updateBookingData}
                onNext={(bookingRef) => {
                  setBookingSuccess(bookingRef);
                }}
                onPrev={prevStep}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
