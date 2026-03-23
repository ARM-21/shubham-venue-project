"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import { EventHero } from "./components/EventHero";
import { EventDetails } from "./components/EventDetails";
import { TicketsSection } from "./components/TicketsSection";
import { VenueInfo } from "./components/VenueInfo";

const PLACEHOLDER_IMAGE = "/assets/business-images/placeholder.jpg";

function formatDateTime(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const eventId = params?.eventId;

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accessCode, setAccessCode] = useState("");
  const [needsAccessCode, setNeedsAccessCode] = useState(false);
  const [submitting, setSubmitting] = useState(null);
  const [gatewayTicketId, setGatewayTicketId] = useState(null);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState(null);

  const redirectToEsewa = (paymentUrl, payload) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;

    Object.entries(payload || {}).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value);
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const fetchEvent = useCallback(async (code) => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await axiosInstance.get(ROUTES.API.EVENTS.DETAIL(eventId), {
        params: code ? { accessCode: code } : undefined,
      });
      const payload = res.data || {};
      setEvent(payload.event || null);
      setTicketTypes(payload.ticketTypes || []);
      setNeedsAccessCode(false);
      setError(null);
    } catch (err) {
      if (err?.response?.status === 403) {
        setNeedsAccessCode(true);
        setError("This event is private. Enter the access code.");
      } else {
        setError(err?.response?.data?.message || "Failed to load event");
      }
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleBuyTicket = async (ticketTypeId, gateway) => {
    if (!user) {
      const redirect = ROUTES.SITE.EVENT_DETAIL(eventId);
      router.push(`${ROUTES.AUTH.LOGIN}?redirect=${redirect}`);
      return;
    }

    try {
      setGatewayTicketId(null);
      setSubmitting(ticketTypeId);
      const payload = {
        eventId,
        ticketTypeId,
        accessCode: needsAccessCode ? accessCode.trim() : undefined,
      };
      if (gateway) payload.gateway = gateway;

      const res = await axiosInstance.post(ROUTES.API.TICKETS.INITIATE, payload);

      if (gateway && res.data?.mode && res.data.mode.toUpperCase() !== gateway.toUpperCase()) {
        toast.error("Payment gateway mismatch. Please try again.");
        return;
      }

      if (res.data?.mode === "free") {
        toast.success("Ticket issued");
        await fetchEvent(accessCode.trim());
        return;
      }

      if (res.data?.mode === "esewa") {
        redirectToEsewa(res.data.paymentUrl, res.data.payload);
        return;
      }

      if (res.data?.mode === "khalti") {
        window.location.href = res.data.paymentUrl;
        return;
      }

      toast.error("Unsupported payment mode");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to issue ticket");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#3a1224]">
        <div className="w-12 h-12 border-4 border-[#C0A04C] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-[#C0A04C] font-black text-[10px] uppercase tracking-[0.4em]">Loading event</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-2xl font-black text-[#3a1224] uppercase tracking-tight mb-3">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "This event is no longer available."}</p>
          <button
            onClick={() => router.push(ROUTES.SITE.EVENTS)}
            className="px-6 py-3 bg-[#3a1224] text-white font-black uppercase tracking-wider rounded-lg hover:bg-[#C0A04C] hover:text-[#3a1224] transition"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const banner = event.bannerUrl || PLACEHOLDER_IMAGE;
  const hallName = event.hallId?.name || "Venue";
  const remainingTypes = ticketTypes.map((type) => ({
    ...type,
    remaining: Math.max(0, Number(type.quantityTotal || 0) - Number(type.quantitySold || 0)),
  }));
  const eventEnded = event.endDateTime ? new Date(event.endDateTime).getTime() < Date.now() : false;

  return (
    <main className="min-h-screen bg-[#fdfaf6]/50 relative selection:bg-[#C0A04C]/30 overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
        <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-[#C0A04C]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-[#3a1224]/5 blur-[120px] rounded-full" />
      </div>
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/70 to-transparent pointer-events-none z-0" />

      {/* Event Hero with Banner */}
      <div className="relative z-10">
        <EventHero event={event} banner={event.bannerUrl || PLACEHOLDER_IMAGE} />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pb-8 lg:pb-12 pt-8 lg:pt-12">
        {error ? (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-bold uppercase tracking-wider">
            {error}
          </div>
        ) : null}

        {needsAccessCode ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-[#3a1224]/5 p-10 md:p-14">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-[1px] bg-[#C0A04C]" />
                <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Restricted Event</span>
              </div>
              <h2 className="text-3xl font-display font-bold text-[#3a1224] mb-3 tracking-tight">🔒 Access Code Required</h2>
              <p className="text-[#3a1224]/60 font-medium mb-8">This is a private event. Please enter the access code to view details and purchase tickets.</p>
              
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter event access code"
                className="w-full bg-[#3a1224]/3 border border-[#3a1224]/10 text-[#3a1224] px-5 py-4 rounded-xl focus:outline-none focus:border-[#C0A04C]/50 focus:bg-[#3a1224]/5 transition-all duration-300 placeholder-[#3a1224]/30 text-sm mb-6 font-medium"
              />
              <button
                onClick={() => fetchEvent(accessCode.trim())}
                className="w-full py-4 rounded-xl bg-[#3a1224] text-white font-black uppercase tracking-wider hover:bg-[#C0A04C] hover:text-[#3a1224] transition duration-300"
              >
                Unlock Event
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-12 lg:space-y-16">
            {/* Event Details Section */}
            <EventDetails 
              event={event} 
              formatDateTime={formatDateTime}
              hallName={event.hallId?.name || "Venue"}
            />

            {/* Venue Information */}
            <VenueInfo venue={event.hallId} />

            {/* Tickets Section */}
            <TicketsSection 
              ticketTypes={ticketTypes}
              onBuyTicket={handleBuyTicket}
              eventEnded={eventEnded}
              submitting={submitting}
              onSelectPaymentGateway={setGatewayTicketId}
              selectedPaymentGateway={gatewayTicketId}
              eventCapacity={event.hallId?.capacity || 0}
              totalSold={ticketTypes.reduce((sum, t) => sum + (t.quantitySold || 0), 0)}
            />
          </div>
        )}
      </div>
    </main>

  );
}
