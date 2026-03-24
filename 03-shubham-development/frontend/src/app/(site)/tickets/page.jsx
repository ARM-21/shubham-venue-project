"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ROUTES } from "config/routes";
import { QRCodeCanvas } from "qrcode.react";
import { useQueryTicketsMy } from '@queries/customer/tickets-my';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  Clock, 
  Download, 
  Copy, 
  RefreshCw,
  Filter,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";

// Add animation styles
const animationStyle = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.6s ease-out forwards;
  }
`;

const STATUS_CONFIG = {
  ACTIVE: { 
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    label: "Active",
    icon: CheckCircle2
  },
  CANCELLED: { 
    bg: "bg-red-50",
    text: "text-red-700",
    label: "Cancelled",
    icon: XCircle
  },
  REFUNDED: { 
    bg: "bg-amber-50",
    text: "text-amber-700",
    label: "Refunded",
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
  const config = STATUS_CONFIG[status] || { bg: "bg-gray-50", text: "text-gray-700", label: status, icon: AlertCircle };
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <Icon className="w-4 h-4" />
      {config.label}
    </span>
  );
}

export default function TicketsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");

  const { data: ticketsData = { tickets: [] }, isLoading, refetch } = useQueryTicketsMy({
    status: statusFilter || undefined,
  });

  const tickets = Array.isArray(ticketsData?.tickets) ? ticketsData.tickets : [];

  const filtered = useMemo(() => {
    if (!statusFilter) return tickets;
    return tickets.filter((t) => t.status === statusFilter);
  }, [tickets, statusFilter]);

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
      <style>{animationStyle}</style>
      
      {/* Dark Gradient Header background */}
      <div className="absolute top-0 left-0 w-full h-[600px] md:h-[500px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/95 to-[#322f2a] pointer-events-none z-0" />

      <main className="max-w-7xl mx-auto px-6 sm:px-8 pt-40 pb-32 relative z-10">
        <header className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[#C0A04C]" />
            <span className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Digital Access Hub</span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div>
              <h1 className="text-6xl lg:text-8xl font-display font-bold text-white mb-6 leading-[0.9]">
                My <span className="text-[#C0A04C] italic font-serif">Tickets</span>
              </h1>
              <p className="text-white/70 text-lg font-light leading-relaxed max-w-2xl">
                Your gateway to exclusive events. Access your QR codes, check registration details, and manage your digital entries with ease.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative group">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1d1c1b]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-12 pr-10 py-4 bg-white/10 border border-white/20 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-[#C0A04C]/50 focus:bg-white/20 transition-all appearance-none cursor-pointer backdrop-blur-sm group-hover:bg-white/15 selection:bg-[#3a1224]"
                >
                  <option value="" className="bg-[#3a1224] text-white">All Tickets</option>
                  <option value="ACTIVE" className="bg-[#3a1224] text-white">Active Access</option>
                  <option value="CANCELLED" className="bg-[#3a1224] text-white">Cancelled</option>
                  <option value="REFUNDED" className="bg-[#3a1224] text-white">Refunded</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Filter className="w-4 h-4 text-[#C0A04C] rotate-90" />
                </div>
              </div>

              <button
                onClick={() => refetch()}
                disabled={isLoading}
                className="p-4 bg-white/10 border border-white/20 rounded-2xl text-[#C0A04C] hover:bg-white/15 disabled:opacity-50 transition-all backdrop-blur-sm"
                title="Refresh Tickets"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-[380px] bg-white/40 animate-pulse rounded-3xl border border-[#3a1224]/5" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-48 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-[#C0A04C]/15 rounded-full flex items-center justify-center mb-12 backdrop-blur-sm border border-[#C0A04C]/20">
              <Ticket className="w-16 h-16 text-[#C0A04C]" />
            </div>
            <h3 className="text-5xl font-display font-bold text-[#3a1224] mb-6">No tickets yet</h3>
            <p className="text-[#3a1224]/70 text-lg max-w-2xl mb-12">Start exploring amazing events and secure your tickets to unforgettable experiences.</p>
            <button 
              onClick={() => router.push('/events')}
              className="group relative px-16 py-5 bg-gradient-to-r from-[#C0A04C] via-[#C0A04C] to-[#C0A04C]/95 text-[#3a1224] rounded-3xl font-black text-xs uppercase tracking-[0.15em] shadow-2xl hover:shadow-3xl hover:scale-110 active:scale-95 transition-all border-2 border-[#C0A04C] flex items-center gap-3"
            >
              <span>Browse Events</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-[#3a1224]/60 text-xs mt-6">Discover upcoming events, create memories, and book your spot today</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filtered.map((ticket, idx) => {
              const event = ticket.eventId || {};
              const ticketType = ticket.ticketTypeId || {};
              const hall = event?.hallId || {};
              
              return (
                <div
                  key={ticket._id}
                  className="group relative opacity-0 animate-fadeIn"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-b from-[#C0A04C]/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
                  
                  <div className="relative bg-white/95 rounded-3xl shadow-2xl border border-[#3a1224]/5 flex flex-col md:flex-row overflow-hidden min-h-[380px] backdrop-blur-sm">
                    {/* Left: QR Section */}
                    <div className="md:w-2/5 bg-gradient-to-br from-[#3a1224] via-[#3a1224]/95 to-[#2a0d1a] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute -top-1/2 -left-1/2 w-96 h-96 bg-[#C0A04C]/20 rounded-full blur-3xl" />
                        <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-[#C0A04C]/10 rounded-full blur-3xl" />
                      </div>
                      
                      <div className="relative z-10 bg-white p-5 rounded-2xl shadow-2xl group-hover:shadow-3xl group-hover:scale-110 transition-all duration-500">
                        <QRCodeCanvas
                          id={`qr-${ticket._id}`}
                          value={ticket.qrCodeValue || ""}
                          size={160}
                          includeMargin={false}
                          level="H"
                          className="rounded-lg"
                        />
                      </div>
                      
                      <div className="mt-8 flex gap-3 z-10 w-full px-4">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDownloadQr(ticket._id); }}
                          className="flex-1 px-4 py-3 bg-white/15 hover:bg-[#C0A04C]/80 text-white rounded-xl flex items-center justify-center gap-2 transition-all group/btn backdrop-blur-sm border border-white/20 hover:border-[#C0A04C]/50 font-semibold text-xs uppercase tracking-wider"
                          title="Download QR"
                        >
                          <Download className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCopyCode(ticket.qrCodeValue); }}
                          className="flex-1 px-4 py-3 bg-white/15 hover:bg-[#C0A04C]/80 text-white rounded-xl flex items-center justify-center gap-2 transition-all group/btn backdrop-blur-sm border border-white/20 hover:border-[#C0A04C]/50 font-semibold text-xs uppercase tracking-wider"
                          title="Copy Code"
                        >
                          <Copy className="w-4 h-4 group-hover/btn:scale-125 transition-transform" />
                          <span className="hidden sm:inline">Copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Right: Info Section */}
                    <div className="flex-1 p-8 md:p-10 flex flex-col bg-gradient-to-b from-white/40 to-white/20">
                      <div className="flex justify-between items-start mb-6">
                        <StatusBadge status={ticket.status} />
                        <div className="text-right">
                          <p className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Price</p>
                          <p className="text-2xl font-display font-bold text-[#3a1224]">NPR {Number(ticketType.price || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex-1 mb-8">
                        <h3 className="text-3xl font-display font-bold text-[#3a1224] mb-3 group-hover:text-[#C0A04C] transition-colors line-clamp-2 leading-tight">
                          {event.name || "Signature Event"}
                        </h3>
                        <p className="text-[11px] font-black text-[#C0A04C] uppercase tracking-[0.2em] mb-8">
                          {ticketType.name || "Access Pass"}
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="flex items-center gap-4 p-3 bg-white/40 rounded-lg backdrop-blur-sm">
                            <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4 text-[#C0A04C]" />
                            </div>
                            <span className="text-xs font-bold text-[#3a1224]/70">{formatDateTime(event.startDateTime)}</span>
                          </div>
                          <div className="flex items-center gap-4 p-3 bg-white/40 rounded-lg backdrop-blur-sm">
                            <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
                              <MapPin className="w-4 h-4 text-[#C0A04C]" />
                            </div>
                            <span className="text-xs font-bold text-[#3a1224]/70">{hall.name || "Exclusive Venue"}</span>
                          </div>
                          <div className="flex items-center gap-4 p-3 bg-white/40 rounded-lg backdrop-blur-sm">
                            <div className="w-8 h-8 rounded-lg bg-white/60 flex items-center justify-center flex-shrink-0">
                              <Clock className="w-4 h-4 text-[#C0A04C]" />
                            </div>
                            <span className={`text-xs font-bold ${ticket.checkedInAt ? 'text-emerald-600' : 'text-[#3a1224]/50'}`}>
                              {ticket.checkedInAt ? `Entered: ${formatDateTime(ticket.checkedInAt)}` : 'Pending Entry'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-[#3a1224]/10 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest">Auth Code</span>
                          <span className="text-[10px] font-mono text-[#3a1224]/70">{ticket.qrCodeValue}</span>
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
                    <div className="hidden md:block absolute left-2/5 top-0 -translate-x-1/2 w-8 h-8 bg-[#fdfaf6] rounded-full -mt-4 border-2 border-[#3a1224]/5 shadow-lg" />
                    <div className="hidden md:block absolute left-2/5 bottom-0 -translate-x-1/2 w-8 h-8 bg-[#fdfaf6] rounded-full -mb-4 border-2 border-[#3a1224]/5 shadow-lg" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
