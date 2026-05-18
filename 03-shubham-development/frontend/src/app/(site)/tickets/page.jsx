"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import { ROUTES } from "config/routes";
import { useQueryTicketsMy } from "@queries/customer/tickets-my";

const STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Active", value: "ACTIVE" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Refunded", value: "REFUNDED" },
];

const STATUS_STYLES = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-700",
  REFUNDED: "border-amber-200 bg-amber-50 text-amber-700",
};

function formatDateTime(value) {
  if (!value) return "Date not set";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "Date not set";
  }
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${STATUS_STYLES[status] || "border-[#eadfcb] bg-[#FDFCFB] text-[#3a1224]/65"}`}>
      {status || "Unknown"}
    </span>
  );
}

function TicketsSkeleton() {
  return (
    <div className="grid gap-5">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-56 animate-pulse rounded-[2rem] border border-[#eadfcb] bg-white" />
      ))}
    </div>
  );
}

export default function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const { data: ticketsData = { tickets: [] }, isLoading, refetch } = useQueryTicketsMy({
    status: statusFilter || undefined,
  });

  const tickets = Array.isArray(ticketsData?.tickets) ? ticketsData.tickets : [];

  const filtered = useMemo(() => {
    if (!statusFilter) return tickets;
    return tickets.filter((ticket) => ticket.status === statusFilter);
  }, [tickets, statusFilter]);

  const stats = useMemo(() => ({
    all: tickets.length,
    active: tickets.filter((ticket) => ticket.status === "ACTIVE").length,
    inactive: tickets.filter((ticket) => ticket.status !== "ACTIVE").length,
  }), [tickets]);

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code || "");
      toast.success("Entry code copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleDownloadQr = (ticketId) => {
    try {
      const canvas = document.getElementById(`qr-${ticketId}`);
      if (!canvas) throw new Error("QR not ready");
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-qr-${ticketId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error(err?.message || "Download failed");
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB]">
      <section className="relative overflow-hidden bg-[#3a1224] px-6 pb-14 pt-44 text-white">
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#FDFCFB] to-transparent" />
        <div className="relative mx-auto max-w-[1200px]">
          <p className="text-[11px] font-black uppercase tracking-[0.34em] text-[#C0A04C]">Digital tickets</p>
          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">My Tickets</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/76">
                View your upcoming bookings, ticket details, and event access.
              </p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="inline-flex cursor-pointer justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-10 lg:py-14">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#eadfcb] bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">All tickets</p>
            <p className="mt-2 text-3xl font-black text-[#3a1224]">{stats.all}</p>
          </div>
          <div className="rounded-2xl border border-[#eadfcb] bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">Active</p>
            <p className="mt-2 text-3xl font-black text-[#3a1224]">{stats.active}</p>
          </div>
          <div className="rounded-2xl border border-[#eadfcb] bg-white p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C0A04C]">Past/other</p>
            <p className="mt-2 text-3xl font-black text-[#3a1224]">{stats.inactive}</p>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-[#eadfcb] bg-white p-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={`cursor-pointer rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                statusFilter === option.value
                  ? "bg-[#3a1224] text-white"
                  : "text-[#3a1224]/65 hover:bg-[#FDFCFB]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <TicketsSkeleton />
        ) : filtered.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[#eadfcb] bg-white px-6 py-20 text-center shadow-[0_22px_70px_-50px_rgba(58,18,36,0.35)]">
            <p className="text-4xl">🎟️</p>
            <h2 className="mt-5 text-2xl font-black text-[#3a1224]">No tickets yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#3a1224]/65">
              Your booked tickets will appear here after you reserve an event.
            </p>
            <Link
              href={ROUTES.SITE.EVENTS}
              className="mt-7 inline-flex cursor-pointer justify-center rounded-full bg-[#3a1224] px-6 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830]"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid gap-5">
            {filtered.map((ticket) => {
              const event = ticket.eventId || {};
              const ticketType = ticket.ticketTypeId || {};
              const hall = event?.hallId || {};

              return (
                <article key={ticket._id} className="grid gap-0 overflow-hidden rounded-[2rem] border border-[#eadfcb] bg-white shadow-[0_18px_60px_-48px_rgba(58,18,36,0.45)] lg:grid-cols-[260px_minmax(0,1fr)]">
                  <div className="bg-[#3a1224] p-6 text-center text-white">
                    <div className="mx-auto inline-block rounded-2xl bg-white p-4">
                      <QRCodeCanvas
                        id={`qr-${ticket._id}`}
                        value={ticket.qrCodeValue || ""}
                        size={148}
                        includeMargin={false}
                        level="H"
                      />
                    </div>
                    <p className="mt-5 text-[10px] font-black uppercase tracking-[0.24em] text-[#C0A04C]">Entry QR</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadQr(ticket._id)}
                        className="cursor-pointer rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/15"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(ticket.qrCodeValue)}
                        className="cursor-pointer rounded-xl border border-white/15 bg-white/10 px-3 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/15"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <StatusBadge status={ticket.status} />
                        <h2 className="mt-4 text-2xl font-black leading-tight text-[#3a1224] sm:text-3xl">
                          {event.name || "Event ticket"}
                        </h2>
                        <p className="mt-2 text-sm font-black uppercase tracking-[0.18em] text-[#C0A04C]">
                          {ticketType.name || "Access pass"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#eadfcb] bg-[#FDFCFB] px-5 py-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C0A04C]">Price</p>
                        <p className="mt-1 text-lg font-black text-[#3a1224]">NPR {Number(ticketType.price || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-[#FDFCFB] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C0A04C]">📅 Date</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-[#3a1224]">{formatDateTime(event.startDateTime)}</p>
                      </div>
                      <div className="rounded-2xl bg-[#FDFCFB] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C0A04C]">📍 Venue</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-[#3a1224]">{hall.name || "Venue"}</p>
                      </div>
                      <div className="rounded-2xl bg-[#FDFCFB] p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#C0A04C]">✅ Entry</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-[#3a1224]">
                          {ticket.checkedInAt ? `Entered ${formatDateTime(ticket.checkedInAt)}` : "Not checked in"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 border-t border-[#eadfcb] pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/45">Entry code</p>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(ticket.qrCodeValue)}
                          className="mt-1 cursor-pointer break-all text-left font-mono text-xs font-bold text-[#3a1224]/70 transition hover:text-[#3a1224]"
                        >
                          {ticket.qrCodeValue || "No code available"}
                        </button>
                      </div>

                      {event._id ? (
                        <Link
                          href={ROUTES.SITE.EVENT_DETAIL(event._id)}
                          className="inline-flex cursor-pointer justify-center rounded-full bg-[#3a1224] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#4b1830]"
                        >
                          View Event
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
