"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
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
import { useQueryOrganizerStatus } from "@queries/organizer/status";
import { useQueryEventAttendees } from "@queries/organizer/attendees";

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
  const queryClient = useQueryClient();

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attendeeQuery, setAttendeeQuery] = useState("");
  const [attendeesPage, setAttendeesPage] = useState(1);

  const [newType, setNewType] = useState({ name: "", price: "", quantityTotal: "" });
  const [savingType, setSavingType] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState(null);
  const [editType, setEditType] = useState({ name: "", price: "", quantityTotal: "", isActive: true });

  const [checkinCode, setCheckinCode] = useState("");
  const [checkinLoading, setCheckinLoading] = useState(false);

  const { data: statusData } = useQueryOrganizerStatus({ enabled: !!user });
  const { data: attendeesData, isLoading: attendeesLoading, refetch: refetchAttendees } = useQueryEventAttendees(eventId, {
    enabled: !!eventId,
    params: { page: attendeesPage, limit: ATTENDEE_LIMIT }
  });

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
  const statusValue = String(statusData?.organizerStatus || (user?.isOrganizerEligible ? "approved" : user?.organizerStatus || "none")).toLowerCase();
  const isApproved = statusData?.isOrganizerEligible || statusValue === "approved" || user?.isOrganizerEligible;

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

  const attendees = attendeesData?.attendees || [];
  const attendeesTotal = attendeesData?.total || 0;

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

    // Validate registration dates are before or on event date
    if (event?.bookingId?.date) {
      const eventDate = new Date(event.bookingId.date);
      eventDate.setHours(0, 0, 0, 0);

      if (values.startDateTime) {
        const startDateTime = new Date(values.startDateTime);
        if (startDateTime > eventDate) {
          toast.error("Registration start time must be before the event date");
          return;
        }
      }

      if (values.endDateTime) {
        const endDateTime = new Date(values.endDateTime);
        const eventDateEnd = new Date(event.bookingId.date);
        eventDateEnd.setHours(23, 59, 59, 999);
        
        if (endDateTime > eventDateEnd) {
          toast.error("Registration end time must be on or before the event date");
          return;
        }
      }
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
      refetchAttendees();
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
    <div className="min-h-screen bg-gradient-to-br from-[#fdfaf6] via-white to-[#fdfaf6] pb-20">
      {/* Professional Banner Section */}
      <div className="relative w-full h-48 sm:h-56 md:h-72 lg:h-96 overflow-hidden">
        {/* Banner Image */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#3a1224] to-[#5a2844] opacity-80"
          style={{
            backgroundImage: event.bannerUrl ? `url('${event.bannerUrl}')` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/90 via-[#3a1224]/40 to-transparent" />
        </div>

        {/* Banner Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6 md:p-8 lg:p-10">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${statusTone(event.status)}`}>
                {event.status}
              </span>
              <span className="text-[9px] sm:text-[10px] font-black text-white/60 uppercase tracking-[0.3em]">ORGANIZER CONTROL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              {event.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-semibold max-w-2xl line-clamp-2">
              {event.type} • {event.eventCategory}
            </p>
          </div>
        </div>

        {/* Action Button in Banner */}
        <button
          onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)}
          className="absolute top-4 sm:top-6 right-4 sm:right-6 px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full text-[9px] sm:text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all"
        >
          ← Back
        </button>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-8 sm:py-10 md:py-12 space-y-10 md:space-y-14">
        
        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
          {/* Capacity Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-5 sm:p-6 md:p-7 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 bg-gradient-to-br from-[#C0A04C] to-[#A68A3C] rounded-lg sm:rounded-xl flex items-center justify-center">
                <Users className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Hall Capacity</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#3a1224] mb-2">{event.hallId?.capacity}</p>
            <p className="text-[9px] sm:text-xs text-[#3a1224]/50 font-semibold">{event.hallId?.name}</p>
          </div>

          {/* Expected Attendees Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-5 sm:p-6 md:p-7 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Activity className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Expected Attendees</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-black text-[#3a1224] mb-2">{event.expectedAttendees}</p>
            <p className="text-[9px] sm:text-xs text-[#3a1224]/50 font-semibold">{Math.round((event.expectedAttendees / event.hallId?.capacity) * 100)}% capacity</p>
          </div>

          {/* Event Date Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-5 sm:p-6 md:p-7 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Calendar className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Event Date</p>
            <p className="text-base sm:text-lg md:text-xl font-black text-[#3a1224] mb-1">{formatDate(event.bookingId?.date)}</p>
            <p className="text-[9px] sm:text-xs text-[#3a1224]/50 font-semibold">{event.bookingId?.slot?.toUpperCase()} SLOT</p>
          </div>

          {/* Booking Status Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-5 sm:p-6 md:p-7 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <div className="w-10 sm:w-12 md:w-14 h-10 sm:h-12 md:h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 text-white" />
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Booking Status</p>
            <p className="text-base sm:text-lg md:text-xl font-black text-[#3a1224] mb-2">{event.bookingId?.status}</p>
            <div className="w-full bg-[#3a1224]/5 rounded-full h-1.5 sm:h-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Event Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column: Core Details */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-6 sm:p-7 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#3a1224] rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Info className="w-5 sm:w-6 h-5 sm:h-6 text-[#C0A04C]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#3a1224] uppercase tracking-wider">About This Event</h3>
              </div>
              <p className="text-sm sm:text-base text-[#3a1224]/70 leading-relaxed font-medium whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Event Amenities & Details */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-6 sm:p-7 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#3a1224] rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-[#C0A04C]" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#3a1224] uppercase tracking-wider">Amenities & Features</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="bg-[#fdfaf6] rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-[9px] sm:text-xs font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Catering</p>
                  <p className="text-sm sm:text-base font-black text-[#3a1224]">{event.catering ? '✓ Included' : '✗ Not Included'}</p>
                </div>
                <div className="bg-[#fdfaf6] rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-[9px] sm:text-xs font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Decoration</p>
                  <p className="text-sm sm:text-base font-black text-[#3a1224]">{event.decoration ? '✓ Available' : '✗ Not Available'}</p>
                </div>
                <div className="bg-[#fdfaf6] rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-[9px] sm:text-xs font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Tickets</p>
                  <p className="text-sm sm:text-base font-black text-[#3a1224]">{event.requiresTicket ? '✓ Required' : '✗ Not Required'}</p>
                </div>
                <div className="bg-[#fdfaf6] rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-[9px] sm:text-xs font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Dress Code</p>
                  <p className="text-sm sm:text-base font-black text-[#3a1224] capitalize">{event.dressCode || 'Not Specified'}</p>
                </div>
                <div className="bg-[#fdfaf6] rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-[9px] sm:text-xs font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Age Limit</p>
                  <p className="text-sm sm:text-base font-black text-[#3a1224]">{event.ageRestriction ? `${event.ageRestriction}+` : 'No Limit'}</p>
                </div>
                <div className="bg-[#fdfaf6] rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-[9px] sm:text-xs font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Audience</p>
                  <p className="text-sm sm:text-base font-black text-[#3a1224] line-clamp-1">{event.targetAudience?.split(',')[0] || 'General'}</p>
                </div>
              </div>
            </div>

            {/* Location Details */}
            {event.location && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-6 sm:p-7 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#3a1224] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Users className="w-5 sm:w-6 h-5 sm:h-6 text-[#C0A04C]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#3a1224] uppercase tracking-wider">Venue Location</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[9px] sm:text-xs font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">City</p>
                    <p className="text-sm sm:text-base font-bold text-[#3a1224]">{event.location.city}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-xs font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">State</p>
                    <p className="text-sm sm:text-base font-bold text-[#3a1224]">{event.location.state}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-xs font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Country</p>
                    <p className="text-sm sm:text-base font-bold text-[#3a1224]">{event.location.country}</p>
                  </div>
                  <div>
                    <p className="text-[9px] sm:text-xs font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Coordinates</p>
                    <p className="text-sm sm:text-base font-bold text-[#3a1224]">{event.location.coordinates?.latitude?.toFixed(4)}, {event.location.coordinates?.longitude?.toFixed(4)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Event Tags & Additional Info */}
          <div className="space-y-6 md:space-y-8">
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-6 sm:p-7 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#3a1224] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <Zap className="w-5 sm:w-6 h-5 sm:h-6 text-[#C0A04C]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#3a1224] uppercase tracking-wider">Topics</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, idx) => (
                    <span key={idx} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#3a1224]/5 text-[#3a1224] rounded-full text-[9px] sm:text-xs font-bold uppercase tracking-widest border border-[#3a1224]/10">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Details */}
            {event.additionalDetails && Object.keys(event.additionalDetails).length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-6 sm:p-7 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                  <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#3a1224] rounded-lg sm:rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 sm:w-6 h-5 sm:h-6 text-[#C0A04C]" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-[#3a1224] uppercase tracking-wider">Highlights</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {Object.entries(event.additionalDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-start gap-2 py-2 border-b border-[#3a1224]/5 last:border-0">
                      <span className="text-[9px] sm:text-xs font-bold text-[#3a1224]/60 uppercase tracking-widest">{key.replace(/_/g, ' ')}</span>
                      <span className="text-sm sm:text-base font-black text-[#3a1224] text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Requirements */}
            {event.specialRequirements && (
              <div className="bg-amber-50 rounded-2xl sm:rounded-3xl border border-amber-100 p-6 sm:p-7 md:p-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <AlertCircle className="w-5 sm:w-6 h-5 sm:h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-amber-900 uppercase tracking-wider mb-2">Special Requirements</h4>
                    <p className="text-xs sm:text-sm text-amber-800 font-medium leading-relaxed">{event.specialRequirements}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        {/* Left Column: Form and Settings */}
        <div className="xl:col-span-2 space-y-12">
           {/* Section: Identity & Content */}
           <section className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-6 sm:p-7 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-7 md:mb-8">
                 <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#3a1224] rounded-lg sm:rounded-xl flex items-center justify-center text-[#C0A04C] font-black text-sm sm:text-base">A</div>
                 <h3 className="text-lg sm:text-xl font-black text-[#3a1224] uppercase tracking-wider">Manage Event</h3>
              </div>

              <form onSubmit={handleSubmit(saveEvent)} className="space-y-6 sm:space-y-7 md:space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                    <div className="space-y-2 sm:space-y-3">
                       <label className="text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Event Name *</label>
                       <input
                         {...register("name", { required: "Name is required" })}
                         className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all"
                       />
                       {errors.name && <p className="text-[8px] text-rose-500 font-bold uppercase ml-2">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                       <label className="text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Category *</label>
                       <input
                         {...register("type")}
                         className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all"
                       />
                    </div>
                 </div>

                 <div className="space-y-2 sm:space-y-3">
                    <label className="text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Description</label>
                    <textarea
                      {...register("description")}
                      rows={4}
                      className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all resize-none"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                    <div className="space-y-2 sm:space-y-3">
                       <label className="text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Visibility</label>
                       <select
                         {...register("visibility")}
                         className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 appearance-none"
                       >
                         <option value="public">Public - Searchable</option>
                         <option value="private">Private - Access Code Required</option>
                       </select>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                       <label className="text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Access Code</label>
                       <input
                         {...register("accessCode")}
                         className={`w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all ${visibility !== 'private' ? 'opacity-30 grayscale' : ''}`}
                         placeholder="Min 4 chars"
                       />
                    </div>
                 </div>

                 <div className="space-y-2 sm:space-y-3">
                    <label className="text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Banner Image URL</label>
                    <input
                      {...register("bannerUrl")}
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-xs sm:text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all"
                    />
                    <p className="text-[8px] sm:text-[9px] text-[#3a1224]/40 ml-2">Use high-res image (1200x400px recommended)</p>
                 </div>

                 <div className="border-t border-[#3a1224]/5 pt-6 sm:pt-7 md:pt-8">
                    <p className="text-[10px] sm:text-[11px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2 mb-4">Registration Timeline</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                       <div className="space-y-2 sm:space-y-3">
                          <label className="text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Timeline Start</label>
                          <input
                            type="datetime-local"
                            {...register("startDateTime")}
                            className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-xs sm:text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all"
                          />
                          {event?.bookingId?.date && (
                            <p className="text-[8px] text-[#3a1224]/50 ml-2">Must be before {new Date(event.bookingId.date).toLocaleDateString('en-GB')}</p>
                          )}
                       </div>
                       <div className="space-y-2 sm:space-y-3">
                          <label className="text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest ml-2">Timeline End</label>
                          <input
                            type="datetime-local"
                            {...register("endDateTime")}
                            className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-xs sm:text-sm font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all"
                          />
                          {event?.bookingId?.date && (
                            <p className="text-[8px] text-[#3a1224]/50 ml-2">Must be on or before {new Date(event.bookingId.date).toLocaleDateString('en-GB')}</p>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 sm:pt-7 md:pt-8 border-t border-[#3a1224]/5">
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                       {['DRAFT', 'PUBLISHED', 'CANCELLED'].map((s) => (
                          <label key={s} className="cursor-pointer">
                             <input type="radio" {...register("status")} value={s} className="hidden" />
                             <span className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all inline-block ${watch("status") === s ? "bg-[#3a1224] text-[#C0A04C] shadow-lg shadow-[#3a1224]/20" : "bg-[#fdfaf6] text-[#3a1224]/40 border border-[#3a1224]/5"}`}>
                                {s}
                             </span>
                          </label>
                       ))}
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 sm:px-10 md:px-12 py-3 sm:py-4 md:py-5 bg-[#3a1224] text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-[#3a1224]/10 disabled:opacity-50"
                    >
                      {isSubmitting ? "Syncing..." : "Update Event"}
                    </button>
                 </div>
              </form>
           </section>

        {/* Right Column: Entry Terminal & Ticket Inventory */}
        <div className="space-y-6 md:space-y-8">
           {/* Rapid Entry Terminal */}
           <section className="bg-gradient-to-br from-[#3a1224] to-[#5a2844] rounded-2xl sm:rounded-3xl p-6 sm:p-7 md:p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                 <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                       <QrCode className="w-5 sm:w-6 h-5 sm:h-6 text-[#C0A04C]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-wider">Entry Terminal</h3>
                 </div>
                 <p className="text-white/60 text-[9px] sm:text-xs font-medium leading-relaxed mb-6 sm:mb-7">
                   Scan QR codes or enter passport IDs for real-time visitor validation.
                 </p>
                 
                 <div className="space-y-3 sm:space-y-4">
                    <input
                      type="text"
                      placeholder="Scan QR code or enter ID..."
                      value={checkinCode}
                      onChange={(e) => setCheckinCode(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded-lg sm:rounded-2xl px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-sm font-bold text-white placeholder-white/40 outline-none focus:ring-2 ring-[#C0A04C]/50 transition-all"
                    />
                    <button
                      onClick={handleCheckin}
                      disabled={checkinLoading}
                      className="w-full py-3 sm:py-4 md:py-5 bg-[#C0A04C] hover:bg-[#D4B557] text-[#3a1224] rounded-lg sm:rounded-2xl text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] active:scale-[0.98] transition-all shadow-xl shadow-[#C0A04C]/20 disabled:opacity-50"
                    >
                      {checkinLoading ? "Validating..." : "✓ Validate Entry"}
                    </button>
                 </div>
              </div>
              <div className="absolute top-0 right-0 w-40 sm:w-56 h-40 sm:h-56 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
           </section>

           {/* Ticket Inventory Section */}
           <section className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-6 sm:p-7 md:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-7 md:mb-8">
                 <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#3a1224] rounded-lg sm:rounded-xl flex items-center justify-center">
                       <Ticket className="w-5 sm:w-6 h-5 sm:h-6 text-[#C0A04C]" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-[#3a1224] uppercase tracking-wider">Ticket Tiers</h3>
                 </div>
                 <button 
                    onClick={refreshTicketTypes} 
                    title="Refresh"
                    className="w-8 sm:w-10 h-8 sm:h-10 rounded-lg sm:rounded-xl bg-[#3a1224]/5 hover:bg-[#C0A04C]/10 text-[#C0A04C] transition-all flex items-center justify-center"
                 >
                    <RefreshCcw className="w-4 sm:w-5 h-4 sm:h-5" />
                 </button>
              </div>

              <div className="space-y-4 sm:space-y-5">
                 {/* Existing Ticket Types */}
                 {ticketTypes.length > 0 && (
                    <div className="space-y-3 sm:space-y-4">
                       {ticketTypes.map((type) => (
                          <div key={type._id} className="relative group bg-[#fdfaf6] rounded-lg sm:rounded-2xl border border-[#3a1224]/5 p-4 sm:p-5 md:p-6 transition-all hover:border-[#C0A04C]/30">
                             {editingTypeId === type._id ? (
                                <div className="space-y-3 sm:space-y-4">
                                   <input
                                     value={editType.name}
                                     onChange={(e) => setEditType({ ...editType, name: e.target.value })}
                                     placeholder="Tier Name"
                                     className="w-full bg-white border border-[#3a1224]/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs font-bold focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all"
                                   />
                                   <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                      <input
                                        type="number"
                                        value={editType.price}
                                        onChange={(e) => setEditType({ ...editType, price: e.target.value })}
                                        placeholder="Price NRS"
                                        className="w-full bg-white border border-[#3a1224]/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs font-bold focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all"
                                      />
                                      <input
                                        type="number"
                                        value={editType.quantityTotal}
                                        onChange={(e) => setEditType({ ...editType, quantityTotal: e.target.value })}
                                        placeholder="Quantity"
                                        className="w-full bg-white border border-[#3a1224]/10 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-xs font-bold focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all"
                                      />
                                   </div>
                                   <div className="flex items-center gap-2 sm:gap-3 pt-2 sm:pt-3">
                                      <button onClick={() => saveEdit(type._id)} className="flex-1 py-2 sm:py-3 bg-[#3a1224] text-white rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest hover:bg-[#3a1224]/90 transition-all">Save</button>
                                      <button onClick={() => setEditingTypeId(null)} className="flex-1 py-2 sm:py-3 bg-white border border-[#3a1224]/5 text-[#3a1224]/40 rounded-lg text-[9px] sm:text-xs font-black uppercase tracking-widest hover:bg-[#3a1224]/5 transition-all">Cancel</button>
                                   </div>
                                </div>
                             ) : (
                                <div className="flex flex-col">
                                   <div className="flex items-start justify-between mb-3 sm:mb-4">
                                      <span className="text-[8px] sm:text-[9px] font-bold text-[#C0A04C] uppercase tracking-[0.2em] bg-[#C0A04C]/10 px-2 sm:px-3 py-1 rounded-full">{type.isActive ? 'Active' : 'Inactive'}</span>
                                      <button onClick={() => startEdit(type)} className="p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity text-[#3a1224]/20 hover:text-[#3a1224]">
                                         <Activity className="w-4 sm:w-5 h-4 sm:h-5" />
                                      </button>
                                   </div>
                                   <h4 className="text-base sm:text-lg font-black text-[#3a1224] mb-3 sm:mb-4">{type.name}</h4>
                                   <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-[#3a1224]/5">
                                      <div className="flex flex-col">
                                         <span className="text-[8px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-0.5">Price</span>
                                         <span className="text-sm sm:text-base font-black text-[#3a1224]">₨ {type.price?.toLocaleString()}</span>
                                      </div>
                                      <div className="flex flex-col text-right">
                                         <span className="text-[8px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-0.5">Sold / Total</span>
                                         <span className="text-sm sm:text-base font-black text-[#3a1224]">{type.quantitySold} / {type.quantityTotal}</span>
                                      </div>
                                   </div>
                                </div>
                             )}
                          </div>
                       ))}
                    </div>
                 )}

                 {/* Divider */}
                 {ticketTypes.length > 0 && <div className="h-px bg-gradient-to-r from-transparent via-[#3a1224]/10 to-transparent" />}

                 {/* Add New Ticket Type */}
                 <div className="pt-2 sm:pt-3">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4">
                       <Plus className="w-4 sm:w-5 h-4 sm:h-5 text-[#C0A04C]" />
                       <span className="text-[9px] sm:text-xs font-black text-[#3a1224]/60 uppercase tracking-widest">Add New Tier</span>
                    </div>
                    <div className="space-y-2 sm:space-y-3">
                       <input
                         value={newType.name}
                         onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                         placeholder="Tier Name (e.g., VIP Access, General)"
                         className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all"
                       />
                       <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <input
                            type="number"
                            value={newType.price}
                            onChange={(e) => setNewType({ ...newType, price: e.target.value })}
                            placeholder="Price NRS"
                            className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all"
                          />
                          <input
                            type="number"
                            value={newType.quantityTotal}
                            onChange={(e) => setNewType({ ...newType, quantityTotal: e.target.value })}
                            placeholder="Quantity"
                            className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-xs font-bold text-[#3a1224] outline-none focus:ring-2 ring-[#C0A04C]/20 transition-all"
                          />
                       </div>
                       <button
                         onClick={addTicketType}
                         disabled={savingType}
                         className="w-full py-2 sm:py-3 md:py-4 bg-[#3a1224] hover:bg-[#3a1224]/90 text-white rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                       >
                         {savingType ? "Adding..." : "+ Deploy Tier"}
                       </button>
                    </div>
                 </div>
              </div>
           </section>
        </div>
      </div>

      {/* Attendee Manifest Section (Full Width) */}
      <section className="bg-white rounded-2xl sm:rounded-3xl border border-[#3a1224]/5 p-6 sm:p-7 md:p-8 shadow-sm overflow-hidden">
         <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-7 md:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
               <div className="w-8 sm:w-10 h-8 sm:h-10 bg-[#3a1224] rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Users className="w-5 sm:w-6 h-5 sm:h-6 text-[#C0A04C]" />
               </div>
               <h3 className="text-lg sm:text-xl font-black text-[#3a1224] uppercase tracking-wider">Attendee Manifest</h3>
               <span className="text-[9px] sm:text-xs font-bold bg-[#3a1224]/5 text-[#3a1224]/60 px-2 sm:px-3 py-1 rounded-full">{attendeesTotal} Total</span>
            </div>
            <div className="relative flex-1 sm:flex-initial group min-w-0 sm:min-w-[250px] md:min-w-[350px]">
               <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-[#3a1224]/20 group-hover:text-[#C0A04C] transition-colors flex-shrink-0" />
               <input
                  type="text"
                  placeholder="Filter by name, email..."
                  value={attendeeQuery}
                  onChange={(e) => setAttendeeQuery(e.target.value)}
                  className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg sm:rounded-xl pl-9 sm:pl-12 pr-4 py-2 sm:py-3 md:py-4 text-xs sm:text-sm font-bold text-[#3a1224] focus:ring-2 ring-[#C0A04C]/20 outline-none transition-all"
               />
            </div>
         </div>

         {/* Responsive Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead>
                  <tr className="border-b border-[#3a1224]/5">
                     <th className="pb-3 sm:pb-4 text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest pl-3 sm:pl-4">Guest</th>
                     <th className="pb-3 sm:pb-4 text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest px-2 sm:px-4">Pass ID</th>
                     <th className="pb-3 sm:pb-4 text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest px-2 sm:px-4 hidden sm:table-cell">Entry Date</th>
                     <th className="pb-3 sm:pb-4 text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest text-right pr-3 sm:pr-4">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#3a1224]/5">
                  {attendeesLoading ? (
                     Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                           <td className="py-4 sm:py-6 pl-3 sm:pl-4"><div className="w-32 h-3 bg-[#3a1224]/5 rounded-full" /></td>
                           <td className="py-4 sm:py-6 px-2 sm:px-4"><div className="w-24 h-3 bg-[#3a1224]/5 rounded-full" /></td>
                           <td className="py-4 sm:py-6 px-2 sm:px-4 hidden sm:table-cell"><div className="w-20 h-3 bg-[#3a1224]/5 rounded-full" /></td>
                           <td className="py-4 sm:py-6 pr-3 sm:pr-4 text-right"><div className="w-16 h-3 bg-[#3a1224]/5 rounded-full ml-auto" /></td>
                        </tr>
                     ))
                  ) : filteredAttendees.length === 0 ? (
                     <tr>
                        <td colSpan={4} className="py-16 sm:py-20 text-center">
                           <Users className="w-10 sm:w-12 h-10 sm:h-12 text-[#3a1224]/10 mx-auto mb-3 sm:mb-4" />
                           <p className="text-[9px] sm:text-[10px] font-black text-[#3a1224]/20 uppercase tracking-[0.2em]">No attendees found</p>
                        </td>
                     </tr>
                  ) : (
                     filteredAttendees.map((a) => (
                        <tr key={a._id} className="group hover:bg-[#fdfaf6] transition-colors">
                           <td className="py-4 sm:py-6 pl-3 sm:pl-4">
                              <div className="flex flex-col">
                                 <span className="text-xs sm:text-sm font-black text-[#3a1224]">{a.attendee?.first_name} {a.attendee?.last_name}</span>
                                 <span className="text-[8px] sm:text-xs font-bold text-[#3a1224]/40 uppercase tracking-tight">{a.attendee?.email}</span>
                              </div>
                           </td>
                           <td className="py-4 sm:py-6 px-2 sm:px-4">
                              <span className="text-[8px] sm:text-xs font-black text-[#C0A04C] font-mono">{a.qrCodeValue?.substring(0, 8)}...</span>
                           </td>
                           <td className="py-4 sm:py-6 px-2 sm:px-4 hidden sm:table-cell text-[8px] sm:text-xs font-bold text-[#3a1224]/60">
                              {a.checkedInAt ? formatDate(a.checkedInAt) : formatDate(a.createdAt)}
                           </td>
                           <td className="py-4 sm:py-6 pr-3 sm:pr-4 text-right">
                              <span className={`inline-block px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest ${a.checkedInAt ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-[#3a1224]/5 text-[#3a1224]/40'}`}>
                                 {a.checkedInAt ? '✓ Inside' : 'Waiting'}
                              </span>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>

         {/* Pagination */}
         {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-[#3a1224]/5">
               <p className="text-[9px] sm:text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest">Page {attendeesPage} of {totalPages}</p>
               <div className="flex gap-2 sm:gap-3">
                  <button
                    disabled={attendeesPage <= 1}
                    onClick={() => setAttendeesPage(p => p - 1)}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white border border-[#3a1224]/5 text-[9px] sm:text-xs font-black uppercase tracking-widest disabled:opacity-20 transition-all hover:bg-[#3a1224] hover:text-white active:scale-[0.98]"
                  >
                    ← Prev
                  </button>
                  <button
                    disabled={attendeesPage >= totalPages}
                    onClick={() => setAttendeesPage(p => p + 1)}
                    className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white border border-[#3a1224]/5 text-[9px] sm:text-xs font-black uppercase tracking-widest disabled:opacity-20 transition-all hover:bg-[#3a1224] hover:text-white active:scale-[0.98]"
                  >
                    Next →
                  </button>
               </div>
            </div>
         )}
      </section>
    </div>
    </div>
    
  );
};
     