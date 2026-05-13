'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';
import toast from 'react-hot-toast';
import { Clock, Check, ArrowRight, Lock, AlertCircle, CheckCircle2, Zap, Users, Building2 } from 'lucide-react';
import Step1EventDetails from './Step1EventDetails';
import Step2MenuSelection from './Step2MenuSelection';
import Step3Decorations from './Step3Decorations';
import Step4Payment from './Step4Payment';
import BookingSuccess from './BookingSuccess';
import StepAvailabilityConfirmation from './StepAvailabilityConfirmation';
import StepContactInfo from './StepContactInfo';
import StepBookingReview from './StepBookingReview';
import { useAuth } from 'contexts/AuthProvider';
import { getSlotMultiplier } from '../../utils/booking.utils';

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
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    phone: user?.phone || '',
    phoneVerified: false,
    deliveryAddress: user?.address || '',
    city: user?.city || '',
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
        { key: 'availability', title: 'Availability', step: 1 },
        { key: 'contact', title: 'Contact', step: 2 },
        { key: 'details', title: 'Details', step: 3 },
        { key: 'menu', title: 'Menu', step: 4 },
        { key: 'review', title: 'Review', step: 5 },
        { key: 'payment', title: 'Payment', step: 6 },
      ];
    }
    return [
      { key: 'availability', title: 'Availability', step: 1 },
      { key: 'contact', title: 'Contact', step: 2 },
      { key: 'details', title: 'Details', step: 3 },
      { key: 'menu', title: 'Menu', step: 4 },
      { key: 'decor', title: 'Decor', step: 5 },
      { key: 'review', title: 'Review', step: 6 },
      { key: 'payment', title: 'Payment', step: 7 },
    ];
  }, [bookingData.bookingPurpose]);

  const currentStepKey = steps[currentStepIndex]?.key;
  const currentStep = currentStepIndex + 1;

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

  const createReservation = useCallback(async () => {
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
  }, [hall._id, initialDate, initialSlot, initialGuests, bookingData.bookingPurpose, router, hall.slug]);

  const releaseReservation = useCallback(async () => {
    if (!reservationId) return;
    try {
      await axiosInstance.post(ROUTES.API.BOOKINGS.RESERVE_BY_ID(reservationId), {});
      setReservationId(null);
      setTimeLeft(null);
      setIsReserved(false);
    } catch (error) {
      console.error('Failed to release reservation:', error);
    }
  }, [reservationId]);

  const updateBookingData = useCallback((newData) => {
    setBookingData((prev) => ({ ...prev, ...newData }));
  }, []);

  const handlePurposeChange = (purpose) => {
    if (purpose === bookingData.bookingPurpose) return;
    setBookingData((prev) => ({
      ...prev,
      bookingPurpose: purpose,
    }));
  };

  const nextStep = useCallback(async () => {
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
  }, [currentStepIndex, steps]);

  const prevStep = useCallback(() => {
    if (currentStepKey === 'payment' && reservationId) {
      releaseReservation();
    }
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepKey, reservationId, currentStepIndex]);

  const calculateTotal = useCallback(() => {
    const pricePerHour = Number(hall?.pricePerHour) || 0;
    const multiplier = getSlotMultiplier(bookingData?.slot);
    const hallPrice = pricePerHour * multiplier;
    const menuTotal = bookingData.bookingPurpose === 'organizer' ? 0 : (Number(bookingData?.menuTotal) || 0);
    const decorationTotal = bookingData.bookingPurpose === 'organizer' ? 0 : (Number(bookingData?.decorationTotal) || 0);
    const total = hallPrice + menuTotal + decorationTotal;
    return Number.isFinite(total) ? total : 0;
  }, [hall?.pricePerHour, bookingData?.slot, bookingData?.bookingPurpose, bookingData?.menuTotal, bookingData?.decorationTotal]);

  if (bookingSuccess) {
    return <BookingSuccess bookingReference={bookingSuccess} />;
  }

  const pricePerHour = Number(hall?.pricePerHour) || 0;
  const multiplier = getSlotMultiplier(bookingData?.slot);
  const hallPrice = pricePerHour * multiplier;
  const total = calculateTotal();

  return (
    <div className="min-h-screen bg-[#ffffff] relative selection:bg-[black]/30 overflow-hidden">
      {/* Background Gradient - Behind Everything */}
      <div className="absolute top-0 left-0 w-full h-[700px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/70 to-[#1b1919] pointer-events-none z-0" />

      {/* Header Section - NOT Sticky */}
      <header className="relative z-10 bg-transparent pt-32 sm:pt-40 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3 sm:mb-4">
            <div className="w-6 sm:w-8 h-[1px] bg-[#6b5f44]" />
            <span className="text-[9px] sm:text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.3em] sm:tracking-[0.4em]">Complete Your Event</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 lg:gap-8 mb-8 lg:mb-12">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-display font-bold text-white mb-2 sm:mb-3 leading-[1] sm:leading-[0.95]">
                Book Your <span className="text-[#C0A04C] italic font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-5xl">{hall?.name || 'Venue'}</span>
              </h1>
              <p className="text-white/70 text-xs sm:text-sm lg:text-base font-light leading-relaxed max-w-2xl">
                Complete all steps to finalize your event booking.
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1.5 sm:gap-2 flex-shrink-0">
              <p className="text-xs sm:text-sm font-bold text-white">{steps[currentStepIndex]?.title}</p>
              <p className="text-[10px] sm:text-xs text-white/60">Step {currentStep} of {steps.length}</p>
              <div className="w-32 sm:w-48 h-1 sm:h-1.5 bg-white/20 rounded-full overflow-hidden mt-1 sm:mt-2">
                <div 
                  className="h-full bg-gradient-to-r from-[#C0A04C] to-[#D4B557] transition-all duration-500"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Horizontal Step Indicator - NOT Sticky */}
      <div className="hidden sm:block m-auto bg-transparent/40 backdrop-blur-md  pt-6 sm:pt-8 pb-6 sm:pb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 md:flex items-center justify-center rounded-lg">
          <div className="w-full flex items-center justify-start gap-2 sm:gap-3 overflow-x-auto pb-2 ">
              {steps.map((step, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
                  {/* Step Badge */}
                  <button
                    onClick={() => idx < currentStepIndex && setCurrentStepIndex(idx)}
                    disabled={idx > currentStepIndex}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full font-bold text-[9px] sm:text-xs lg:text-sm transition-all whitespace-nowrap ${
                      isCompleted
                        ? 'bg-emerald-500/90 border border-emerald-400 text-emerald-300 hover:bg-emerald-500/30 cursor-pointer'
                        : isCurrent
                        ? 'bg-[#C0A04C] text-[#3a1224] shadow-xl ring-2 ring-[#C0A04C]/50'
                        : 'bg-white/50 border border-white/60 text-white/90 hover:bg-white/60 shadow-lg'
                    }`}
                  >
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-xs font-black flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-400/40 text-green-300'
                        : isCurrent
                        ? 'bg-[#3a1224] text-[#C0A04C]'
                        : 'bg-white/70 text-white'
                    }`}>
                      {isCompleted ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : step.step}
                    </div>
                    <span className="hidden sm:inline">{step.title}</span>
                  </button>
                  
                    {idx < steps.length - 1 && (
                      <div className={`w-2 sm:w-3 h-0.5 ${
                        isCompleted ? 'bg-green-400/60' : 'bg-white/60 shadow-sm'
                      }`} />
                  )}
                  </div>
                );
              })}
            </div>
          </div>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-6 sm:pt-8">
        {/* Reservation Timer - Inside Main */}
        {isReserved && timeLeft !== null && (
          <div className="mb-4 sm:mb-6 bg-amber-50/80 border border-amber-200/50 rounded-lg sm:rounded-2xl backdrop-blur-sm p-3 sm:p-4">
            <div className="flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0" />
              <span className="text-amber-900 font-semibold text-center">
                Reservation expires in <span className="font-black text-amber-700 ml-1">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
              </span>
            </div>
          </div>
        )}

        {/* Timer Alert - Inside Main */}
        {currentStepKey === 'payment' && isReserved && timeLeft && (
          <div className="mb-4 sm:mb-6 bg-amber-50/80 border border-amber-200/50 rounded-lg sm:rounded-2xl backdrop-blur-sm p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3 justify-center text-xs sm:text-sm">
              <AlertCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
              <span className="text-amber-900 font-semibold">Complete payment in</span>
              <span className="font-display font-bold text-amber-600 tabular-nums">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Sidebar - Booking Summary */}
          <div className="md:col-span-1 lg:col-span-1 order-2 md:order-1">
            {/* Summary Card - Sticky at appropriate position */}
            <div className="sticky top-20 sm:top-24 bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border-2 border-slate-200 shadow-lg space-y-6 sm:space-y-8 z-20">
              {/* Hall Image */}
              <div className="rounded-lg sm:rounded-xl overflow-hidden h-24 sm:h-32 bg-gradient-to-br from-slate-100 to-slate-200">
                <img
                  src={hall.images?.[0] || '/assets/business-images/placeholder2.jpg'}
                  alt={hall.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Hall Details */}
              <div className="space-y-3 sm:space-y-4 border-t border-slate-200 pt-4 sm:pt-4">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest">Venue</p>
                  <p className="font-bold text-slate-900 text-xs sm:text-sm mt-1">{hall.name}</p>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-slate-600">Date & Time</span>
                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">{bookingData.slot}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-slate-600">Guests</span>
                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">{bookingData.guests} people</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-slate-200 pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-slate-600">Hall ({multiplier}h)</span>
                  <span className="font-semibold text-slate-900">Rs {hallPrice.toLocaleString()}</span>
                </div>
                {bookingData.menuTotal > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-600">Menu</span>
                    <span className="font-semibold text-slate-900">Rs {bookingData.menuTotal.toLocaleString()}</span>
                  </div>
                )}
                {bookingData.decorationTotal > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-slate-600">Decorations</span>
                    <span className="font-semibold text-slate-900">Rs {bookingData.decorationTotal.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Total Amount */}
              <div className="bg-gradient-to-br from-[#C0A04C]/10 to-[#D4B557]/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#C0A04C]/20">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest">Total</span>
                  <span className="text-lg sm:text-2xl font-display font-bold text-[#C0A04C]">Rs {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-slate-500 pt-2">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>SSL Secured • PCI Compliant</span>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="md:col-span-2 lg:col-span-3 order-1 md:order-2">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 border-slate-200 p-4 sm:p-6 md:p-8 lg:p-12">
              {/* Step Header */}
              {currentStepKey !== 'payment' && (
                <div className="mb-6 sm:mb-8 pb-6 sm:pb-8 border-b border-slate-200">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">{steps[currentStepIndex]?.title}</h1>
                  <p className="text-xs sm:text-sm text-slate-600">Complete this step to continue your booking</p>
                </div>
              )}
              {/* Booking Type Selection - Show ONLY at first step for organizer-eligible users */}
              {isOrganizerEligible && currentStepIndex === 0 && currentStepKey === 'availability' && (
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-[1px] bg-[#C0A04C]" />
                    <span className="text-[9px] font-black text-[#C0A04C] uppercase tracking-[0.3em]">Choose Your Path</span>
                  </div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-text-2xl mb-1 sm:mb-2">Select Booking Type</h2>
                    <p className="text-sm sm:text-base text-slate-600 font-medium">Choose how you'd like to proceed with this venue booking</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {[
                      { 
                        value: 'customer', 
                        label: 'Personal Event', 
                        desc: 'Book with menu & decoration selection',
                        details: '7-step process with full customization',
                        icon: Users 
                      },
                      { 
                        value: 'organizer', 
                        label: 'Professional Event',
                        desc: 'Direct venue booking for events',
                        details: '5-step simplified process',
                        icon: Building2,
                        featured: true
                      }
                    ].map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = bookingData.bookingPurpose === type.value;
                      return (
                        <button
                          key={type.value}
                          onClick={() => handlePurposeChange(type.value)}
                          className={`relative p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 transition-all text-left overflow-hidden group ${
                            isSelected
                              ? 'border-[#C0A04C] bg-gradient-to-br from-[#C0A04C]/10 to-[#C0A04C]/5'
                              : 'border-slate-200 bg-slate-50 hover:border-[#C0A04C]/40 hover:bg-white'
                          }`}
                        >
                          {type.featured && !isSelected && (
                            <div className="absolute top-3 right-3 px-3 py-1 bg-[#C0A04C] text-white text-[9px] font-black uppercase tracking-widest rounded-full">
                              ⭐ Recommended
                            </div>
                          )}
                          
                          <div className="flex items-start justify-between mb-4 sm:mb-6">
                            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${isSelected ? 'bg-[#C0A04C]/20' : 'bg-white group-hover:bg-[#C0A04C]/5'}`}>
                              <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 ${isSelected ? 'text-[#C0A04C]' : 'text-slate-400 group-hover:text-[#C0A04C]'}`} />
                            </div>
                            {isSelected && (
                              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#C0A04C] text-white flex items-center justify-center flex-shrink-0">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          
                          <h3 className="font-black text-slate-900 text-lg sm:text-xl mb-1 sm:mb-2">{type.label}</h3>
                          <p className="text-sm sm:text-base text-slate-700 font-semibold mb-3 sm:mb-4">{type.desc}</p>
                          <p className="text-xs sm:text-sm text-slate-500 font-medium">{type.details}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 pt-6 sm:pt-8 border-t border-slate-200">
                    <button
                      onClick={nextStep}
                      disabled={!bookingData.bookingPurpose}
                      className="flex-1 px-6 sm:px-8 py-3 sm:py-4 bg-[#C0A04C] hover:bg-[#b39041] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Availability Step */}
              {currentStepKey === 'availability' && (
                <StepAvailabilityConfirmation
                  hallId={hall._id}
                  date={bookingData.date}
                  slot={bookingData.slot}
                  guests={bookingData.guests}
                  reservationId={reservationId}
                  onConfirm={nextStep}
                  onChangeSelection={prevStep}
                />
              )}

              {/* Contact Info Step */}
              {currentStepKey === 'contact' && (
                <StepContactInfo
                  data={bookingData}
                  onUpdate={updateBookingData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}

              {/* Event Details Step */}
              {currentStepKey === 'details' && (
                <Step1EventDetails
                  data={bookingData}
                  onUpdate={updateBookingData}
                  onNext={nextStep}
                  onPrev={prevStep}
                  bookingPurpose={bookingData.bookingPurpose}
                />
              )}

              {/* Menu Step */}
              {currentStepKey === 'menu' && (
                <Step2MenuSelection
                  data={bookingData}
                  onUpdate={updateBookingData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}

              {/* Decorations Step */}
              {currentStepKey === 'decor' && bookingData.bookingPurpose === 'customer' && (
                <Step3Decorations
                  data={bookingData}
                  onUpdate={updateBookingData}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}

              {/* Review Step */}
              {currentStepKey === 'review' && (
                <StepBookingReview
                  hall={hall}
                  bookingData={bookingData}
                  calculateTotal={calculateTotal}
                  onNext={nextStep}
                  onPrev={prevStep}
                  onEditStep={(stepKey) => {
                    const idx = steps.findIndex(s => s.key === stepKey);
                    if (idx !== -1) setCurrentStepIndex(idx);
                  }}
                />
              )}

              {/* Payment Step */}
              {currentStepKey === 'payment' && (
                <div>
                  <Step4Payment
                    data={{
                      ...bookingData,
                      hallPrice: hallPrice,
                      total: total,
                    }}
                    reservationId={reservationId}
                    onUpdate={updateBookingData}
                    onNext={(bookingRef) => {
                      setBookingSuccess(bookingRef);
                    }}
                    onPrev={prevStep}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
