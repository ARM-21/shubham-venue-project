"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  Download, 
  Copy, 
  ChevronRight,
  RefreshCw,
  Filter,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

const STATUS_CONFIG = {
  ACTIVE: { 
    color: "text-emerald-600 bg-emerald-50 border-emerald-100", 
    label: "Active",
    dot: "bg-emerald-400",
    icon: CheckCircle2
  },
  CANCELLED: { 
    color: "text-rose-600 bg-rose-50 border-rose-100", 
    label: "Cancelled",
    dot: "bg-rose-400",
    icon: XCircle
  },
  REFUNDED: { 
    color: "text-amber-600 bg-amber-50 border-amber-100", 
    label: "Refunded",
    dot: "bg-amber-400",
    icon: AlertCircle
  },
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
  const config = STATUS_CONFIG[status] || { color: "text-gray-600 bg-gray-50 border-gray-100", label: status, dot: "bg-gray-400", icon: AlertCircle };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      {config.label}
    </span>
  );
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
  }, [statusFilter]);

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
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
    <div className="min-h-screen bg-[#fdfaf6] selection:bg-[#C0A04C]/30 overflow-hidden">
      {/* Dark Gradient Header background */}
      <div className="absolute top-0 left-0 w-full h-[450px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/95 to-[#fdfaf6] pointer-events-none z-0" />

      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 pt-40 pb-32 relative z-10">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[#C0A04C]" />
            <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Digital Access Hub</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="text-6xl lg:text-8xl font-display font-bold text-white mb-6 leading-[0.9]">My <span className="text-[#C0A04C] italic font-serif">Tickets</span></h1>
              <p className="text-white/60 text-lg font-light leading-relaxed max-w-xl">
                 Your gateway to exclusive events. Access your QR codes, check registration details, and manage your digital entries.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0A04C]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-12 pr-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-[#C0A04C]/50 transition-all appearance-none cursor-pointer backdrop-blur-md group-hover:bg-white/10 selection:bg-[#3a1224]"
                >
                  <option value="" className="bg-[#3a1224]">All Tickets</option>
                  <option value="ACTIVE" className="bg-[#3a1224]">Active Access</option>
                  <option value="CANCELLED" className="bg-[#3a1224]">Cancelled</option>
                  <option value="REFUNDED" className="bg-[#3a1224]">Refunded</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="w-4 h-4 text-[#C0A04C] rotate-90" />
                </div>
              </div>

              <button
                onClick={fetchTickets}
                className="p-4 bg-white/5 border border-white/10 rounded-2xl text-[#C0A04C] hover:bg-white/10 transition-all backdrop-blur-md"
                title="Refresh Vault"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-[350px] bg-white/40 animate-pulse rounded-[2.5rem] border border-[#3a1224]/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#3a1224]/5 rounded-full flex items-center justify-center mb-8">
               <Ticket className="w-10 h-10 text-[#3a1224]/20" />
            </div>
            <h3 className="text-3xl font-display font-bold text-[#3a1224] mb-4">No tickets found</h3>
            <p className="text-[#3a1224]/50 text-sm max-w-xs mb-8">You haven't purchased any tickets yet. Explore upcoming public events and secure your spot.</p>
            <button 
              onClick={() => router.push('/events')}
              className="h-14 px-10 bg-[#3a1224] text-[#C0A04C] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filtered.map((ticket, idx) => {
                const event = ticket.eventId || {};
                const ticketType = ticket.ticketTypeId || {};
                const hall = event?.hallId || {};
                
                return (
                  <motion.div
                    key={ticket._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-b from-[#C0A04C]/10 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
                    
                    <div className="relative bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-[#3a1224]/5 flex flex-col md:flex-row overflow-hidden min-h-[350px]">
                      {/* Left: QR Section */}
                      <div className="md:w-1/3 bg-[#3a1224] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                           <div className="absolute -top-[10%] -left-[10%] w-[120%] h-[20%] bg-white/5 rotate-45" />
                           <div className="absolute -bottom-[10%] -right-[10%] w-[120%] h-[20%] bg-white/5 rotate-45" />
                        </div>
                        
                        <div className="relative z-10 bg-white p-4 rounded-[2rem] shadow-2xl group-hover:scale-105 transition-transform duration-500">
                          <QRCodeCanvas
                            id={`qr-${ticket._id}`}
                            value={ticket.qrCodeValue || ""}
                            size={160}
                            includeMargin={false}
                            level="H"
                            className="rounded-lg"
                          />
                        </div>
                        
                        <div className="mt-6 flex gap-3 z-10">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDownloadQr(ticket._id); }}
                            className="w-12 h-12 bg-white/10 hover:bg-[#C0A04C] text-white rounded-2xl flex items-center justify-center transition-all group/btn"
                            title="Download PNG"
                          >
                            <Download className="w-5 h-5 group-hover/btn:scale-110" />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCopyCode(ticket.qrCodeValue); }}
                            className="w-12 h-12 bg-white/10 hover:bg-[#C0A04C] text-white rounded-2xl flex items-center justify-center transition-all group/btn"
                            title="Copy Code"
                          >
                            <Copy className="w-5 h-5 group-hover/btn:scale-110" />
                          </button>
                        </div>
                      </div>

                      {/* Right: Info Section */}
                      <div className="flex-1 p-8 md:p-10 flex flex-col bg-white">
                        <div className="flex justify-between items-start mb-6">
                           <StatusBadge status={ticket.status} />
                           <div className="text-right">
                              <p className="text-[10px] font-black text-[#3a1224]/30 uppercase tracking-widest mb-1">Standard Price</p>
                              <p className="text-xl font-display font-bold text-[#3a1224]">NPR {Number(ticketType.price || 0).toLocaleString()}</p>
                           </div>
                        </div>

                        <div className="flex-1 mb-8">
                          <h3 className="text-3xl font-display font-bold text-[#3a1224] mb-2 group-hover:text-[#C0A04C] transition-colors line-clamp-2 leading-tight">
                            {event.name || "Signature Event"}
                          </h3>
                          <p className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.2em] mb-6">
                             {ticketType.name || "Access Pass"}
                          </p>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex items-center gap-4">
                               <div className="w-8 h-8 rounded-xl bg-[#fdfaf6] border border-[#3a1224]/5 flex items-center justify-center">
                                  <Calendar className="w-4 h-4 text-[#C0A04C]" />
                               </div>
                               <span className="text-xs font-bold text-[#3a1224]/70">{formatDateTime(event.startDateTime)}</span>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="w-8 h-8 rounded-xl bg-[#fdfaf6] border border-[#3a1224]/5 flex items-center justify-center">
                                  <MapPin className="w-4 h-4 text-[#C0A04C]" />
                               </div>
                               <span className="text-xs font-bold text-[#3a1224]/70">{hall.name || "Exclusive Venue"}</span>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="w-8 h-8 rounded-xl bg-[#fdfaf6] border border-[#3a1224]/5 flex items-center justify-center">
                                  <Clock className="w-4 h-4 text-[#3a1224]" />
                               </div>
                               <span className={`text-xs font-bold ${ticket.checkedInAt ? 'text-emerald-600' : 'text-[#3a1224]/40'}`}>
                                  {ticket.checkedInAt ? `Entered at ${formatDateTime(ticket.checkedInAt)}` : 'Gateway Entry Pending'}
                               </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-[#3a1224]/5 flex items-center justify-between">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-[#3a1224]/30 uppercase tracking-widest">Digital Auth Code</span>
                              <span className="text-[10px] font-mono text-[#3a1224]/60">{ticket.qrCodeValue}</span>
                           </div>
                           
                           {event._id && (
                             <button
                               onClick={() => router.push(ROUTES.SITE.EVENT_DETAIL(event._id))}
                               className="group/btn flex items-center gap-2 text-[#3a1224] text-[10px] font-black uppercase tracking-widest hover:text-[#C0A04C] transition-colors"
                             >
                               Details
                               <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                             </button>
                           )}
                        </div>
                      </div>

                      {/* Ticket Notch Decorations */}
                      <div className="hidden md:block absolute left-1/3 top-0 -translate-x-1/2 w-8 h-8 bg-[#fdfaf6] rounded-full -mt-4 border-b border-[#3a1224]/5" />
                      <div className="hidden md:block absolute left-1/3 bottom-0 -translate-x-1/2 w-8 h-8 bg-[#fdfaf6] rounded-full -mb-4 border-t border-[#3a1224]/5" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
