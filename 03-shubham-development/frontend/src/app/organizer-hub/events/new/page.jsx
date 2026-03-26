"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import ProfessionalEventForm from "components/organizer/ProfessionalEventForm";
import { Fingerprint, Zap } from "lucide-react";
import { motion } from "framer-motion";

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      weekday: "short"
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

export default function OrganizerEventCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState("");
  const [status, setStatus] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchStatus() {
      try {
        const res = await axiosInstance.get(ROUTES.API.ORGANIZER_REQUESTS.ME);
        if (!ignore) setStatus(res.data || null);
      } catch (err) {
        if (!ignore) setStatus(null);
      }
    }
    if (user) fetchStatus();
    return () => { ignore = true; };
  }, [user]);

  const statusValue = String(status?.organizerStatus || (user?.isOrganizerEligible ? "approved" : user?.organizerStatus || "none")).toLowerCase();
  const isApproved = status?.isOrganizerEligible || statusValue === "approved" || user?.isOrganizerEligible;

  useEffect(() => {
    let ignore = false;
    async function fetchBookings() {
      try {
        setLoadingBookings(true);
        const res = await axiosInstance.get(ROUTES.API.ORGANIZER.BOOKINGS, { params: { eligibleForEvent: true } });
        if (!ignore) setBookings(res.data?.bookings || []);
      } catch (err) {
        if (!ignore) toast.error(err?.response?.data?.message || "Failed to load eligible bookings");
      } finally {
        if (!ignore) setLoadingBookings(false);
      }
    }

    if (isApproved) fetchBookings();

    return () => {
      ignore = true;
    };
  }, [isApproved]);

  const selectedBooking = bookings.find((b) => String(b._id) === String(selectedBookingId));

  async function onFormSubmit(formData) {
    if (!selectedBookingId) {
      toast.error("Please select a booking first");
      return;
    }

    const payload = {
      bookingId: selectedBookingId,
      name: formData.name?.trim(),
      type: formData.type?.trim(),
      description: formData.description?.trim(),
      eventCategory: formData.eventCategory,
      tags: formData.tags || [],
      isPublic: formData.isPublic,
      accessCode: formData.isPublic ? null : formData.accessCode?.trim(),
      bannerUrl: formData.bannerUrl?.trim(),
      startDateTime: formData.startDateTime || undefined,
      endDateTime: formData.endDateTime || undefined,
      eventDate: formData.eventDate || undefined,
      registrationStartDate: formData.registrationStartDate || undefined,
      registrationEndDate: formData.registrationEndDate || undefined,
      maxAttendees: formData.maxAttendees || undefined,
      expectedAttendees: formData.expectedAttendees || undefined,
      targetAudience: formData.targetAudience?.trim(),
      dressCode: formData.dressCode,
      ageRestriction: formData.ageRestriction?.trim(),
      specialRequirements: formData.specialRequirements?.trim(),
      catering: formData.catering || false,
      decoration: formData.decoration || false,
      requiresTicket: formData.requiresTicket !== false,
      location: {
        city: formData.city?.trim(),
        state: formData.state?.trim(),
        country: formData.country?.trim(),
      },
    };

    try {
      setIsCreating(true);
      const res = await axiosInstance.post(ROUTES.API.ORGANIZER.EVENTS, payload);
      toast.success("Event created successfully");
      const id = res.data?.event?._id;
      if (id) {
        router.push(ROUTES.SITE.ORGANIZER_EVENT_DETAIL(id));
      } else {
        router.push(ROUTES.SITE.ORGANIZER_EVENTS);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create event");
    } finally {
      setIsCreating(false);
    }
  }

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdfaf6] via-white to-[#fdfaf6] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-8 sm:p-10 md:p-12 text-center shadow-sm max-w-md"
        >
          <div className="w-16 sm:w-20 h-16 sm:h-20 bg-[#3a1224]/5 rounded-lg sm:rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8">
            <Fingerprint className="w-8 sm:w-10 h-8 sm:h-10 text-[#3a1224]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#3a1224] mb-3 sm:mb-4">Verification Required</h2>
          <p className="text-[#3a1224]/60 mb-8 sm:mb-10 leading-relaxed font-medium text-sm sm:text-base">
            You need to be a verified producer to create and manage events. Please check your application status on the dashboard.
          </p>
          <button
            onClick={() => router.push(ROUTES.SITE.ORGANIZER)}
            className="w-full px-6 sm:px-10 py-3 sm:py-4 md:py-5 bg-[#3a1224] text-white rounded-lg sm:rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdfaf6] via-white to-[#fdfaf6] pb-16 sm:pb-20">
      {/* Professional Header Section */}
      <div className="bg-gradient-to-br from-[#3a1224] to-[#5a2844] text-white py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span className="text-[8px] sm:text-[9px] font-black text-[#C0A04C] uppercase tracking-[0.3em]">Create New</span>
            <div className="w-8 sm:w-12 h-px bg-[#C0A04C]/40" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-2 sm:mb-3">
            Launch Your <span className="text-[#C0A04C]">Professional Event</span>
          </h1>
          <p className="text-white/70 text-sm sm:text-base font-medium max-w-2xl leading-relaxed">
            Transform your confirmed hall booking into a complete digital event experience with comprehensive details, registration management, and attendee tracking.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-10 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Step 1: Booking Selection */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-6 sm:p-7 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-7 md:mb-8">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#3a1224] rounded-lg sm:rounded-xl flex items-center justify-center text-[#C0A04C] font-black text-sm sm:text-base">1</div>
                <h3 className="text-lg sm:text-xl font-black text-[#3a1224] uppercase tracking-wider">Select Your Booking</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                <div className="space-y-2 sm:space-y-3">
                  <label className="block text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Confirmed Booking *</label>
                  <select
                    value={selectedBookingId}
                    onChange={(e) => setSelectedBookingId(e.target.value)}
                    className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 transition-all outline-none appearance-none"
                  >
                    <option value="">Select a booking...</option>
                    {bookings.map((booking) => (
                      <option key={booking._id} value={booking._id}>
                        {booking.hallId?.name || "Hall"} — {formatDate(booking.date)} • {booking.guests} guests
                      </option>
                    ))}
                  </select>
                  {loadingBookings && (
                    <p className="text-xs text-[#C0A04C] flex items-center gap-2 font-bold uppercase tracking-widest ml-2">
                      <Zap className="w-3 h-3 animate-pulse" /> Loading bookings...
                    </p>
                  )}
                  {!loadingBookings && bookings.length === 0 && (
                    <div className="p-3 sm:p-4 bg-amber-50 rounded-lg sm:rounded-xl border border-amber-200">
                      <p className="text-xs sm:text-sm text-amber-700 font-medium">No eligible hall bookings found. Please create a booking first.</p>
                    </div>
                  )}
                </div>

                {selectedBooking && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-br from-[#3a1224] to-[#5a2844] rounded-lg sm:rounded-2xl p-4 sm:p-5 md:p-6 text-white"
                  >
                    <h4 className="text-base sm:text-lg font-black mb-1">{selectedBooking.hallId?.name || "Venue Name"}</h4>
                    <p className="text-[8px] sm:text-[9px] font-bold text-white/40 uppercase tracking-[0.2em] mb-4 sm:mb-5">Foundation Details</p>
                    
                    <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-5 border-t border-white/10">
                      <div>
                        <p className="text-[8px] sm:text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Event Date</p>
                        <p className="text-sm sm:text-base font-bold">{formatDate(selectedBooking.date)}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-[8px] sm:text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Guests</p>
                          <p className="text-sm sm:text-base font-bold">{selectedBooking.guests}</p>
                        </div>
                        <div>
                          <p className="text-[8px] sm:text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Slot</p>
                          <p className="text-sm sm:text-base font-bold capitalize">{selectedBooking.slot}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Event Details Form */}
          {selectedBookingId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-6 sm:p-7 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-7 md:mb-8">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#3a1224] rounded-lg sm:rounded-xl flex items-center justify-center text-[#C0A04C] font-black text-sm sm:text-base">2</div>
                  <h3 className="text-lg sm:text-xl font-black text-[#3a1224] uppercase tracking-wider">Comprehensive Event Details</h3>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-4 mb-6 sm:mb-8 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-blue-700 font-medium">
                    Fill in as much detail as possible so attendees get a complete picture of your event. All information will be visible on your event page.
                  </p>
                </div>
                
                <ProfessionalEventForm 
                  initialData={{ bookingId: selectedBookingId }}
                  onSubmit={onFormSubmit}
                  isLoading={isCreating}
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
