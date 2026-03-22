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
    <div className="min-h-screen bg-[#fdfaf6] selection:bg-[#C0A04C]/30">
      {/* Dark Gradient Header background */}
      <div className="absolute top-0 left-0 w-full h-[450px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/95 to-[#fdfaf6] pointer-events-none z-0" />

      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 pt-40 pb-32 relative z-10">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[#C0A04C]" />
            <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Reservation History</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="text-6xl lg:text-8xl font-display font-bold text-white mb-6 leading-[0.9]">My <span className="text-[#C0A04C] italic font-serif">Bookings</span></h1>
              <p className="text-white/60 text-lg font-light leading-relaxed max-w-xl">
                 Review your exclusive event reservations, track payment status, and access digital invoices.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0A04C]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-12 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-[#C0A04C]/50 transition-all appearance-none cursor-pointer backdrop-blur-md group-hover:bg-white/10"
                >
                  <option value="" className="bg-[#3a1224]">All Reservations</option>
                  <option value="PENDING" className="bg-[#3a1224]">Pending review</option>
                  <option value="CONFIRMED" className="bg-[#3a1224]">Confirmed events</option>
                  <option value="COMPLETED" className="bg-[#3a1224]">Past completions</option>
                  <option value="CANCELLED" className="bg-[#3a1224]">Cancelled</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="w-4 h-4 text-[#C0A04C] rotate-90" />
                </div>
              </div>

              <button
                onClick={fetchBookings}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[#C0A04C] hover:bg-white/10 transition-all backdrop-blur-md"
                title="Refresh History"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-[400px] bg-white/40 animate-pulse rounded-[2.5rem] border border-[#3a1224]/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#3a1224]/5 rounded-full flex items-center justify-center mb-8">
               <Calendar className="w-10 h-10 text-[#3a1224]/20" />
            </div>
            <h3 className="text-3xl font-display font-bold text-[#3a1224] mb-4">No reservations found</h3>
            <p className="text-[#3a1224]/50 text-sm max-w-xs mb-8">You haven't made any bookings yet. Start your journey by exploring our exclusive venues.</p>
            <button 
              onClick={() => router.push(ROUTES.SITE.VENUES())}
              className="h-14 px-10 bg-[#3a1224] text-[#C0A04C] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all"
            >
              Discover Venues
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
                  className="group relative"
                >
                  <div className="absolute -inset-1 bg-gradient-to-b from-[#C0A04C]/10 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                  
                  <div className="relative bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-[#3a1224]/5 p-8 flex flex-col h-full overflow-hidden">
                    {/* Background Accent */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#C0A04C]/[0.03] rounded-bl-[100px] pointer-events-none" />

                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div>
                        <StatusBadge status={b.status} />
                        <div className="mt-4 flex items-center gap-2 text-[#3a1224]/40 text-[10px] font-black uppercase tracking-widest">
                           <Clock className="w-3 h-3 text-[#C0A04C]" />
                           Recorded {formatDate(b.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-[#3a1224]/30 uppercase tracking-widest mb-1">Total Amount</p>
                         <p className="text-2xl font-display font-bold text-[#3a1224]">NPR {Number(b.totalAmount || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex-1 mb-10">
                      <h3 className="text-3xl font-display font-bold text-[#3a1224] mb-3 group-hover:text-[#C0A04C] transition-colors line-clamp-2">
                        {b.eventName || "Signature Event"}
                      </h3>
                      <div className="flex items-center gap-2 mb-6">
                         <div className="w-6 h-[1px] bg-[#C0A04C]/30" />
                         <span className="text-[11px] font-medium text-[#3a1224]/60 italic font-serif">
                            {b.eventType || "Exclusive Venue Reservation"}
                         </span>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-[#fdfaf6] rounded-2xl border border-[#3a1224]/5">
                           <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-[#C0A04C]" />
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Event date & Slot</p>
                              <p className="text-sm font-bold text-[#3a1224]">{formatDate(b.date)} <span className="text-[#C0A04C]/50 mx-1">·</span> {b.slot}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 bg-[#fdfaf6] rounded-2xl border border-[#3a1224]/5">
                           <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                              <Users className="w-5 h-5 text-[#C0A04C]" />
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Guest Capacity</p>
                              <p className="text-sm font-bold text-[#3a1224]">{guestsLabel(b)} Registered Guests</p>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-[#3a1224]/5 flex items-center justify-between gap-4">
                      {((["CONFIRMED", "COMPLETED"].includes(b.status) && b.paymentId)) || (b.paymentId && (b.paymentId.status === "COMPLETED" || b.paymentId.gateway === "CASH")) ? (
                        <button
                          onClick={() => handleDownloadInvoice(b._id)}
                          className="flex items-center gap-2 h-14 px-6 bg-[#3a1224] text-[#C0A04C] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl transition-all"
                        >
                          <Download className="w-4 h-4" /> Invoice
                        </button>
                      ) : (
                        <div className="px-5 py-3 bg-gray-50 rounded-2xl text-[9px] font-black text-[#3a1224]/30 uppercase tracking-[0.2em]">
                           Awaiting Pmt.
                        </div>
                      )}

                      <button
                        onClick={() => {
                          const slug = b.hallId?.slug || b.hallId?._id || b.hallId || "";
                          if (slug) router.push(ROUTES.SITE.VENUES(slug));
                        }}
                        className="group/btn flex items-center gap-3 text-[#3a1224] text-[10px] font-black uppercase tracking-widest hover:text-[#C0A04C] transition-colors"
                      >
                        View Venue
                        <div className="w-10 h-10 rounded-full border border-[#3a1224]/10 flex items-center justify-center group-hover/btn:border-[#C0A04C] group-hover/btn:bg-[#C0A04C] group-hover/btn:text-white transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </div>
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
