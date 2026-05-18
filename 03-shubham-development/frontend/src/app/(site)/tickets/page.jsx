"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { QRCodeCanvas } from "qrcode.react";
import { ROUTES } from "config/routes";
import { useQueryTicketsMy } from "@queries/customer/tickets-my";
import { SitePageHeader, SiteCard, SiteButton } from "components/site/SitePrimitives.jsx";

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
    <span className={`inline-flex rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${STATUS_STYLES[status] || "border-[var(--color-sand)] bg-[var(--color-ivory)] text-[var(--color-wine)]"}`}>
      {status || "Unknown"}
    </span>
  );
}

function TicketsSkeleton() {
  return (
    <div className="grid gap-6">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-56 animate-pulse rounded-2xl border border-[var(--color-sand)] bg-white" />
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
    <main className="min-h-screen bg-[var(--color-ivory)]">
      <SitePageHeader
        eyebrow="Digital Tickets"
        title="My Tickets"
        description="View your upcoming bookings, ticket details, and event access."
      >
        <SiteButton type="button" onClick={() => refetch()} disabled={isLoading} variant="secondary" size="sm" icon={null}>
          Refresh Tickets
        </SiteButton>
      </SitePageHeader>

      <section className="mx-auto max-w-5xl px-6 py-10 lg:px-8 lg:py-14">
        {/* Stats Row */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="All tickets" value={stats.all} />
          <StatCard label="Active" value={stats.active} />
          <StatCard label="Past/other" value={stats.inactive} />
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2 rounded-xl border border-[var(--color-sand)] bg-white p-2">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setStatusFilter(option.value)}
              className={`cursor-pointer rounded-lg px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                statusFilter === option.value
                  ? "bg-[var(--color-wine)] text-white"
                  : "text-[var(--color-stone)] hover:bg-[var(--color-ivory)] hover:text-[var(--color-wine)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <TicketsSkeleton />
        ) : filtered.length === 0 ? (
          <SiteCard className="border-dashed px-6 py-20 text-center">
            <p className="text-4xl">🎟️</p>
            <h2 className="mt-5 text-xl font-black text-[var(--color-wine)]">No tickets yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--color-stone)]">
              Your booked tickets will appear here after you reserve an event.
            </p>
            <div className="mt-8">
              <SiteButton href={ROUTES.SITE.EVENTS}>
                Browse Events
              </SiteButton>
            </div>
          </SiteCard>
        ) : (
          <div className="grid gap-6">
            {filtered.map((ticket) => {
              const event = ticket.eventId || {};
              const ticketType = ticket.ticketTypeId || {};
              const hall = event?.hallId || {};

              return (
                <SiteCard as="article" key={ticket._id} className="grid overflow-hidden lg:grid-cols-[240px_minmax(0,1fr)]">
                  {/* QR Section */}
                  <div className="flex flex-col items-center justify-center bg-[var(--color-wine)] p-6 text-white lg:border-r lg:border-[var(--color-wine-hover)]">
                    <div className="rounded-xl bg-white p-4">
                      <QRCodeCanvas
                        id={`qr-${ticket._id}`}
                        value={ticket.qrCodeValue || ""}
                        size={132}
                        includeMargin={false}
                        level="H"
                      />
                    </div>
                    <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-champagne)]">
                      Entry QR
                    </p>
                    <div className="mt-4 grid w-full grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadQr(ticket._id)}
                        className="cursor-pointer rounded-lg border border-white/20 bg-white/10 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/20"
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(ticket.qrCodeValue)}
                        className="cursor-pointer rounded-lg border border-white/20 bg-white/10 py-2 text-[9px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-white/20"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <StatusBadge status={ticket.status} />
                        <h2 className="mt-4 text-xl font-black leading-tight text-[var(--color-wine)] sm:text-2xl">
                          {event.name || "Event ticket"}
                        </h2>
                        <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-[var(--color-champagne)]">
                          {ticketType.name || "Access pass"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-3 text-right">
                        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-stone)]">Price</p>
                        <p className="mt-1 text-base font-black text-[var(--color-wine)]">NPR {Number(ticketType.price || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 border-y border-[var(--color-sand)] py-6 sm:grid-cols-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">Date & Time</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-[var(--color-wine)]">{formatDateTime(event.startDateTime)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">Venue</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-[var(--color-wine)]">{hall.name || "Venue"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">Status</p>
                        <p className="mt-2 text-sm font-bold leading-6 text-[var(--color-wine)]">
                          {ticket.checkedInAt ? `Entered ${formatDateTime(ticket.checkedInAt)}` : "Not checked in"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">Entry code</p>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(ticket.qrCodeValue)}
                          className="mt-1 cursor-pointer break-all text-left font-mono text-xs font-bold text-[var(--color-stone)] transition hover:text-[var(--color-wine)]"
                        >
                          {ticket.qrCodeValue || "No code available"}
                        </button>
                      </div>

                      {event._id ? (
                        <SiteButton href={ROUTES.SITE.EVENT_DETAIL(event._id)} variant="secondary" size="sm" icon={null}>
                          View Event
                        </SiteButton>
                      ) : null}
                    </div>
                  </div>
                </SiteCard>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <SiteCard className="p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">{label}</p>
      <p className="mt-2 text-2xl font-black text-[var(--color-wine)]">{value}</p>
    </SiteCard>
  );
}
