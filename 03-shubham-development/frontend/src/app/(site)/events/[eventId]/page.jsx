"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import toast from "react-hot-toast";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import { useQueryEventDetailPublic } from '@queries/customer/event-detail-public';
import { EventHero } from "./components/EventHero";
import { EventDetails } from "./components/EventDetails";
import { TicketsSection } from "./components/TicketsSection";
import { VenueInfo } from "./components/VenueInfo";
import { RichTextDisplay } from "components/shared/RichTextDisplay";

const PLACEHOLDER_IMAGE = "/assets/business-images/placeholder2.jpg";

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

  const [accessCode, setAccessCode] = useState("");
  const [needsAccessCode, setNeedsAccessCode] = useState(false);
  const [submitting, setSubmitting] = useState(null);
  const [gatewayTicketId, setGatewayTicketId] = useState(null);
  const [selectedPaymentGateway, setSelectedPaymentGateway] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);

  // Query for event details - handles basic fetch
  const { data: eventData, isLoading, error, refetch } = useQueryEventDetailPublic(eventId, {
    enabled: !!eventId && !needsAccessCode,
  });

  // Mutation for access code validation
  const accessCodeMutation = useMutation({
    mutationFn: async (code) => {
      const res = await axiosInstance.get(ROUTES.API.EVENTS.DETAIL(eventId), {
        params: { accessCode: code.trim() },
      });
      return res.data || {};
    },
    onSuccess: (payload) => {
      setTicketTypes(payload.ticketTypes || []);
      setNeedsAccessCode(false);
      toast.success("Access granted");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Invalid access code");
    },
  });

  const event = eventData?.event || null;

  // Extract and sync ticketTypes from API response
  useEffect(() => {
    if (eventData?.ticketTypes && Array.isArray(eventData.ticketTypes)) {
      setTicketTypes(eventData.ticketTypes);
    }
  }, [eventData?.ticketTypes]);

  // Special handling for access-code protected events
  useEffect(() => {
    if (error?.response?.status === 403) {
      setNeedsAccessCode(true);
    }
  }, [error]);

  const handleAccessCodeSubmit = () => {
    if (!accessCode.trim()) {
      toast.error("Please enter an access code");
      return;
    }
    accessCodeMutation.mutate(accessCode);
  };

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
        await refetch();
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

  if (isLoading) {
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
  const eventDate = event.eventDate || (event.bookingId?.date) || null;
  const remainingTypes = ticketTypes.map((type) => ({
    ...type,
    remaining: Math.max(0, Number(type.quantityTotal || 0) - Number(type.quantitySold || 0)),
  }));
  const eventEnded = event.endDateTime ? new Date(event.endDateTime).getTime() < Date.now() : false;
  
  // Check if registration has started
  const registrationNotStarted = event.registrationStartDate 
    ? new Date(event.registrationStartDate).getTime() > Date.now() 
    : false;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDFCFB] via-[#fdfaf6] to-[#FDFCFB] relative selection:bg-[#C0A04C]/30 overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0">
        <div className="absolute top-0 right-[-10%] w-[40%] h-[40%] bg-[#C0A04C]/4 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-[-10%] w-[40%] h-[40%] bg-[#3a1224]/4 blur-[120px] rounded-full" />
      </div>
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/70 to-transparent pointer-events-none z-0" />

      {/* Event Hero with Banner */}
      <div className="relative z-10">
        <EventHero event={event} banner={event.bannerUrl || PLACEHOLDER_IMAGE} />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-24 lg:pb-32 pt-12 lg:pt-16">
        {error ? (
          <div className="mb-12 p-6 bg-red-50 border border-red-200 text-red-700 rounded-[2rem] text-sm font-bold uppercase tracking-wider flex items-center gap-3">
            {error}
          </div>
        ) : null}

        {needsAccessCode ? (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.08)] border border-[#3a1224]/5 p-8 md:p-12 backdrop-blur-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-[2px] bg-gradient-to-r from-[#C0A04C] to-[#C0A04C]/50" />
                <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Restricted Event</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-[#3a1224] mb-4 tracking-tight">Access Code Required</h2>
              <p className="text-[#3a1224]/70 font-medium mb-8 leading-relaxed">This is a private event. Please enter the access code provided to view details and purchase tickets.</p>
              
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAccessCodeSubmit()}
                placeholder="Enter event access code"
                className="w-full bg-[#3a1224]/5 border border-[#3a1224]/15 text-[#3a1224] px-6 py-4 rounded-2xl focus:outline-none focus:border-[#C0A04C] focus:bg-white focus:shadow-[0_0_0_3px_rgba(192,160,76,0.1)] transition-all duration-300 placeholder-[#3a1224]/40 text-base mb-6 font-medium"
              />
              <button
                onClick={handleAccessCodeSubmit}
                disabled={accessCodeMutation.isPending}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#3a1224] to-[#2a0d1a] text-white font-black uppercase tracking-wider text-sm hover:shadow-lg hover:shadow-[#3a1224]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {accessCodeMutation.isPending ? "Unlocking..." : "Unlock Event"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-16 lg:space-y-24">
            {/* Event Details Section */}
            <section id="details">
              <EventDetails 
                event={event} 
                formatDateTime={formatDateTime}
                hallName={event.hallId?.name || "Venue"}
              />
            </section>

            {/* About Section */}
            {event.description && (
              <section id="about" className="scroll-mt-20">
                <div className="mb-8">
                  <div className="h-1 w-24 bg-gradient-to-r from-[#C0A04C] to-transparent mb-6" />
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#3a1224] tracking-tight">About This Event</h2>
                </div>
                <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-white/50 p-8 lg:p-12 xl:p-16">
                  <div className="prose prose-lg max-w-none text-[#3a1224] leading-relaxed">
                    <div className="bg-gradient-to-br from-[#FDFCFB] to-[#fdfaf6] rounded-2xl p-8 border border-[#3a1224]/5">
                      <RichTextDisplay content={event.description} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Venue Information */}
            <section id="venue" className="scroll-mt-20">
              <VenueInfo venue={event.hallId} />
            </section>

            {/* Tickets Section */}
            <section id="tickets" className="scroll-mt-20">
              <div className="mb-8">
                <div className="h-1 w-24 bg-gradient-to-r from-[#C0A04C] to-transparent mb-6" />
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#3a1224] tracking-tight">Get Your Ticket</h2>
              </div>
              <TicketsSection 
                ticketTypes={ticketTypes}
                onBuyTicket={handleBuyTicket}
                eventEnded={eventEnded}
                registrationNotStarted={registrationNotStarted}
                registrationStartDate={event.registrationStartDate}
                submitting={submitting}
                onSelectPaymentGateway={setGatewayTicketId}
                selectedPaymentGateway={gatewayTicketId}
                eventCapacity={event.hallId?.capacity || 0}
                totalSold={ticketTypes.reduce((sum, t) => sum + (t.quantitySold || 0), 0)}
              />
            </section>
          </div>
        )}
      </div>
    </main>

  );
}
