"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import toast from "react-hot-toast";
import { useQueryOrganizerStatus } from "@queries/organizer/status";
import { useQueryEventAttendees } from "@queries/organizer/attendees";
import {
  EventBanner,
  EventMetrics,
  EventOverview,
  EventManagement,
  EntryTerminal,
  TicketInventory,
  GuestManifest,
  CancellationTerminal,
} from "components/organizer/event-detail";
import { Fingerprint, Info } from "lucide-react";

const ATTENDEE_LIMIT = 20;

export default function OrganizerEventDetailPage() {
  const router = useRouter();
  const { eventId } = useParams();
  const { user } = useAuth();

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
  const [cancellationData, setCancellationData] = useState(null);

  const { data: statusData } = useQueryOrganizerStatus({ enabled: !!user });
  const { data: attendeesData, isLoading: attendeesLoading, refetch: refetchAttendees } = useQueryEventAttendees(eventId, {
    enabled: !!eventId,
    params: { page: attendeesPage, limit: ATTENDEE_LIMIT }
  });

  const statusValue = String(statusData?.organizerStatus || (user?.isOrganizerEligible ? "approved" : user?.organizerStatus || "none")).toLowerCase();
  const isApproved = statusData?.isOrganizerEligible || statusValue === "approved" || user?.isOrganizerEligible;

  // Fetch event data
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
          setEvent(eventRes.data?.event || null);
          setTicketTypes(ticketsRes.data?.ticketTypes || []);
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
  }, [eventId, isApproved]);

  // Event management functions
  async function saveEvent(values) {
    if (values.visibility === "private" && (!values.accessCode || values.accessCode.trim().length < 4)) {
      toast.error("Access code must be at least 4 characters for private events");
      return;
    }

    try {
      // Format registration dates to include time if only date is provided
      let regStart = values.registrationStartDate;
      let regEnd = values.registrationEndDate;
      
      // If registration dates are provided but missing time component, append midnight
      if (regStart && !regStart.includes('T')) {
        regStart = `${regStart}T00:00`;
      }
      if (regEnd && !regEnd.includes('T')) {
        regEnd = `${regEnd}T23:59`;
      }

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
        cancellationReason: values.status === "CANCELLED" ? values.cancellationReason?.trim() : null,
        expectedAttendees: values.expectedAttendees || null,
        catering: values.cateringPlan !== "none",
        cateringPlan: values.cateringPlan || "none",
        cateringMenus: values.cateringPlan === "choose_now" && values.cateringMenuId ? [values.cateringMenuId] : [],
        cateringGuestCount: values.cateringPlan === "none" ? null : values.cateringGuestCount || null,
        cateringServiceTime: values.cateringPlan === "none" ? "" : values.cateringServiceTime || "",
        cateringNotes: values.cateringPlan === "none" ? "" : values.cateringNotes?.trim() || "",
        // Include registration window dates with time components
        registrationStartDate: regStart || undefined,
        registrationEndDate: regEnd || undefined,
      };
      const res = await axiosInstance.patch(ROUTES.API.ORGANIZER.EVENT(eventId), payload);
      setEvent(res.data?.event || null);
      
      // Capture cancellation data if event was cancelled
      if (values.status === "CANCELLED" && res.data?.cancellation) {
        setCancellationData(res.data.cancellation);
      }
      
      // Show specific success message based on status change
      if (values.status !== event?.status) {
        if (values.status === "PUBLISHED") {
          toast.success("Event published");
        } else if (values.status === "DRAFT") {
          toast.success("Event moved back to draft");
        } else if (values.status === "CANCELLED") {
          toast.success("Event cancelled. Attendees have been notified.");
        }
      } else {
        toast.success("Event updated");
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Failed to update event";
      
      // Provide helpful context for specific transition errors
      if (errorMsg.includes("ticket") && values.status === "PUBLISHED") {
        toast.error("Cannot publish: Please create at least one ticket type first");
      } else if (errorMsg.includes("Cannot transition")) {
        toast.error(errorMsg);
      } else if (errorMsg.includes("PENDING_REVIEW")) {
        toast.error("Event is awaiting admin approval and cannot be modified");
      } else if (errorMsg.includes("SUSPENDED")) {
        toast.error("Event is suspended and cannot be modified");
      } else {
        toast.error(errorMsg);
      }
    }
  }

  // Ticket management functions
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

  function startEditTicket(type) {
    setEditingTypeId(type._id);
    setEditType({
      name: type.name || "",
      price: type.price ?? "",
      quantityTotal: type.quantityTotal ?? "",
      isActive: type.isActive !== false,
    });
  }

  async function saveEditTicket(typeId) {
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

  // Check-in function
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

  const attendees = attendeesData?.attendees || [];
  const attendeesTotal = attendeesData?.total || 0;
  const totalPages = Math.ceil(attendeesTotal / ATTENDEE_LIMIT) || 1;

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

  // Verification check
  if (!isApproved) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <div className="border border-[#e8dcc8] bg-white p-8 text-center">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border border-[#e8dcc8] bg-[#fbf8f2]">
            <Fingerprint className="h-7 w-7 text-[#3a1224]" />
          </div>
          <h2 className="text-2xl font-black text-[#3a1224]">Verification required</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#3a1224]/60">
            You need to be a verified producer to manage events. Check your application status on the dashboard.
          </p>
          <button
            onClick={() => router.push(ROUTES.SITE.ORGANIZER)}
            className="mt-7 bg-[#3a1224] px-6 py-3 text-sm font-bold text-white hover:bg-[#4b1830]"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="w-16 h-16 border-4 border-[#C0A04C] border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.3em]">Loading Event...</p>
      </div>
    );
  }

  return (
    <main className="bg-[#FDFCFB] pb-12">
      {/* Banner */}
      <EventBanner event={event} onBack={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)} />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 space-y-6">
        
        {/* Pending Review Alert */}
        {event?.status === "PENDING_REVIEW" && (
          <div className="border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <div className="flex gap-4">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-black text-sm sm:text-base text-amber-900 mb-2">Event Awaiting Admin Review</p>
                <p className="text-amber-800 text-xs sm:text-sm leading-relaxed mb-3">
                  Your event has been submitted for admin review and will be published once approved. This typically takes 24-48 hours.
                </p>
                <p className="text-amber-700 text-[12px] sm:text-xs font-bold">
                  You'll receive an email notification when your event is approved.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Metrics Cards */}
        {event && <EventMetrics event={event} />}

        {/* Cancellation Terminal - shown when event is cancelled */}
        {event?.status === "CANCELLED" && cancellationData && (
          <CancellationTerminal cancellationData={cancellationData} />
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Event Management */}
          <div className="space-y-6 lg:col-span-2">
            {/* Event Overview */}
            {event && <EventOverview event={event} />}

            {/* Event Management Form */}
            {event && (
              <EventManagement
                event={event}
                bookingDate={event?.bookingId?.date}
                onSave={saveEvent}
                isSubmitting={false}
              />
            )}
          </div>

          {/* Right Column: Controls */}
          <div className="space-y-6">
            {/* Entry Terminal */}
            <EntryTerminal
              checkinCode={checkinCode}
              setCheckinCode={setCheckinCode}
              onCheckin={handleCheckin}
              isLoading={checkinLoading}
            />

            {/* Ticket Inventory */}
            <TicketInventory
              ticketTypes={ticketTypes}
              newType={newType}
              setNewType={setNewType}
              editingTypeId={editingTypeId}
              setEditingTypeId={setEditingTypeId}
              editType={editType}
              setEditType={setEditType}
              onAddTicket={addTicketType}
              onSaveEdit={saveEditTicket}
              onStartEdit={startEditTicket}
              onRefresh={refreshTicketTypes}
              isSaving={savingType}
            />
          </div>
        </div>

        {/* Guest Manifest */}
        <GuestManifest
          attendees={filteredAttendees}
          totalAttendees={attendeesTotal}
          query={attendeeQuery}
          setQuery={setAttendeeQuery}
          page={attendeesPage}
          totalPages={totalPages}
          onPrevPage={() => setAttendeesPage(p => p - 1)}
          onNextPage={() => setAttendeesPage(p => p + 1)}
          isLoading={attendeesLoading}
          eventId={eventId}
        />
      </div>
    </main>
  );
}
