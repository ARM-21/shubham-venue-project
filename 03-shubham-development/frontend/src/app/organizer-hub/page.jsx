"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CalendarCheck, 
  ClipboardList, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  ArrowRight, 
  Clock, 
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  Zap
} from "lucide-react";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket } from "lucide-react";

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", { year: "numeric", month: "short", day: "numeric" }).format(new Date(value));
  } catch {
    return "-";
  }
}

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

function statusTone(status) {
  switch (status) {
    case "approved":
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-sm shadow-emerald-500/5";
    case "pending":
      return "text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-sm shadow-amber-500/5";
    case "rejected":
      return "text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-sm shadow-rose-500/5";
    default:
      return "text-[#3a1224]/40 bg-[#3a1224]/5 border-[#3a1224]/10";
  }
}

const statusConfig = {
  approved: { icon: CheckCircle2, label: "Active Producer", dot: "bg-emerald-400" },
  pending: { icon: Clock, label: "Verification Pending", dot: "bg-amber-400" },
  rejected: { icon: XCircle, label: "Action Required", dot: "bg-rose-400" },
  none: { icon: AlertCircle, label: "Awaiting Application", dot: "bg-gray-400" }
};

export default function OrganizerHubPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [events, setEvents] = useState([]);
  const [eligibleBookings, setEligibleBookings] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  const statusValue = String(status?.organizerStatus || (user?.isOrganizerEligible ? "approved" : user?.organizerStatus || "none")).toLowerCase();
  const isApproved = status?.isOrganizerEligible || statusValue === "approved" || user?.isOrganizerEligible;

  useEffect(() => {
    let ignore = false;
    async function fetchStatus() {
      try {
        setStatusLoading(true);
        const res = await axiosInstance.get(ROUTES.API.ORGANIZER_REQUESTS.ME);
        if (!ignore) setStatus(res.data || null);
      } catch (err) {
        if (!ignore) setStatus(null);
      } finally {
        if (!ignore) setStatusLoading(false);
      }
    }

    if (user) fetchStatus();

    return () => {
      ignore = true;
    };
  }, [user]);

  useEffect(() => {
    let ignore = false;
    async function fetchDashboard() {
      try {
        setDashboardLoading(true);
        const [eventsRes, bookingsRes] = await Promise.all([
          axiosInstance.get(ROUTES.API.ORGANIZER.EVENTS),
          axiosInstance.get(ROUTES.API.ORGANIZER.BOOKINGS, { params: { eligibleForEvent: true } }),
        ]);
        if (!ignore) {
          setEvents(eventsRes.data?.events || []);
          setEligibleBookings(bookingsRes.data?.bookings || []);
        }
      } catch (err) {
        if (!ignore) {
          toast.error(err?.response?.data?.message || "Failed to load organizer dashboard");
        }
      } finally {
        if (!ignore) setDashboardLoading(false);
      }
    }

    if (isApproved) fetchDashboard();

    return () => {
      ignore = true;
    };
  }, [isApproved]);

  const stats = useMemo(() => {
    const total = events.length;
    const published = events.filter((e) => e.status === "PUBLISHED").length;
    const draft = events.filter((e) => e.status === "DRAFT").length;
    return { total, published, draft, eligibleBookings: eligibleBookings.length };
  }, [events, eligibleBookings]);

  async function submitRequest() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = { note: note.trim() };
      const res = await axiosInstance.post(ROUTES.API.ORGANIZER_REQUESTS.ROOT, payload);
      setStatus(res.data || null);
      toast.success("Application submitted successfully");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Application failed");
    } finally {
      setSubmitting(false);
    }
  }

  const recentEvents = events.slice(0, 3);
  const currentStatusConfig = statusConfig[statusValue] || statusConfig.none;

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#fdfaf6]">
      <main className="flex-1 flex flex-col p-4 sm:p-6 lg:px-8 lg:py-4 max-w-[1200px] mx-auto w-full overflow-y-auto lg:overflow-hidden no-scrollbar">
        
        {/* Header - Minimal Inline */}
        <header className="flex items-center justify-between mb-4 shrink-0 px-1">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-[#3a1224] tracking-tight">
              Organizer Hub
            </h1>
          </div>
          
          {isApproved && (
            <button
              onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW)}
              className="h-9 px-4 bg-[#3a1224] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider hover:shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-[#C0A04C]" /> <span className="hidden sm:inline">New Event</span><span className="sm:hidden">New</span>
            </button>
          )}
        </header>

        {/* Status Area - Ultra Slim */}
        {!isApproved && (
          <div className="mb-4 shrink-0">
            <div className="bg-white rounded-2xl border border-[#3a1224]/5 p-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${statusTone(statusValue)}`}>
                      {statusValue === 'pending' ? 'Reviewing' : 'Required'}
                    </div>
                    {status?.organizerRequestedAt && (
                      <span className="text-[8px] font-bold text-[#3a1224]/20 uppercase">
                        {formatDate(status.organizerRequestedAt)}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-[#3a1224]">Verification Status</h2>
                  <p className="text-[#3a1224]/50 text-[11px] leading-snug">
                    {statusValue === "pending"
                      ? "Your application is being reviewed. Active status granted within 24-48 hours."
                      : "Verify your profile to unlock hosting tools."}
                  </p>
                </div>

                {statusValue === 'pending' && (
                  <div className="bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg p-3 md:w-64 shrink-0">
                    <p className="text-[8px] font-bold text-[#3a1224]/30 uppercase mb-1 tracking-widest md:text-right">Note</p>
                    <p className="text-[11px] text-[#3a1224]/70 italic leading-snug md:text-right line-clamp-2">
                       "{status?.organizerNote || "No note provided"}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0">
          
          {/* Main Panel */}
          <div className="order-2 lg:order-1 lg:col-span-8 flex flex-col min-h-0">
            {isApproved ? (
              <div className="flex flex-col h-full gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                  {[
                    { label: "Bookings", val: stats.eligibleBookings },
                    { label: "Total", val: stats.total },
                    { label: "Live", val: stats.published },
                    { label: "Draft", val: stats.draft }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-3 border border-[#3a1224]/5 shadow-sm">
                       <p className="text-[8px] font-black text-[#3a1224]/20 uppercase tracking-widest">{stat.label}</p>
                       <p className="text-lg font-bold text-[#3a1224]">{dashboardLoading ? "..." : stat.val}</p>
                    </div>
                  ))}
                </div>

                <section className="flex-1 bg-white rounded-2xl border border-[#3a1224]/5 p-5 shadow-sm flex flex-col min-h-0">
                   <div className="flex items-center justify-between mb-4 shrink-0">
                      <h3 className="text-sm font-bold text-[#3a1224] uppercase tracking-widest">Productions</h3>
                      <button 
                        onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)}
                        className="text-[9px] font-bold text-[#3a1224]/40 uppercase"
                      >
                         View All
                      </button>
                   </div>
                   <div className="flex-1 lg:overflow-y-auto no-scrollbar">
                     {recentEvents.length === 0 ? (
                       <div className="h-full min-h-[100px] flex items-center justify-center opacity-20 text-[10px] uppercase font-bold tracking-widest">Empty State</div>
                     ) : (
                       <div className="space-y-2">
                          {recentEvents.map((event) => (
                             <div key={event._id} className="flex items-center justify-between p-3 bg-[#fdfaf6] hover:bg-white rounded-xl border border-transparent hover:border-[#3a1224]/5 transition-all group">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm"><Calendar className="w-4 h-4 text-[#C0A04C]" /></div>
                                   <div>
                                      <h4 className="font-bold text-xs text-[#3a1224] truncate max-w-[120px] sm:max-w-none">{event.name}</h4>
                                      <p className="text-[8px] text-[#3a1224]/40 uppercase font-black">{event.status} • {formatDate(event.startDateTime)}</p>
                                   </div>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-[#C0A04C]" />
                             </div>
                          ))}
                       </div>
                     )}
                   </div>
                </section>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center bg-white rounded-2xl border border-[#3a1224]/5 p-6 lg:p-8 relative overflow-hidden min-h-[180px]">
                 <div className="z-10 max-w-sm">
                    <h3 className="text-lg lg:text-xl font-bold text-[#3a1224] mb-2 uppercase tracking-wide">Enterprise Suite</h3>
                    <p className="text-[11px] text-[#3a1224]/40 leading-relaxed mb-6">Verification unlocks bulk ticket engines, real-time entry scanning, and audience intelligence.</p>
                    <div className="flex flex-wrap gap-2">
                       {["Scanning", "Payouts", "Guestlist"].map((t) => (
                         <span key={t} className="px-2 py-1 bg-[#fdfaf6] rounded text-[8px] font-black uppercase text-[#3a1224]/30">{t}</span>
                       ))}
                    </div>
                 </div>
                 <ShieldCheck className="absolute -bottom-4 -right-4 w-32 h-32 opacity-[0.03] text-[#3a1224]" />
              </div>
            )}
          </div>

          {/* Sidebar - Compacted */}
          <div className="order-1 lg:order-2 lg:col-span-4 flex flex-col min-h-0">
             <section className="bg-white rounded-2xl border border-[#3a1224]/5 p-5 shadow-sm h-full flex flex-col">
                <h4 className="text-[9px] font-black text-[#3a1224]/20 uppercase tracking-widest mb-4">Account Guard</h4>
                
                {!isApproved && statusValue !== 'pending' ? (
                  <div className="flex-1 flex flex-col gap-3">
                     <p className="text-[11px] text-[#3a1224]/50 leading-relaxed">Tell us about your upcoming event plans.</p>
                     <textarea
                       value={note}
                       onChange={(e) => setNote(e.target.value)}
                       rows={3}
                       className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl p-3 text-xs outline-none"
                       placeholder="..."
                     />
                     <button onClick={submitRequest} className="w-full h-10 bg-[#3a1224] text-white rounded-lg font-bold text-[10px] uppercase">Submit</button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-4 lg:py-0">
                     <div className="w-10 h-10 bg-[#C0A04C]/5 rounded-xl flex items-center justify-center mb-3">
                        <ShieldCheck className="w-5 h-5 text-[#C0A04C]" />
                     </div>
                     <p className="text-xs font-bold text-[#3a1224]">Verified Account</p>
                     <p className="text-[9px] text-[#3a1224]/30 uppercase tracking-tighter mt-1">Management modules active</p>
                  </div>
                )}
                <div className="mt-4 lg:mt-auto pt-4 border-t border-[#3a1224]/5 flex items-center gap-2 opacity-30">
                   <Clock className="w-3 h-3" />
                   <span className="text-[8px] font-black uppercase">Priority Service Enabled</span>
                </div>
             </section>
          </div>
        </div>
      </main>
    </div>
  );
}
         