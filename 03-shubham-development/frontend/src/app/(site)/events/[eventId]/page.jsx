"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
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

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const eventId = params?.eventId;

  const [accessCode, setAccessCode] = useState("");
  const [needsAccessCode, setNeedsAccessCode] = useState(false);
  const [submitting, setSubmitting] = useState(null);
  const [gatewayTicketId, setGatewayTicketId] = useState(null);
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
      <main className="min-h-screen bg-[#FDFCFB]">
        <section className="bg-[#3a1224] px-6 pb-16 pt-44 text-white">
          <div className="mx-auto max-w-[1400px]">
            <div className="h-4 w-40 animate-pulse rounded-full bg-[#C0A04C]/25" />
            <div className="mt-8 h-16 max-w-3xl animate-pulse rounded-2xl bg-white/10" />
            <div className="mt-5 h-6 max-w-xl animate-pulse rounded-full bg-white/10" />
          </div>
        </section>
        <div className="mx-auto grid max-w-[1400px] gap-6 px-6 py-10 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <div className="h-64 animate-pulse rounded-[2rem] border border-[#eadfcb] bg-white" />
            <div className="h-44 animate-pulse rounded-[2rem] border border-[#eadfcb] bg-white" />
          </div>
          <div className="h-96 animate-pulse rounded-[2rem] border border-[#eadfcb] bg-white" />
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FDFCFB] px-6 pt-28">
        <div className="max-w-md rounded-[2rem] border border-[#eadfcb] bg-white p-8 text-center shadow-[0_22px_70px_-45px_rgba(58,18,36,0.45)]">
          <p className="text-[11px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">Event not found</p>
          <h2 className="mt-3 text-2xl font-black text-[#3a1224]">We could not load this event.</h2>
          <p className="mt-3 text-sm leading-6 text-[#3a1224]/65">
            {error?.response?.data?.message || error?.message || "This event may no longer be available."}
          </p>
          <button
            onClick={() => router.push(ROUTES.SITE.EVENTS)}
            className="mt-6 cursor-pointer rounded-full bg-[#3a1224] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#C0A04C] hover:text-[#3a1224]"
          >
            Back to Events
          </button>
        </div>
      </main>
    );
  }

  const banner = event.bannerUrl || PLACEHOLDER_IMAGE;
  const hallName = event.hallId?.name || "Venue";
  const eventEnded = event.endDateTime ? new Date(event.endDateTime).getTime() < Date.now() : false;
  
  // Check if registration has started
  const registrationNotStarted = event.registrationStartDate 
    ? new Date(event.registrationStartDate).getTime() > Date.now() 
    : false;

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FDFCFB] selection:bg-[#C0A04C]/30">
      <EventHero event={event} banner={banner} ticketTypes={ticketTypes} eventEnded={eventEnded} />

      <div className="mx-auto max-w-[1400px] px-6 pb-16 pt-10 lg:px-8 lg:pb-24">
        {error ? (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            {error?.response?.data?.message || error?.message || "We could not refresh the latest event details."}
          </div>
        ) : null}

        {needsAccessCode ? (
          <div className="mx-auto max-w-lg">
            <div className="rounded-2xl border border-[#e8dcc8] bg-white p-7">
              <p className="site-eyebrow mb-1.5">Private event</p>
              <h2 className="text-2xl font-black text-[#3a1224]">Access code required</h2>
              <p className="mt-2 text-sm leading-6 text-[#3a1224]/60">
                Enter the access code provided by the organizer to view tickets and event details.
              </p>
              <input
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAccessCodeSubmit()}
                placeholder="Event access code"
                className="mt-5 w-full rounded-xl border border-[#e8dcc8] bg-[#fbf8f2] px-4 py-3 text-sm font-medium text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:bg-white focus:ring-2 focus:ring-[#C0A04C]/15"
              />
              <button
                onClick={handleAccessCodeSubmit}
                disabled={accessCodeMutation.isPending}
                className="mt-3 w-full cursor-pointer rounded-xl bg-[#3a1224] px-6 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {accessCodeMutation.isPending ? "Verifying…" : "Unlock event"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
            <div className="space-y-10">
              <EventDetails event={event} hallName={hallName} />

              {event.description && (
                <section id="about" className="scroll-mt-28">
                  <p className="site-eyebrow mb-1.5">About</p>
                  <h2 className="mb-5 text-2xl font-black text-[#3a1224]">About this event</h2>
                  <div className="prose prose-base max-w-none text-[#3a1224]/75 prose-p:leading-7 prose-headings:text-[#3a1224] prose-strong:text-[#3a1224]">
                    <RichTextDisplay content={event.description} />
                  </div>
                </section>
              )}

              <section id="venue" className="scroll-mt-28">
                <VenueInfo venue={event.hallId} />
              </section>
            </div>

            <div className="order-first lg:sticky lg:top-28 lg:order-none">
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
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
