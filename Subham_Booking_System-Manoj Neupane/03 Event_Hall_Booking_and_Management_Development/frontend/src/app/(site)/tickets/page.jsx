"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axiosInstance from "@/lib/axios";
import { ROUTES } from "@/config/routes";
import { QRCodeCanvas } from "qrcode.react";

const STATUS_COLORS = {
  ACTIVE: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-yellow-100 text-yellow-800",
};

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

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
  return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>{status || "-"}</span>;
}

export default function TicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    if (!statusFilter) return tickets;
    return tickets.filter((t) => t.status === statusFilter);
  }, [tickets, statusFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(ROUTES.API.TICKETS.MINE, {
        params: {
          status: statusFilter || undefined,
          limit: 10,
          page: 1,
        },
      });
      setTickets(res.data?.tickets || []);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load tickets";
      toast.error(msg);
      if (err?.response?.status === 401) router.push(ROUTES.AUTH.LOGIN);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("QR code copied");
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-sm text-gray-600">Track your ticket purchases and check-in status.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <button
            onClick={fetchTickets}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border rounded-lg p-6 text-center text-gray-600">Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-lg p-6 text-center text-gray-600">No tickets found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ticket) => {
            const event = ticket.eventId || {};
            const ticketType = ticket.ticketTypeId || {};
            const hall = event?.hallId || {};
            return (
              <div key={ticket._id} className="bg-white border rounded-lg p-4 shadow-sm">
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{event.name || "Event"}</h3>
                    <p className="text-sm text-gray-600">{event.type || "Event"}</p>
                    <p className="text-sm text-gray-600">{hall.name || "Venue"}</p>
                    <p className="text-sm text-gray-600">{formatDateTime(event.startDateTime)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={ticket.status} />
                    <p className="text-sm text-gray-700">Ticket: {ticketType.name || "Ticket"}</p>
                    <p className="text-sm text-gray-700">Price: NPR {Number(ticketType.price || 0).toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Purchased {formatDateTime(ticket.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500">QR Code</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="bg-white p-2 border rounded">
                        <QRCodeCanvas
                          id={`qr-${ticket._id}`}
                          value={ticket.qrCodeValue || ""}
                          size={110}
                          includeMargin
                          level="M"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-xs break-all">{ticket.qrCodeValue}</span>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleCopyCode(ticket.qrCodeValue)}
                            className="text-xs text-[#66213f] font-semibold hover:underline"
                          >
                            Copy code
                          </button>
                          <button
                            onClick={() => handleDownloadQr(ticket._id)}
                            className="text-xs text-[#66213f] font-semibold hover:underline"
                          >
                            Download QR
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-500">Check-in</p>
                    <p className="font-semibold">{ticket.checkedInAt ? formatDateTime(ticket.checkedInAt) : "Not checked-in"}</p>
                  </div>
                </div>

                {hall.slug ? (
                  <button
                    onClick={() => router.push(ROUTES.SITE.EVENT_DETAIL(event._id))}
                    className="mt-3 text-sm text-[#66213f] font-semibold hover:underline"
                  >
                    View event details
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
