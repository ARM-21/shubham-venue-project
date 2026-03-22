"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { 
  RefreshCcw, 
  Calendar, 
  Users, 
  Ticket, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Fingerprint, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  QrCode,
  LayoutDashboard,
  Sparkles,
  Info,
  ArrowRight,
  MoreVertical,
  Activity
} from "lucide-react";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { PlusCircle } from "lucide-react";

const ATTENDEE_LIMIT = 20;

function toLocalInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

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

export default function OrganizerEventDetailPage() {
  const router = useRouter();
  const { eventId } = useParams();
  const { user } = useAuth();
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

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [attendees, setAttendees] = useState([]);
  const [attendeeQuery, setAttendeeQuery] = useState("");
  const [attendeesPage, setAttendeesPage] = useState(1);
  const [attendeesTotal, setAttendeesTotal] = useState(0);
  const [attendeesLoading, setAttendeesLoading] = useState(false);

  const [newType, setNewType] = useState({ name: "", price: "", quantityTotal: "" });
  const [savingType, setSavingType] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editType, setEditType] = useState({ name: "", price: "", quantityTotal: "", isActive: true });

  const [checkinCode, setCheckinCode] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      type: "",
      description: "",
      visibility: "public",
      accessCode: "",
      bannerUrl: "",
      startDateTime: "",
      endDateTime: "",
      status: "DRAFT",
    },
  });

  const visibility = watch("visibility");

  useEffect(() => {
    let ignore = false;
    async function fetchEvent() {
      try {
        setLoading(true);
        const [eventRes, ticketsRes] = await Promise.all([
          axiosInstance.get(ROUTES.API.ORGANIZER.EVENT(eventId)),
          axiosInstance.get(ROUTES.API.ORGANIZER.EVENT_TICKET_TYPES(eventId)),
        ]);

        if (!ignore) {
          const loadedEvent = eventRes.data?.event;
          setEvent(loadedEvent || null);
          setTicketTypes(ticketsRes.data?.ticketTypes || []);
          if (loadedEvent) {
            reset({
              name: loadedEvent.name || "",
              type: loadedEvent.type || "",
              description: loadedEvent.description || "",
              visibility: loadedEvent.isPublic ? "public" : "private",
              accessCode: loadedEvent.accessCode || "",
              bannerUrl: loadedEvent.bannerUrl || "",
              startDateTime: toLocalInputValue(loadedEvent.startDateTime),
              endDateTime: toLocalInputValue(loadedEvent.endDateTime),
              status: loadedEvent.status || "DRAFT",
            });
          }
        }
      } catch (err) {
        if (!ignore) {
          toast.error(err?.response?.data?.message || "Failed to load event");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (isApproved && eventId) fetchEvent();

    return () => {
      ignore = true;
    };
  }, [eventId, isApproved, reset]);

  useEffect(() => {
    let ignore = false;
    async function fetchAttendees(pageValue) {
      try {
        setAttendeesLoading(true);
        const res = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENT_ATTENDEES(eventId), {
          params: { page: pageValue, limit: ATTENDEE_LIMIT },
        });
        if (!ignore) {
          setAttendees(res.data?.attendees || []);
          setAttendeesTotal(res.data?.total || 0);
        }
      } catch (err) {
        if (!ignore) {
          toast.error(err?.response?.data?.message || "Failed to load attendees");
        }
      } finally {
        if (!ignore) setAttendeesLoading(false);
      }
    }

    if (isApproved && eventId) fetchAttendees(attendeesPage);

    return () => {
      ignore = true;
    };
  }, [attendeesPage, eventId, isApproved]);

  const refreshAttendees = async (pageValue = attendeesPage) => {
    try {
      setAttendeesLoading(true);
      const res = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENT_ATTENDEES(eventId), {
        params: { page: pageValue, limit: ATTENDEE_LIMIT },
      });
      setAttendees(res.data?.attendees || []);
      setAttendeesTotal(res.data?.total || 0);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load attendees");
    } finally {
      setAttendeesLoading(false);
    }
  };

  const filteredAttendees = useMemo(() => {
    if (!attendeeQuery.trim()) return attendees;
    const q = attendeeQuery.trim().toLowerCase();
    return attendees.filter((a) => {
      const name = `${a.attendee?.first_name || ""} ${a.attendee?.last_name || ""}`.toLowerCase();
      const email = String(a.attendee?.email || "").toLowerCase();
      const code = String(a.qrCodeValue || "").toLowerCase();
      return name.includes(q) || email.includes(q) || code.includes(q);
    });
  }, [attendees, attendeeQuery]);

  async function saveEvent(values) {
    if (values.visibility === "private" && (!values.accessCode || values.accessCode.trim().length < 4)) {
      toast.error("Access code must be at least 4 characters for private events");
      return;
    }

    try {
      const payload = {
        name: values.name?.trim(),
        type: values.type?.trim(),
        description: values.description?.trim(),
        isPublic: values.visibility === "public",
        accessCode: values.visibility === "private" ? values.accessCode?.trim() : null,
        bannerUrl: values.bannerUrl?.trim(),
        startDateTime: values.startDateTime || undefined,
        endDateTime: values.endDateTime || undefined,
        status: values.status,
      };
      const res = await axiosInstance.patch(ROUTES.API.ORGANIZER.EVENT(eventId), payload);
      setEvent(res.data?.event || null);
      toast.success("Event updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update event");
    }
  }

  async function refreshTicketTypes() {
    try {
      const res = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENT_TICKET_TYPES(eventId));
      setTicketTypes(res.data?.ticketTypes || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load ticket types");
    }
  }

  async function addTicketType() {
    if (savingType) return;
    if (!newType.name.trim()) {
      toast.error("Ticket name is required");
      return;
    }
    const price = Number(newType.price);
    const quantityTotal = Number(newType.quantityTotal);
    if (!Number.isFinite(price) || price < 0) {
      toast.error("Invalid ticket price");
      return;
    }
    if (!Number.isFinite(quantityTotal) || quantityTotal < 1) {
      toast.error("Quantity must be at least 1");
      return;
    }

    try {
      setSavingType(true);
      await axiosInstance.post(ROUTES.API.ORGANIZER.EVENT_TICKET_TYPES(eventId), {
        name: newType.name.trim(),
        price,
        quantityTotal,
      });
      setNewType({ name: "", price: "", quantityTotal: "" });
      toast.success("Ticket type added");
      refreshTicketTypes();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add ticket type");
    } finally {
      setSavingType(false);
    }
  }

  function startEdit(type) {
    setEditingTypeId(type._id);
    setEditType({
      name: type.name || "",
      price: type.price ?? "",
      quantityTotal: type.quantityTotal ?? "",
      isActive: type.isActive !== false,
    });
  }

  async function saveEdit(typeId) {
    try {
      if (!editType.name.trim()) {
        toast.error("Ticket name is required");
        return;
      }
      const priceValue = Number(editType.price);
      const quantityValue = Number(editType.quantityTotal);
      if (!Number.isFinite(priceValue) || priceValue < 0) {
        toast.error("Invalid ticket price");
        return;
      }
      if (!Number.isFinite(quantityValue) || quantityValue < 1) {
        toast.error("Quantity must be at least 1");
        return;
      }
      const payload = {
        name: editType.name.trim(),
        price: priceValue,
        quantityTotal: quantityValue,
        isActive: Boolean(editType.isActive),
      };
      await axiosInstance.patch(ROUTES.API.ORGANIZER.TICKET_TYPE(typeId), payload);
      toast.success("Ticket type updated");
      setEditingTypeId(null);
      refreshTicketTypes();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update ticket type");
    }
  }

  async function handleCheckin() {
    if (!checkinCode.trim()) {
      toast.error("QR code is required");
      return;
    }
    if (checkinLoading) return;

    try {
      setCheckinLoading(true);
      await axiosInstance.post(ROUTES.API.ORGANIZER.EVENT_CHECKIN(eventId), { qrCodeValue: checkinCode.trim() });
      toast.success("Check-in successful");
      setCheckinCode("");
      setAttendeesPage(1);
      refreshAttendees(1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Check-in failed");
    } finally {
      setCheckinLoading(false);
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
            You need to be a verified producer to manage event details. 
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="w-16 h-16 border-4 border-[#C0A04C] border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.3em]">Accessing Event Data...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-[#3a1224]/10">
        <XCircle className="w-12 h-12 text-rose-500/20 mx-auto mb-6" />
        <p className="text-[#3a1224]/40 text-sm font-bold uppercase tracking-widest">Event record not found</p>
      </div>
    );
  }

  const totalPages = Math.ceil(attendeesTotal / ATTENDEE_LIMIT) || 1;

  return (
    <div className="max-w-[1200px] mx-auto space-y-12 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
             <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${statusTone(event.status)}`}>
                {event.status}
             </div>
             <div className="w-12 h-[1px] bg-[#3a1224]/10" />
             <span className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.4em]">Control Center</span>
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-[#3a1224] tracking-tight mb-6">
            {event.name}
          </h1>
          <div className="flex flex-wrap items-center gap-8 text-[#3a1224]/60 font-medium">
             <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#C0A04C]" />
                <span className="text-sm">{formatDate(event.startDateTime || event.bookingId?.date)}</span>
             </div>
             <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#C0A04C]" />
                <span className="text-sm">{event.bookingId?.guests} Expected Guests</span>
             </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <button
             onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)}
             className="px-10 py-5 bg-white border border-[#3a1224]/5 text-[#3a1224] rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-[#3a1224] hover:text-white transition-all shadow-sm"
           >
             Back to Portfolio
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Left Column: Form and Settings */}
        <div className="xl:col-span-2 space-y-12">
           {/* Section: Identity & Content */}
           <section className="bg-white rounded-[3rem] border border-[#3a1224]/5 p-10 lg:p-12 shadow-sm">
              <div className="flex items-center gap-4 mb-12">
                 <div className="w-12 h-12 bg-[#3a1224] rounded-2xl flex items-center justify-center text-[#C0A04C] font-black shadow-lg">01</div>
                 <h3 className="text-xl font-black text-[#3a1224] uppercase tracking-wider">Identity & Content</h3>
              </div>

              <form onSubmit={handleSubmit(saveEvent)} className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Event Name</label>
                       <input
                         {...register("name", { required: "Name is required" })}
                         className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] px-8 py-5 text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all"
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Category</label>
                       <input
                         {...register("type")}
                         className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] px-8 py-5 text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all"
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Description</label>
                    <textarea
                      {...register("description")}
                      rows={5}
                      className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[2rem] px-8 py-6 text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all resize-none"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Visibility</label>
                       <select
                         {...register("visibility")}
                         className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] px-8 py-5 text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 appearance-none"
                       >
                         <option value="public">Public - Searchable</option>
                         <option value="private">Private - Password Required</option>
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Passphrase</label>
                       <input
                         {...register("accessCode")}
                         className={`w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] px-8 py-5 text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all ${visibility !== 'private' ? 'opacity-30 grayscale' : ''}`}
                         placeholder="Min 4 chars"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Timeline Start</label>
                       <input
                         type="datetime-local"
                         {...register("startDateTime")}
                         className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] px-8 py-5 text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20"
                       />
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Timeline End</label>
                       <input
                         type="datetime-local"
                         {...register("endDateTime")}
                         className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] px-8 py-5 text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20"
                       />
                    </div>
                 </div>

                 <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-[#3a1224]/5">
                    <div className="flex-1">
                       <label className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2 block mb-4">Lifecycle Status</label>
                       <div className="flex flex-wrap gap-4">
                          {['DRAFT', 'PUBLISHED', 'CANCELLED'].map((s) => (
                             <label key={s} className="cursor-pointer">
                                <input type="radio" {...register("status")} value={s} className="hidden" />
                                <span className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all inline-block ${watch("status") === s ? "bg-[#3a1224] text-[#C0A04C] shadow-lg shadow-[#3a1224]/20" : "bg-[#fdfaf6] text-[#3a1224]/40 border border-[#3a1224]/5"}`}>
                                   {s}
                                </span>
                             </label>
                          ))}
                       </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full md:w-auto px-12 py-5 bg-[#3a1224] text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#3a1224]/10 disabled:opacity-50"
                    >
                      {isSubmitting ? "Syncing..." : "Update Event"}
                    </button>
                 </div>
              </form>
           </section>

           {/* Section: Guest Passports (Attendees) */}
           <section className="bg-white rounded-[3rem] border border-[#3a1224]/5 p-10 lg:p-12 shadow-sm overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#3a1224] rounded-2xl flex items-center justify-center text-[#C0A04C] font-black shadow-lg">02</div>
                    <h3 className="text-xl font-black text-[#3a1224] uppercase tracking-wider">Attendee Manifest</h3>
                 </div>
                 <div className="relative group min-w-[300px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a1224]/20 group-hover:text-[#C0A04C] transition-colors" />
                    <input
                      type="text"
                      placeholder="Filter by name or email..."
                      value={attendeeQuery}
                      onChange={(e) => setAttendeeQuery(e.target.value)}
                      className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-[1.5rem] pl-16 pr-8 py-4 text-xs font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none"
                    />
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="border-b border-[#3a1224]/5">
                          <th className="pb-6 text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest pl-4">Guest</th>
                          <th className="pb-6 text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest">Passport ID</th>
                          <th className="pb-6 text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest">Entry Date</th>
                          <th className="pb-6 text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest text-right pr-4">Identity</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-[#3a1224]/5">
                       {attendeesLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                             <tr key={i} className="animate-pulse">
                                <td className="py-8 pl-4"><div className="w-32 h-4 bg-[#3a1224]/5 rounded-full" /></td>
                                <td className="py-8"><div className="w-24 h-4 bg-[#3a1224]/5 rounded-full" /></td>
                                <td className="py-8"><div className="w-20 h-4 bg-[#3a1224]/5 rounded-full" /></td>
                                <td className="py-8 pr-4 text-right"><div className="w-16 h-4 bg-[#3a1224]/5 rounded-full ml-auto" /></td>
                             </tr>
                          ))
                       ) : filteredAttendees.length === 0 ? (
                          <tr>
                             <td colSpan={4} className="py-32 text-center">
                                <Users className="w-12 h-12 text-[#3a1224]/5 mx-auto mb-4" />
                                <p className="text-[10px] font-black text-[#3a1224]/20 uppercase tracking-[0.2em]">Manifest is empty</p>
                             </td>
                          </tr>
                       ) : (
                          filteredAttendees.map((a) => (
                             <tr key={a._id} className="group hover:bg-[#fdfaf6] transition-colors">
                                <td className="py-8 pl-4">
                                   <div className="flex flex-col">
                                      <span className="text-sm font-black text-[#3a1224]">{a.attendee?.first_name} {a.attendee?.last_name}</span>
                                      <span className="text-[10px] font-bold text-[#3a1224]/40 uppercase tracking-tight">{a.attendee?.email}</span>
                                   </div>
                                </td>
                                <td className="py-8 text-xs font-black text-[#C0A04C]">{a.qrCodeValue}</td>
                                <td className="py-8 text-xs font-bold text-[#3a1224]/60">{formatDate(a.checkInDateTime || a.createdAt)}</td>
                                <td className="py-8 pr-4 text-right">
                                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${a.checkedIn ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-[#3a1224]/5 text-[#3a1224]/40'}`}>
                                      {a.checkedIn ? 'Inside Venue' : 'Awaiting Entry'}
                                   </span>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
              </div>

              {totalPages > 1 && (
                 <div className="flex items-center justify-between mt-12 pt-12 border-t border-[#3a1224]/5">
                    <p className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest">Page {attendeesPage} of {totalPages}</p>
                    <div className="flex gap-4">
                       <button
                         disabled={attendeesPage <= 1}
                         onClick={() => setAttendeesPage(p => p - 1)}
                         className="px-6 py-2.5 rounded-full bg-white border border-[#3a1224]/5 text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all hover:bg-[#3a1224] hover:text-white"
                       >
                         Previous
                       </button>
                       <button
                         disabled={attendeesPage >= totalPages}
                         onClick={() => setAttendeesPage(p => p + 1)}
                         className="px-6 py-2.5 rounded-full bg-white border border-[#3a1224]/5 text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all hover:bg-[#3a1224] hover:text-white"
                       >
                         Next
                       </button>
                    </div>
                 </div>
              )}
           </section>
        </div>

        {/* Right Column: Rapid Check-in & Ticket Tiers */}
        <div className="space-y-12">
           {/* Rapid Entry Terminal */}
           <section className="bg-[#3a1224] rounded-[3rem] p-10 lg:p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                 <div className="flex items-center gap-4 mb-8">
                    <QrCode className="w-8 h-8 text-[#C0A04C]" />
                    <h3 className="text-xl font-black uppercase tracking-wider">Entry Terminal</h3>
                 </div>
                 <p className="text-white/40 text-xs font-medium leading-relaxed mb-10">
                   Scan QR code values manually here if primary terminal is offline.
                 </p>
                 
                 <div className="space-y-6">
                    <input
                      type="text"
                      placeholder="Passport ID / QR Value"
                      value={checkinCode}
                      onChange={(e) => setCheckinCode(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-sm font-bold text-white outline-none focus:ring-2 ring-[#C0A04C]/50 transition-all"
                    />
                    <button
                      onClick={handleCheckin}
                      disabled={checkinLoading}
                      className="w-full py-5 bg-[#C0A04C] text-[#3a1224] rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#C0A04C]/20 disabled:opacity-50"
                    >
                      {checkinLoading ? "Processing..." : "Validate Entry"}
                    </button>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
           </section>

           {/* Ticket Inventory Terminal */}
           <section className="bg-white rounded-[3rem] border border-[#3a1224]/5 p-10 lg:p-12 shadow-sm">
              <div className="flex items-center justify-between mb-12">
                 <div className="flex items-center gap-4">
                    <Ticket className="w-5 h-5 text-[#C0A04C]" />
                    <h3 className="text-lg font-black text-[#3a1224] uppercase tracking-wider">Inventory</h3>
                 </div>
                 <button onClick={refreshTicketTypes} className="p-2.5 rounded-xl bg-[#3a1224]/5 hover:bg-[#C0A04C]/10 text-[#C0A04C] transition-all">
                    <RefreshCcw className="w-4 h-4" />
                 </button>
              </div>

              <div className="space-y-10">
                 {/* Existing Tires */}
                 <div className="space-y-6">
                    {ticketTypes.map((type) => (
                       <div key={type._id} className="relative group bg-[#fdfaf6] rounded-[2rem] border border-[#3a1224]/5 p-8 transition-all hover:border-[#C0A04C]/30">
                          {editingTypeId === type._id ? (
                             <div className="space-y-6">
                                <input
                                  value={editType.name}
                                  onChange={(e) => setEditType({ ...editType, name: e.target.value })}
                                  placeholder="Tier Name"
                                  className="w-full bg-white border border-[#3a1224]/10 rounded-xl px-4 py-3 text-xs font-bold"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                   <input
                                     type="number"
                                     value={editType.price}
                                     onChange={(e) => setEditType({ ...editType, price: e.target.value })}
                                     placeholder="NRS"
                                     className="w-full bg-white border border-[#3a1224]/10 rounded-xl px-4 py-3 text-xs font-bold"
                                   />
                                   <input
                                     type="number"
                                     value={editType.quantityTotal}
                                     onChange={(e) => setEditType({ ...editType, quantityTotal: e.target.value })}
                                     placeholder="Qty"
                                     className="w-full bg-white border border-[#3a1224]/10 rounded-xl px-4 py-3 text-xs font-bold"
                                   />
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                   <button onClick={() => saveEdit(type._id)} className="flex-1 py-3 bg-[#3a1224] text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Save</button>
                                   <button onClick={() => setEditingTypeId(null)} className="flex-1 py-3 bg-white border border-[#3a1224]/5 text-[#3a1224]/40 rounded-xl text-[10px] font-black uppercase tracking-widest">Undo</button>
                                </div>
                             </div>
                          ) : (
                             <div className="flex flex-col">
                                <div className="flex items-center justify-between mb-4">
                                   <span className="text-[9px] font-black text-[#C0A04C] uppercase tracking-[0.2em]">{type.isActive ? 'Active Inventory' : 'Inactive'}</span>
                                   <button onClick={() => startEdit(type)} className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#3a1224]/20 hover:text-[#3a1224]">
                                      <Activity className="w-4 h-4" />
                                   </button>
                                </div>
                                <h4 className="text-lg font-black text-[#3a1224]">{type.name}</h4>
                                <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#3a1224]/5">
                                   <div className="flex flex-col">
                                      <span className="text-[8px] font-black text-[#3a1224]/20 uppercase tracking-widest">Rate</span>
                                      <span className="text-sm font-black text-[#3a1224]">NRS {type.price}</span>
                                   </div>
                                   <div className="flex flex-col text-right">
                                      <span className="text-[8px] font-black text-[#3a1224]/20 uppercase tracking-widest">Stock</span>
                                      <span className="text-sm font-black text-[#3a1224]">{type.quantitySold} / {type.quantityTotal}</span>
                                   </div>
                                </div>
                             </div>
                          )}
                       </div>
                    ))}
                 </div>

                 {/* New Tier Terminal */}
                 <div className="pt-10 border-t border-[#3a1224]/10">
                    <div className="flex items-center gap-4 mb-8">
                       <PlusCircle className="w-4 h-4 text-[#C0A04C]" />

                       <span className="text-[10px] font-black text-[#3a1224] uppercase tracking-widest">Commission New Tier</span>
                    </div>
                    <div className="space-y-4">
                       <input
                         value={newType.name}
                         onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                         placeholder="Tier Identity (e.g. VIP Access)"
                         className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-2xl px-6 py-4 text-xs font-bold text-[#3a1224] outline-none"
                       />
                       <div className="grid grid-cols-2 gap-4">
                          <input
                            type="number"
                            value={newType.price}
                            onChange={(e) => setNewType({ ...newType, price: e.target.value })}
                            placeholder="Price NRS"
                            className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-2xl px-6 py-4 text-xs font-bold text-[#3a1224] outline-none"
                          />
                          <input
                            type="number"
                            value={newType.quantityTotal}
                            onChange={(e) => setNewType({ ...newType, quantityTotal: e.target.value })}
                            placeholder="Initial Qty"
                            className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-2xl px-6 py-4 text-xs font-bold text-[#3a1224] outline-none"
                          />
                       </div>
                       <button
                         onClick={addTicketType}
                         disabled={savingType}
                         className="w-full py-4 bg-[#3a1224] text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:bg-[#3a1224]/90 transition-all disabled:opacity-50"
                       >
                         {savingType ? "Processing..." : "Deploy Ticket Tier"}
                       </button>
                    </div>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}
     