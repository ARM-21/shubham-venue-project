"use client";

import { 
  CalendarCheck, 
  PlusCircle, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical,
  Calendar,
  Users,
  Ticket,
  Zap,
  Fingerprint,
  Plus
} from "lucide-react";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

function statusTone(status) {
  switch (status?.toUpperCase()) {
    case "PUBLISHED":
      return "text-emerald-600 bg-emerald-50 border-emerald-100";
    case "DRAFT":
      return "text-amber-600 bg-amber-50 border-amber-100";
    case "CANCELLED":
      return "text-rose-600 bg-rose-50 border-rose-100";
    default:
      return "text-gray-600 bg-gray-50 border-gray-100";
  }
}

export default function OrganizerEventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
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

  useEffect(() => {
    let ignore = false;
    async function fetchEvents() {
      try {
        setLoading(true);
        const params = statusFilter !== "all" ? { status: statusFilter } : undefined;
        const res = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENTS, { params });
        if (!ignore) setEvents(res.data?.events || []);
      } catch (err) {
        if (!ignore) toast.error(err?.response?.data?.message || "Failed to load events");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (isApproved) fetchEvents();

    return () => {
      ignore = true;
    };
  }, [statusFilter, isApproved]);

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
            You need to be a verified producer to manage event listings. 
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[#C0A04C]/40" />
            <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Portfolio</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-black text-[#3a1224] tracking-tight">
            My <span className="text-[#C0A04C]">Events</span>
          </h1>
          <p className="mt-6 text-[#3a1224]/50 text-base font-medium max-w-lg leading-relaxed">
            A centralized hub for tracking your professional listings and attendee engagement metrics.
          </p>
        </div>
        
        <button
          onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW)}
          className="group flex items-center gap-4 px-10 py-5 bg-[#3a1224] text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#3a1224]/10"
        >
          <Plus className="w-4 h-4 text-[#C0A04C] group-hover:rotate-90 transition-transform duration-500" />
          Create New Event
        </button>
      </div>

      {/* Controller Bar */}
      <div className="flex flex-wrap items-center gap-3">
         {['all', 'DRAFT', 'PUBLISHED', 'CANCELLED'].map((filter) => (
           <button
             key={filter}
             onClick={() => setStatusFilter(filter)}
             className={`px-8 py-3 rounded-[1.5rem] border text-[10px] font-black uppercase tracking-widest transition-all ${
               statusFilter === filter 
                 ? "bg-[#C0A04C] border-[#C0A04C] text-[#3a1224] shadow-lg shadow-[#C0A04C]/20" 
                 : "bg-white border-[#3a1224]/5 text-[#3a1224]/40 hover:border-[#3a1224]/10 hover:text-[#3a1224]/60"
             }`}
           >
             {filter}
           </button>
         ))}
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[3rem] p-10 border border-[#3a1224]/5 animate-pulse">
               <div className="w-12 h-12 bg-[#3a1224]/5 rounded-2xl mb-8" />
               <div className="h-4 w-3/4 bg-[#3a1224]/5 rounded-full mb-4" />
               <div className="h-4 w-1/2 bg-[#3a1224]/5 rounded-full" />
            </div>
          ))
        ) : events.length === 0 ? (
          <div className="md:col-span-3 py-32 text-center bg-white rounded-[4rem] border border-dashed border-[#3a1224]/10">
             <Calendar className="w-12 h-12 text-[#3a1224]/10 mx-auto mb-6" />
             <p className="text-[#3a1224]/40 text-sm font-bold uppercase tracking-widest">No matching events found</p>
          </div>
        ) : (
          events.map((event) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_DETAIL(event._id))}
              className="group bg-white rounded-[3rem] border border-[#3a1224]/5 overflow-hidden hover:shadow-2xl hover:shadow-[#3a1224]/5 transition-all duration-700 cursor-pointer flex flex-col h-full"
            >
               {/* Identity Section */}
               <div className="p-10 flex-1">
                  <div className="flex items-center justify-between mb-8">
                     <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${statusTone(event.status)}`}>
                        {event.status}
                     </div>
                     <Zap className="w-4 h-4 text-[#C0A04C]/20 group-hover:text-[#C0A04C] transition-colors duration-500" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-[#3a1224] mb-3 leading-tight group-hover:text-[#C0A04C] transition-colors duration-500">
                    {event.name}
                  </h3>
                  <p className="text-[#3a1224]/40 text-[10px] font-bold uppercase tracking-[0.2em] mb-10">
                    {event.type || "Special Event"}
                  </p>

                  <div className="space-y-4">
                     <div className="flex items-center gap-4">
                        <Calendar className="w-4 h-4 text-[#C0A04C]/40" />
                        <span className="text-xs font-bold text-[#3a1224]/60">{formatDate(event.startDateTime || event.bookingId?.date)}</span>
                     </div>
                     <div className="flex items-center gap-4">
                        <Users className="w-4 h-4 text-[#C0A04C]/40" />
                        <span className="text-xs font-bold text-[#3a1224]/60">{event.bookingId?.guests || 0} Capacity</span>
                     </div>
                  </div>
               </div>

               {/* Stats Summary */}
               <div className="bg-[#3a1224] p-10 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-white">
                     <Ticket className="w-5 h-5 text-[#C0A04C]" />
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Visibility</span>
                        <span className="text-xs font-bold uppercase tracking-wider">{event.isPublic ? "Public" : "Private"}</span>
                     </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-[#C0A04C] group-hover:text-[#3a1224] transition-all duration-500">
                     <ChevronRight className="w-5 h-5" />
                  </div>
               </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
     