"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";

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
      <div className="min-h-screen bg-[#fdfbf7] px-4 py-10">
        <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-600">
          Loading event...
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] px-4 py-10">
        <div className="max-w-5xl mx-auto bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-600">
          {error || "Event not found."}
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
    <main className="min-h-screen bg-[#fdfbf7]">
      <section className="relative">
        <div className="relative h-64 md:h-80 w-full">
          <Image src={banner} alt={event.name || "Event"} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">{event.type || "Event"}</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">{event.name}</h1>
            <p className="text-sm text-white/80 mt-2">
              {hallName} · {formatDateTime(event.startDateTime)}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        {error ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        ) : null}

        {needsAccessCode ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900">Access code required</h2>
            <p className="text-sm text-gray-600 mt-2">Enter the event access code to view details.</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-3">
              <input
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter access code"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={() => fetchEvent(accessCode.trim())}
                className="px-4 py-2 rounded-lg bg-[#9e1c3f] text-white text-sm font-semibold"
              >
                Unlock event
              </button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900">Event details</h2>
            <p className="text-sm text-gray-600 mt-3">{event.description || "No description provided."}</p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Start</p>
                <p className="font-semibold">{formatDateTime(event.startDateTime)}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">End</p>
                <p className="font-semibold">{formatDateTime(event.endDateTime)}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Venue</p>
                <p className="font-semibold">{hallName}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-500 uppercase">Access</p>
                <p className="font-semibold">{event.isPublic ? "Public" : "Private"}</p>
              </div>
            </div>
            {event.hallId?.slug ? (
              <button
                onClick={() => router.push(ROUTES.SITE.VENUES(event.hallId.slug))}
                className="mt-4 text-sm text-[#6b1f3a] font-semibold hover:underline"
              >
                View venue details
              </button>
            ) : null}
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900">Tickets</h2>
            <p className="text-sm text-gray-600 mt-2">Choose your ticket type.</p>
            {eventEnded ? (
              <div className="mt-3 text-xs text-red-600">Ticket sales closed. This event has ended.</div>
            ) : null}
            <div className="mt-4 space-y-3">
              {remainingTypes.length ? (
                remainingTypes.map((type) => {
                  const soldOut = type.remaining <= 0;
                  const isPaid = Number(type.price || 0) > 0;
                  const showGateway = gatewayTicketId === type._id && !soldOut && !eventEnded && isPaid;
                  const priceLabel = Number(type.price || 0) > 0 ? `NPR ${Number(type.price || 0).toLocaleString()}` : "Free";
                  return (
                    <div key={type._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{type.name}</p>
                          <p className="text-xs text-gray-500">{priceLabel}</p>
                          <p className="text-xs text-gray-500">Remaining: {type.remaining}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (soldOut || eventEnded || submitting === type._id) return;
                            if (isPaid) {
                              setGatewayTicketId(type._id);
                              return;
                            }
                            handleBuyTicket(type._id);
                          }}
                          disabled={soldOut || eventEnded || submitting === type._id}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                            soldOut || eventEnded
                              ? "bg-gray-200 text-gray-500"
                              : "bg-[#9e1c3f] text-white hover:bg-[#b32346]"
                          }`}
                        >
                          {eventEnded
                            ? "Event ended"
                            : soldOut
                            ? "Sold out"
                            : submitting === type._id
                            ? "Processing..."
                            : isPaid
                            ? "Buy ticket"
                            : "Get ticket"}
                        </button>
                      </div>
                      {showGateway ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleBuyTicket(type._id, "ESEWA")}
                            disabled={submitting === type._id}
                            className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#0f6a37] text-white hover:bg-[#0b552d]"
                          >
                            Pay via eSewa
                          </button>
                          <button
                            onClick={() => handleBuyTicket(type._id, "KHALTI")}
                            disabled={submitting === type._id}
                            className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#5b2a86] text-white hover:bg-[#4a226f]"
                          >
                            Pay via Khalti
                          </button>
                          <button
                            onClick={() => setGatewayTicketId(null)}
                            disabled={submitting === type._id}
                            className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500">No ticket types available yet.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
