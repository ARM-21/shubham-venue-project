"use client";

import { useEffect, useMemo, useState } from "react";
import axiosInstance from "lib/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ROUTES } from "config/routes";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Ticket, 
  Download, 
  ChevronRight, 
  Search,
  RefreshCw,
  Clock,
  ArrowRight,
  Filter
} from "lucide-react";

const STATUS_CONFIG = {
  PENDING: { 
    color: "text-amber-600 bg-amber-50 border-amber-100", 
    label: "Pending Review",
    dot: "bg-amber-400"
  },
  CONFIRMED: { 
    color: "text-emerald-600 bg-emerald-50 border-emerald-100", 
    label: "Confirmed",
    dot: "bg-emerald-400"
  },
  COMPLETED: { 
    color: "text-blue-600 bg-blue-50 border-blue-100", 
    label: "Completed",
    dot: "bg-blue-400"
  },
  CANCELLED: { 
    color: "text-rose-600 bg-rose-50 border-rose-100", 
    label: "Cancelled",
    dot: "bg-rose-400"
  },
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
  const config = STATUS_CONFIG[status] || { color: "text-gray-600 bg-gray-50 border-gray-100", label: status, dot: "bg-gray-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
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
  }, [statusFilter]);

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
    <div className="min-h-screen bg-[#fdfaf6] relative selection:bg-[#C0A04C]/30 overflow-hidden">
      {/* Dark Gradient Header Background */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/80 to-transparent pointer-events-none z-0" />

      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-40 pb-32 relative z-10">
        {/* Header */}
        <header className="mb-20">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[#C0A04C]" />
            <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Reservations</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="text-6xl lg:text-8xl font-display font-bold text-white mb-6 leading-[0.9]">
                My <span className="text-[#C0A04C] italic font-serif">Bookings</span>
              </h1>
              <p className="text-white/70 text-lg font-light leading-relaxed max-w-2xl">
                 Track your event reservations, payment status, and manage your bookings.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0A04C]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-12 pr-8 h-12 bg-white/90 border border-[#3a1224]/10 rounded-xl text-[#3a1224] text-[9px] font-black uppercase tracking-widest focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Bookings</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="w-4 h-4 text-[#3a1224]/40 rotate-90" />
                </div>
              </div>

              <button
                onClick={fetchBookings}
                className="h-12 w-12 flex items-center justify-center bg-white/90 border border-[#3a1224]/10 rounded-xl text-[#3a1224] hover:border-[#C0A04C]/30 hover:bg-white transition-all cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 bg-white/80 animate-pulse rounded-3xl border border-[#3a1224]/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#3a1224]/5 rounded-2xl flex items-center justify-center mb-8">
               <Calendar className="w-12 h-12 text-[#3a1224]/20" />
            </div>
            <h3 className="text-3xl font-display font-bold text-[#3a1224] mb-3">No bookings yet</h3>
            <p className="text-[#3a1224]/50 text-sm max-w-xs mb-8">Explore our exclusive venues and make your first reservation.</p>
            <button 
              onClick={() => router.push(ROUTES.SITE.VENUES())}
              className="h-12 px-8 bg-[#3a1224] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              Browse Venues
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((b, idx) => (
                <motion.div
                  key={b._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group"
                >
                  <div className="relative bg-white/95 rounded-3xl shadow-lg border border-[#3a1224]/5 p-8 flex flex-col h-full overflow-hidden hover:shadow-xl transition-all">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C0A04C]/[0.04] rounded-bl-3xl pointer-events-none" />

                    <div className="relative z-10">
                      {/* Status & Amount */}
                      <div className="flex justify-between items-start mb-8">
                        <StatusBadge status={b.status} />
                        <div className="text-right">
                           <p className="text-[8px] font-black text-[#3a1224]/30 uppercase tracking-widest mb-1">Amount</p>
                           <p className="text-xl font-display font-bold text-[#3a1224]">NPR {Number(b.totalAmount || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Event Title */}
                      <h3 className="text-2xl font-display font-bold text-[#3a1224] mb-3 group-hover:text-[#C0A04C] transition-colors line-clamp-2">
                        {b.eventName || "Event"}
                      </h3>
                      <div className="flex items-center gap-2 mb-8">
                         <div className="w-1 h-4 bg-[#C0A04C]" />
                         <span className="text-[10px] font-medium text-[#3a1224]/50 uppercase tracking-widest">
                            {b.eventType || "Venue Reservation"}
                         </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-[#3a1224]/5">
                           <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4 text-[#C0A04C]" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[8px] font-black text-[#3a1224]/40 uppercase tracking-widest">Date & Slot</p>
                              <p className="text-xs font-bold text-[#3a1224] truncate">{formatDate(b.date)} · {b.slot}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-[#3a1224]/5">
                           <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4 text-[#C0A04C]" />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-[8px] font-black text-[#3a1224]/40 uppercase tracking-widest">Guests</p>
                              <p className="text-xs font-bold text-[#3a1224]">{guestsLabel(b)} Registered</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-auto pt-8 border-t border-[#3a1224]/5 flex items-center gap-3">
                      {((["CONFIRMED", "COMPLETED"].includes(b.status) && b.paymentId) || (b.paymentId && (b.paymentId.status === "COMPLETED" || b.paymentId.gateway === "CASH"))) ? (
                        <button
                          onClick={() => handleDownloadInvoice(b._id)}
                          className="flex items-center gap-2 h-10 px-4 bg-[#3a1224] text-white rounded-lg font-black text-[8px] uppercase tracking-widest hover:shadow-lg transition-all cursor-pointer"
                        >
                          <Download className="w-3 h-3" /> Invoice
                        </button>
                      ) : (
                        <div className="px-4 py-2 bg-gray-100 rounded-lg text-[8px] font-black text-[#3a1224]/30 uppercase tracking-widest">
                           Pending...
                        </div>
                      )}

                      <button
                        onClick={() => {
                          const slug = b.hallId?.slug || b.hallId?._id || b.hallId || "";
                          if (slug) router.push(ROUTES.SITE.VENUES(slug));
                        }}
                        className="ml-auto flex items-center gap-2 text-[#3a1224] text-[8px] font-black uppercase tracking-widest hover:text-[#C0A04C] transition-colors cursor-pointer"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
