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
      <div className="max-w-2xl mx-auto py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-[#3a1224]/5 p-12 text-center shadow-sm"
        >
          <div className="w-20 h-20 bg-[#3a1224]/5 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
            <Fingerprint className="w-10 h-10 text-[#3a1224]" />
          </div>
          <h2 className="text-3xl font-black text-[#3a1224] mb-4">Verification Required</h2>
          <p className="text-[#3a1224]/60 mb-10 leading-relaxed font-medium">
            You need to be a verified producer to create and manage events. 
            Please check your application status on the dashboard.
          </p>
          <button
            onClick={() => router.push(ROUTES.SITE.ORGANIZER)}
            className="px-10 py-5 bg-[#3a1224] text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-[1px] bg-[#C0A04C]/40" />
          <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Launch Center</span>
        </div>
        <h1 className="text-5xl lg:text-6xl font-black text-[#3a1224] tracking-tight">
          Create <span className="text-[#C0A04C]">Professional Event</span>
        </h1>
        <p className="mt-6 text-[#3a1224]/50 text-base font-medium max-w-lg leading-relaxed">
          Transform your confirmed hall booking into a professional digital event experience with comprehensive details.
        </p>
      </div>

      {/* Booking Selection */}
      <div className="bg-white rounded-[2.5rem] border border-[#3a1224]/5 p-10 lg:p-12 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-[#3a1224] rounded-2xl flex items-center justify-center text-[#C0A04C] font-black">01</div>
          <h3 className="text-xl font-black text-[#3a1224] uppercase tracking-wider">Select Your Booking</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="block text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.2em]">CONFIRMED BOOKING *</label>
            <select
              value={selectedBookingId}
              onChange={(e) => setSelectedBookingId(e.target.value)}
              className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[2rem] px-8 py-5 text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 transition-all outline-none"
            >
              <option value="">Select a booking...</option>
              {bookings.map((booking) => (
                <option key={booking._id} value={booking._id}>
                  {booking.hallId?.name || "Hall"} - {formatDate(booking.date)}
                </option>
              ))}
            </select>
            {loadingBookings && (
              <p className="text-xs text-[#C0A04C] flex items-center gap-2 font-bold uppercase tracking-widest">
                <Zap className="w-3 h-3 animate-pulse" /> Loading bookings...
              </p>
            )}
            {!loadingBookings && bookings.length === 0 && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-700 font-medium">No eligible hall bookings found.</p>
              </div>
            )}
          </div>

          {selectedBooking && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#3a1224] rounded-[2rem] p-8 text-white"
            >
              <h4 className="text-xl font-black mb-1">{selectedBooking.hallId?.name || "Venue Name"}</h4>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-6">Foundation Details</p>
              
              <div className="space-y-4 pt-6 border-t border-white/10">
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Date</p>
                  <p className="text-sm font-bold">{formatDate(selectedBooking.date)}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Guests</p>
                  <p className="text-sm font-bold">{selectedBooking.guests}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Event Details Form */}
      {selectedBookingId && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-[#3a1224]/5 p-10 lg:p-12 shadow-sm"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#3a1224] rounded-2xl flex items-center justify-center text-[#C0A04C] font-black">02</div>
            <h3 className="text-xl font-black text-[#3a1224] uppercase tracking-wider">Event Details</h3>
          </div>
          
          <ProfessionalEventForm 
            onSubmit={onFormSubmit}
            isLoading={isCreating}
          />
        </motion.div>
      )}
    </div>
  );
}
