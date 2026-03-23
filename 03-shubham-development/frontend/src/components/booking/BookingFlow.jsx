'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';
import toast from 'react-hot-toast';
import { ChevronLeft, Clock, Check, ChevronRight } from 'lucide-react';
import Step1EventDetails from './steps/Step1EventDetails';
import Step2MenuSelection from './steps/Step2MenuSelection';
import Step3Decorations from './steps/Step3Decorations';
import Step4Payment from './steps/Step4Payment';
import BookingSuccess from './BookingSuccess';
import BookingSidebarSummary from './BookingSidebarSummary';
import StepAvailabilityConfirmation from './steps/StepAvailabilityConfirmation';
import StepContactInfo from './steps/StepContactInfo';
import StepBookingReview from './StepBookingReview';
import { useAuth } from 'contexts/AuthProvider';

export default function BookingFlow({ hall, initialDate, initialSlot, initialGuests }) {
  const router = useRouter();
  const { user, setUser } = useAuth();
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
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: '',
    phoneVerified: false,
    deliveryAddress: '',
    city: '',
    specialInstructions: '',
    contactPreference: 'email',
    saveAsDefault: false,
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

  const [reservationId, setReservationId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isReserved, setIsReserved] = useState(false);

  const isOrganizerEligible = Boolean(user?.isOrganizerEligible) || (user?.role || '').toLowerCase() === 'admin';

  const steps = useMemo(() => {
    if (bookingData.bookingPurpose === 'organizer') {
      return [
        { key: 'availability', title: 'Confirm Availability', icon: '📅', interactive: true },
        { key: 'contact', title: 'Your Contact Info', icon: '👤', interactive: true },
        { key: 'details', title: 'Event Details', icon: '📝', interactive: true },
        { key: 'review', title: 'Review Booking', icon: '✓', interactive: false },
        { key: 'payment', title: 'Payment', icon: '💳', interactive: false },
      ];
    }
    return [
      { key: 'availability', title: 'Confirm Availability', icon: '📅', interactive: true },
      { key: 'contact', title: 'Your Contact Info', icon: '👤', interactive: true },
      { key: 'details', title: 'Event Details', icon: '📝', interactive: true },
      { key: 'menu', title: 'Choose Menu', icon: '🍽️', interactive: true },
      { key: 'decor', title: 'Decorations', icon: '✨', interactive: false },
      { key: 'review', title: 'Review Booking', icon: '✓', interactive: false },
      { key: 'payment', title: 'Complete Payment', icon: '💳', interactive: false },
    ];
  }, [bookingData.bookingPurpose]);

  const currentStepKey = steps[currentStepIndex]?.key;
  const currentStep = currentStepIndex + 1;
  const isInteractiveStep = steps[currentStepIndex]?.interactive === true;

  useEffect(() => {
    const refreshUserProfile = async () => {
      try {
        const res = await axiosInstance.get(ROUTES.API.PROFILE.ME);
        const freshUser = res.data?.user;
        if (freshUser) {
          setUser(freshUser);
        }
      } catch (err) {
        console.error('Failed to refresh user profile:', err);
      }
    };
    refreshUserProfile();
  }, [setUser]);

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
      setTimeLeft(res.data.expiresIn);
      setIsReserved(true);

    } catch (error) {
      toast.dismiss();

      if (error.response?.status === 400) {
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

  if (bookingSuccess) {
    return <BookingSuccess bookingReference={bookingSuccess} />;
  }

  const pricePerHour = Number(hall?.pricePerHour) || 0;
  const multiplier = (bookingData?.slot === 'wholeday') ? 15 : 5;
  const hallPrice = pricePerHour * multiplier;

  return (
    <div className="min-h-screen bg-[#fdfaf6] relative selection:bg-[#C0A04C]/30 overflow-x-hidden">
      {/* Top Gradient Background */}
      <div className="fixed top-0 left-0 w-full h-[700px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/80 to-transparent pointer-events-none z-0" />

      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-[#3a1224]/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#3a1224] hover:text-[#C0A04C] transition-colors group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold hidden sm:inline">Back</span>
          </button>
          <div className="text-center flex-1">
            <p className="text-xs font-black text-[#C0A04C] uppercase tracking-widest">Step {currentStep} of {steps.length}</p>
            <p className="font-bold text-[#3a1224] text-sm">{steps[currentStepIndex]?.title}</p>
          </div>
          <div className="w-24">
            <div className="w-full h-1.5 bg-[#3a1224]/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#C0A04C] to-[#D4B557] transition-all duration-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timer Alert */}
      {currentStepKey === 'payment' && isReserved && timeLeft && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-400/30">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 justify-center">
            <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
            <span className="text-[#3a1224] font-semibold text-sm">Complete payment in</span>
            <span className="text-2xl font-display font-bold text-amber-600 tabular-nums">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 pt-4">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
          {/* Interactive Steps (1-4) - Full screen centered with sidebar */}
          {isInteractiveStep && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-center min-h-[600px]">
                  <div className="w-full">
                    {/* Booking Type Selector */}
                    {isOrganizerEligible && currentStepIndex === 0 && (
                      <div className="space-y-12">
                        <div className="text-center">
                          <div className="text-7xl mb-6 animate-bounce">🏛️</div>
                          <h1 className="text-4xl font-display font-black text-[#3a1224] mb-4">
                            Select Booking Type
                          </h1>
                          <p className="text-[#3a1224]/70 text-lg">
                            Choose how you'd like to book your venue
                          </p>
                        </div>

                        <div className="bg-white rounded-3xl p-10 border-2 border-[#3a1224]/10 space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { value: 'customer', label: 'Personal Booking', desc: 'Full menu & decoration', emoji: '👥' },
                              { value: 'organizer', label: 'Organizer Event', desc: 'Direct event booking', emoji: '🎭' }
                            ].map((type) => (
                              <button
                                key={type.value}
                                onClick={() => handlePurposeChange(type.value)}
                                className={`p-8 rounded-2xl border-2 transition-all text-center ${
                                  bookingData.bookingPurpose === type.value
                                    ? 'bg-gradient-to-br from-[#C0A04C] to-[#D4B557] border-[#C0A04C] text-[#3a1224] shadow-lg scale-105'
                                    : 'bg-white border-[#3a1224]/10 hover:border-[#C0A04C]/30 text-[#3a1224] hover:shadow-md'
                                }`}
                              >
                                <div className="text-5xl mb-4">{type.emoji}</div>
                                <p className="font-black text-lg uppercase tracking-widest">{type.label}</p>
                                <p className={`text-sm mt-2 ${
                                  bookingData.bookingPurpose === type.value
                                    ? 'text-[#3a1224]/70'
                                    : 'text-[#3a1224]/60'
                                }`}>
                                  {type.desc}
                                </p>
                              </button>
                            ))}
                          </div>

                          <div className="flex gap-4 pt-6 border-t border-[#3a1224]/10">
                            <button
                              onClick={prevStep}
                              className="flex-1 px-6 py-3 border-2 border-[#3a1224] text-[#3a1224] font-black rounded-xl hover:bg-[#3a1224] hover:text-white transition-all"
                            >
                              Back
                            </button>
                            <button
                              onClick={nextStep}
                              className="flex-1 px-6 py-3 bg-[#C0A04C] text-[#3a1224] font-black rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Availability Step */}
                    {currentStepKey === 'availability' && (
                      <div className="space-y-12">
                        <div className="text-center">
                          <div className="text-7xl mb-6 animate-bounce">📅</div>
                          <h1 className="text-4xl font-display font-black text-[#3a1224] mb-4">
                            Check Availability
                          </h1>
                          <p className="text-[#3a1224]/70 text-lg">
                            Let's verify your selected date and time
                          </p>
                        </div>
                        <div className="bg-white rounded-3xl p-10 border-2 border-[#3a1224]/10">
                          <StepAvailabilityConfirmation
                            hallId={hall._id}
                            selectedDate={bookingData.date}
                            selectedSlot={bookingData.slot}
                            guestCount={bookingData.guests}
                            onConfirm={nextStep}
                            onPrevious={prevStep}
                          />
                        </div>
                      </div>
                    )}

                    {/* Contact Info Step */}
                    {currentStepKey === 'contact' && (
                      <div className="space-y-12">
                        <div className="text-center">
                          <div className="text-7xl mb-6 animate-bounce">👤</div>
                          <h1 className="text-4xl font-display font-black text-[#3a1224] mb-4">
                            Your Contact Info
                          </h1>
                          <p className="text-[#3a1224]/70 text-lg">
                            How can we reach you?
                          </p>
                        </div>
                        <div className="bg-white rounded-3xl p-10 border-2 border-[#3a1224]/10">
                          <StepContactInfo
                            onNext={(contactData) => {
                              updateBookingData(contactData);
                              nextStep();
                            }}
                            onPrevious={prevStep}
                          />
                        </div>
                      </div>
                    )}

                    {/* Event Details Step */}
                    {currentStepKey === 'details' && (
                      <div className="space-y-12">
                        <div className="text-center">
                          <div className="text-7xl mb-6 animate-bounce">📝</div>
                          <h1 className="text-4xl font-display font-black text-[#3a1224] mb-4">
                            Event Details
                          </h1>
                          <p className="text-[#3a1224]/70 text-lg">
                            Tell us about your event
                          </p>
                        </div>
                        <div className="bg-white rounded-3xl p-10 border-2 border-[#3a1224]/10">
                          <Step1EventDetails
                            data={bookingData}
                            onUpdate={updateBookingData}
                            onNext={nextStep}
                            onPrev={prevStep}
                            bookingPurpose={bookingData.bookingPurpose}
                          />
                        </div>
                      </div>
                    )}

                    {/* Menu Selection Step */}
                    {currentStepKey === 'menu' && (
                      <div className="space-y-12">
                        <div className="text-center">
                          <div className="text-7xl mb-6 animate-bounce">🍽️</div>
                          <h1 className="text-4xl font-display font-black text-[#3a1224] mb-4">
                            Choose Your Menu
                          </h1>
                          <p className="text-[#3a1224]/70 text-lg">
                            Select food & beverages for your guests
                          </p>
                        </div>
                        <div className="bg-white rounded-3xl p-10 border-2 border-[#3a1224]/10">
                          <Step2MenuSelection
                            data={bookingData}
                            onUpdate={updateBookingData}
                            onNext={nextStep}
                            onPrev={prevStep}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Always-Visible Summary Sidebar */}
              <div className="lg:col-span-1">
                <BookingSidebarSummary
                  hall={hall}
                  bookingData={bookingData}
                  calculateTotal={calculateTotal}
                  onEditStep={handleEditStep}
                  isCompactView={false}
                />
              </div>
            </div>
          )}

          {/* Non-Interactive Steps (Decor, Review, Payment) - Two Column Layout */}
          {!isInteractiveStep && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl p-12 border-2 border-[#3a1224]/10 shadow-lg">
                  {currentStepKey === 'decor' && (
                    <>
                      <div className="text-center mb-12">
                        <div className="text-6xl mb-4">✨</div>
                        <h2 className="text-3xl font-display font-black text-[#3a1224]">Decorations</h2>
                        <p className="text-[#3a1224]/60 mt-2">Personalize your event's ambiance</p>
                      </div>
                      <Step3Decorations
                        data={bookingData}
                        onUpdate={updateBookingData}
                        onNext={nextStep}
                        onPrev={prevStep}
                      />
                    </>
                  )}
                  
                  {currentStepKey === 'review' && (
                    <>
                      <div className="text-center mb-12">
                        <div className="text-6xl mb-4">✓</div>
                        <h2 className="text-3xl font-display font-black text-[#3a1224]">Review Your Booking</h2>
                        <p className="text-[#3a1224]/60 mt-2">Everything looks good?</p>
                      </div>
                      <StepBookingReview
                        bookingData={bookingData}
                        selectedHall={hall}
                        onNext={nextStep}
                        onPrevious={prevStep}
                        onEditStep={handleEditStep}
                      />
                    </>
                  )}

                  {currentStepKey === 'payment' && (
                    <>
                      <div className="text-center mb-12">
                        <div className="text-6xl mb-4">💳</div>
                        <h2 className="text-3xl font-display font-black text-[#3a1224]">Complete Payment</h2>
                        <p className="text-[#3a1224]/60 mt-2">Secure your booking now</p>
                      </div>
                      <Step4Payment
                        data={bookingData}
                        reservationId={reservationId}
                        onUpdate={updateBookingData}
                        onNext={(bookingRef) => {
                          setBookingSuccess(bookingRef);
                        }}
                        onPrev={prevStep}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Always-Visible Summary Sidebar */}
              <div className="lg:col-span-1">
                <BookingSidebarSummary
                  hall={hall}
                  bookingData={bookingData}
                  calculateTotal={calculateTotal}
                  onEditStep={handleEditStep}
                  isCompactView={true}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
