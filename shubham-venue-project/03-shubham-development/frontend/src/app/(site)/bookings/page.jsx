"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ROUTES } from "@/config/routes";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function formatDate(date) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return "-";
  }
}

function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {status || "-"}
    </span>
  );
}

export default function BookingsPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = useMemo(() => {
    if (!statusFilter) return items;
    return items.filter((b) => b.status === statusFilter);
  }, [items, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(ROUTES.API.BOOKINGS.MINE, {
        params: {
          status: statusFilter || undefined,
          limit: 10,
          page: 1,
        },
      });
      setItems(res.data?.items || []);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load bookings";
      toast.error(msg);
      if (err?.response?.status === 401) {
        router.push(ROUTES.AUTH.LOGIN);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const hallName = (hall) => {
    if (!hall) return "Hall";
    if (typeof hall === "string") return "Hall";
    return hall.name || "Hall";
  };

  const hallSlug = (hall) => {
    if (!hall || typeof hall === "string") return hall || "";
    return hall.slug || hall._id || "";
  };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const res = await axiosInstance.get(ROUTES.API.BOOKINGS.INVOICE(bookingId), { responseType: "blob" });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to download invoice");
    }
  };

  const guestsLabel = (booking) => {
    if (booking?.guests === 0) return 0;
    return booking?.guests ?? booking?.guestCount ?? "-";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-sm text-gray-600">Track your reservations and payments.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={fetchBookings}
            className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border rounded-lg p-6 text-center text-gray-600">Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border rounded-lg p-6 text-center text-gray-600">No bookings found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((b) => (
            <div key={b._id} className="bg-white border rounded-lg p-4 shadow-sm">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{b.eventName || "Event"}</h3>
                  <p className="text-sm text-gray-600">{b.eventType || hallName(b.hallId)}</p>
                  <p className="text-sm text-gray-600">{formatDate(b.date)} · {b.slot}</p>
                  <p className="text-sm text-gray-600">Guests: {guestsLabel(b)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={b.status} />
                  <p className="text-sm text-gray-700">Total: NPR {Number(b.totalAmount || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Created {formatDate(b.createdAt)}</p>
                      {(["CONFIRMED", "COMPLETED"].includes(b.status) && b.paymentId) ? (
                        <button
                          onClick={() => handleDownloadInvoice(b._id)}
                          className="text-sm text-[#66213f] hover:underline"
                        >
                          Download invoice
                        </button>
                      ) : null}
                  <button
                    onClick={() => {
                      const slug = hallSlug(b.hallId);
                      if (slug) router.push(ROUTES.SITE.VENUES(slug));
                    }}
                    className="text-sm text-[#66213f] hover:underline"
                  >
                    View Hall
                  </button>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-700">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500">Menu Total</p>
                  <p className="font-semibold">NPR {Number(b.menuTotal || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500">Decoration Total</p>
                  <p className="font-semibold">NPR {Number(b.decorationTotal || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-xs text-gray-500">Hall Price</p>
                  <p className="font-semibold">NPR {Number(b.hallPrice || 0).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded p-3 sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Payment</p>
                    <p className="font-semibold text-gray-800">{b.paymentId?.gateway || "-"}</p>
                    <p className="text-xs text-gray-600">Status: {b.paymentId?.status || "N/A"}</p>
                    <p className="text-xs text-gray-600">Paid at: {b.paymentId?.paidAt ? new Date(b.paymentId.paidAt).toLocaleString() : "-"}</p>
                    {b.paymentId?.transactionId ? (
                      <p className="text-xs text-gray-600">Txn: {b.paymentId.transactionId}</p>
                    ) : null}
                  </div>
                  <div className="flex sm:justify-end items-start">
                    {b.paymentId && (b.paymentId.status === "COMPLETED" || b.paymentId.gateway === "CASH") ? (
                      <button
                        onClick={() => handleDownloadInvoice(b._id)}
                        className="px-3 py-2 text-sm border rounded-lg text-[#66213f] font-semibold hover:bg-gray-100"
                      >
                        Download invoice
                      </button>
                    ) : (
                      <p className="text-xs text-gray-500">Invoice available after payment completion.</p>
                    )}
                  </div>
                </div>
              </div>

              {Array.isArray(b.selectedMenu) && b.selectedMenu.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Menu Items</p>
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    {b.selectedMenu.map((item, idx) => (
                      <li key={`${item.itemId || idx}-${idx}`} className="flex justify-between">
                        <span>{item.name} × {item.quantity}</span>
                        <span>NPR {Number(item.total || 0).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {b.decorationScheme && (
                <div className="mt-3 text-sm text-gray-700">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Decoration</p>
                  <p>{b.decorationScheme.name || "Scheme"} — NPR {Number(b.decorationScheme.price || 0).toLocaleString()}</p>
                </div>
              )}

              {Array.isArray(b.addons) && b.addons.length > 0 && (
                <div className="mt-3 text-sm text-gray-700">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Add-ons</p>
                  <ul className="mt-1 space-y-1">
                    {b.addons.map((a, idx) => (
                      <li key={`${a.name || idx}-${idx}`} className="flex justify-between">
                        <span>{a.name}</span>
                        <span>NPR {Number(a.price || 0).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
