"use client";

import { 
  CalendarCheck, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  Clock, 
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  Zap,
  Ticket,
  ChevronRight,
  Fingerprint,
  Info
} from "lucide-react";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMemo } from "react";

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
  const [status, setStatus] = useState(null);

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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      bookingId: "",
      name: "",
      type: "",
      description: "",
      visibility: "public",
      accessCode: "",
      bannerUrl: "",
      startDateTime: "",
      endDateTime: "",
    },
  });

  const visibility = watch("visibility");
  const selectedBookingId = watch("bookingId");

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

  const selectedBooking = useMemo(() => bookings.find((b) => String(b._id) === String(selectedBookingId)), [bookings, selectedBookingId]);

  async function onSubmit(values) {
    const payload = {
      bookingId: values.bookingId,
      name: values.name?.trim(),
      type: values.type?.trim(),
      description: values.description?.trim(),
      isPublic: values.visibility === "public",
      accessCode: values.visibility === "private" ? values.accessCode?.trim() : null,
      bannerUrl: values.bannerUrl?.trim(),
      startDateTime: values.startDateTime || undefined,
      endDateTime: values.endDateTime || undefined,
    };

    try {
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
    <div className="max-w-[1000px] mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[#C0A04C]/40" />
            <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Launch Center</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-[#3a1224] tracking-tight">
            Create <span className="text-[#C0A04C]">Event</span>
          </h1>
          <p className="mt-6 text-[#3a1224]/50 text-base font-medium max-w-lg leading-relaxed">
            Transform your confirmed hall booking into a professional digital event experience.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* Step 1: Base Booking */}
        <section className="bg-white rounded-[3rem] border border-[#3a1224]/5 p-10 lg:p-12 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#C0A04C]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
           
           <div className="relative">
              <div className="flex items-center gap-4 mb-10">
                 <div className="w-12 h-12 bg-[#3a1224] rounded-2xl flex items-center justify-center text-[#C0A04C] font-black">01</div>
                 <h3 className="text-xl font-black text-[#3a1224] uppercase tracking-wider">Select Foundation</h3>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <label className="block text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.2em] ml-2">CONFIRMED BOOKING *</label>
                    <div className="relative group">
                       <select
                         {...register("bookingId", { required: "Booking is required" })}
                         className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[2rem] px-8 py-5 text-sm font-bold text-[#3a1224] appearance-none focus:ring-2 ring-[#C0A04C]/20 transition-all outline-none"
                       >
                         <option value="">Select a booking...</option>
                         {bookings.map((booking) => (
                           <option key={booking._id} value={booking._id}>
                             {booking.hallId?.name || "Hall"} - {formatDate(booking.date)}
                           </option>
                         ))}
                       </select>
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#3a1224]/30">
                          <ChevronRight className="w-5 h-5 rotate-90" />
                       </div>
                    </div>
                    {loadingBookings && <p className="text-xs text-[#C0A04C] flex items-center gap-2 font-bold uppercase tracking-widest"><Zap className="w-3 h-3 animate-pulse" /> Scanning reservations...</p>}
                    {!loadingBookings && bookings.length === 0 && (
                      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                         <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                         <p className="text-xs text-amber-700 font-medium leading-relaxed">No eligible hall bookings found. You must have a confirmed booking and hasn't started yet.</p>
                      </div>
                    )}
                    {errors.bookingId && <p className="text-xs text-rose-500 font-bold ml-2 uppercase tracking-wider">{errors.bookingId.message}</p>}
                 </div>

                 <AnimatePresence mode="wait">
                   {selectedBooking ? (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="bg-[#3a1224] rounded-[2.5rem] p-8 text-white relative overflow-hidden"
                     >
                        <div className="relative z-10">
                           <div className="flex items-center justify-between mb-8">
                              <span className="px-4 py-1.5 bg-[#C0A04C] text-[#3a1224] rounded-full text-[9px] font-black uppercase tracking-widest">Foundation Details</span>
                              <Calendar className="w-5 h-5 text-[#C0A04C]/40" />
                           </div>
                           <h4 className="text-2xl font-black mb-1">{selectedBooking.hallId?.name || "Venue Name"}</h4>
                           <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-8">{selectedBooking.slot} Session</p>
                           
                           <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                              <div>
                                 <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Date</p>
                                 <p className="text-sm font-bold">{formatDate(selectedBooking.date)}</p>
                              </div>
                              <div>
                                 <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Attendance</p>
                                 <p className="text-sm font-bold">{selectedBooking.guests} Guests</p>
                              </div>
                           </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#C0A04C] opacity-5 rounded-full translate-y-1/2 translate-x-1/2" />
                     </motion.div>
                   ) : (
                     <div className="h-full border-2 border-dashed border-[#3a1224]/5 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center bg-[#fdfaf6]/50">
                        <Info className="w-8 h-8 text-[#3a1224]/10 mb-4" />
                        <p className="text-xs text-[#3a1224]/40 font-bold uppercase tracking-widest">Select foundation to preview details</p>
                     </div>
                   )}
                 </AnimatePresence>
              </div>
           </div>
        </section>

        {/* Step 2: Identity */}
        <section className="bg-white rounded-[3rem] border border-[#3a1224]/5 p-10 lg:p-12 shadow-sm">
           <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-[#3a1224] rounded-2xl flex items-center justify-center text-[#C0A04C] font-black">02</div>
              <h3 className="text-xl font-black text-[#3a1224] uppercase tracking-wider">Event Identity</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <label className="block text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.2em] ml-2">EVENT TITLE *</label>
                 <input
                   {...register("name", { required: "Event name is required" })}
                   className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] px-8 py-4 text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 transition-all outline-none"
                   placeholder="e.g. The Grand Gala 2024"
                 />
                 {errors.name && <p className="text-xs text-rose-500 font-bold ml-2 uppercase tracking-wider">{errors.name.message}</p>}
              </div>
              <div className="space-y-6">
                 <label className="block text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.2em] ml-2">EVENT CATEGORY</label>
                 <input
                   {...register("type")}
                   className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] px-8 py-4 text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 transition-all outline-none"
                   placeholder="Wedding, Corporate, etc."
                 />
              </div>
              <div className="md:col-span-2 space-y-6">
                 <label className="block text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.2em] ml-2">MISSION & DESCRIPTION</label>
                 <textarea
                   {...register("description")}
                   className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[2rem] px-8 py-6 text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 transition-all outline-none resize-none"
                   rows={5}
                   placeholder="Outline the vision and agenda for your event..."
                 />
              </div>
           </div>
        </section>

        {/* Step 3: Access Control */}
        <section className="bg-white rounded-[3rem] border border-[#3a1224]/5 p-10 lg:p-12 shadow-sm">
           <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-[#3a1224] rounded-2xl flex items-center justify-center text-[#C0A04C] font-black">03</div>
              <h3 className="text-xl font-black text-[#3a1224] uppercase tracking-wider">Security & Reach</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <label className="block text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.2em] ml-2">VISIBILITY LEVEL</label>
                 <div className="grid grid-cols-2 gap-4">
                    <label className={`cursor-pointer group relative flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all ${visibility === 'public' ? 'border-[#C0A04C] bg-[#C0A04C]/5' : 'border-[#3a1224]/5 bg-[#fdfaf6]'}`}>
                       <input type="radio" {...register("visibility")} value="public" className="hidden" />
                       <Sparkles className={`w-6 h-6 ${visibility === 'public' ? 'text-[#C0A04C]' : 'text-[#3a1224]/20'}`} />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${visibility === 'public' ? 'text-[#C0A04C]' : 'text-[#3a1224]/40'}`}>Public</span>
                    </label>
                    <label className={`cursor-pointer group relative flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all ${visibility === 'private' ? 'border-[#C0A04C] bg-[#C0A04C]/5' : 'border-[#3a1224]/5 bg-[#fdfaf6]'}`}>
                       <input type="radio" {...register("visibility")} value="private" className="hidden" />
                       <ShieldCheck className={`w-6 h-6 ${visibility === 'private' ? 'text-[#C0A04C]' : 'text-[#3a1224]/20'}`} />
                       <span className={`text-[10px] font-black uppercase tracking-widest ${visibility === 'private' ? 'text-[#C0A04C]' : 'text-[#3a1224]/40'}`}>Private</span>
                    </label>
                 </div>
              </div>
              
              <div className="space-y-6">
                 <label className={`block text-[10px] font-black uppercase tracking-[0.2em] ml-2 ${visibility === 'private' ? 'text-[#3a1224]/40' : 'text-[#3a1224]/10'}`}>PASSPHRASE CODE</label>
                 <div className="relative">
                    <input
                      {...register("accessCode", {
                        validate: (value) => {
                          if (visibility !== "private") return true;
                          return value && value.trim().length >= 4 ? true : "Min 4 characters required for private events";
                        },
                      })}
                      disabled={visibility !== 'private'}
                      className={`w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] px-8 py-4 text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 transition-all outline-none ${visibility !== 'private' ? 'opacity-20 bg-gray-100 grayscale' : ''}`}
                      placeholder="e.g. VIP2024"
                    />
                    <Fingerprint className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3a1224]/10" />
                 </div>
                 {errors.accessCode && <p className="text-xs text-rose-500 font-bold ml-2 uppercase tracking-wider">{errors.accessCode.message}</p>}
              </div>

              <div className="md:col-span-2 space-y-6">
                 <label className="block text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.2em] ml-2">CINEMATIC BANNER URL</label>
                 <div className="relative">
                    <input
                      {...register("bannerUrl")}
                      className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] px-8 py-4 text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 transition-all outline-none"
                      placeholder="https://images.unsplash.com/..."
                    />
                    <Zap className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#3a1224]/10" />
                 </div>
              </div>
           </div>
        </section>

        {/* Step 4: Schedule */}
        <section className="bg-white rounded-[3rem] border border-[#3a1224]/5 p-10 lg:p-12 shadow-sm">
           <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-[#3a1224] rounded-2xl flex items-center justify-center text-[#C0A04C] font-black">04</div>
              <h3 className="text-xl font-black text-[#3a1224] uppercase tracking-wider">Timeline</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                 <label className="block text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.2em] ml-2">COMMENCEMENT</label>
                 <input
                   type="datetime-local"
                   {...register("startDateTime")}
                   className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] px-8 py-4 text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 transition-all outline-none"
                 />
              </div>
              <div className="space-y-6">
                 <label className="block text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.2em] ml-2">CONCLUSION</label>
                 <input
                   type="datetime-local"
                   {...register("endDateTime")}
                   className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] px-8 py-4 text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 transition-all outline-none"
                 />
              </div>
           </div>
        </section>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-6 pt-10">
           <button
             type="button"
             onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)}
             className="px-10 py-5 text-[#3a1224]/40 text-xs font-black uppercase tracking-widest hover:text-[#3a1224] transition-all"
           >
             Cancel Draft
           </button>
           <button
             type="submit"
             disabled={isSubmitting}
             className="w-full sm:w-auto px-12 py-5 bg-[#3a1224] text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#3a1224]/10 disabled:opacity-50"
           >
             {isSubmitting ? "Processing..." : "Launch Event"}
           </button>
        </div>
      </form>
    </div>
  );
}
