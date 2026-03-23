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
      return "text-emerald-600 bg-emerald-50 border-emerald-100";
    case "pending":
      return "text-amber-600 bg-amber-50 border-amber-100";
    case "rejected":
      return "text-rose-600 bg-rose-50 border-rose-100";
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
    <div className="relative">
      {/* Header */}
      <header className="mb-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-[1px] bg-[#C0A04C]" />
          <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Command Center</span>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <h1 className="text-6xl lg:text-8xl font-display font-bold text-[#3a1224] mb-6 leading-[0.9]">
              Organizer <span className="text-[#C0A04C] italic font-serif">Hub</span>
            </h1>
            <p className="text-[#3a1224]/60 text-lg font-light leading-relaxed max-w-2xl">
              Orchestrate your events, manage bookings, and track your production portfolio from one command center.
            </p>
          </div>
          
          {isApproved && (
            <button
              onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW)}
              className="h-12 px-8 bg-[#3a1224] text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg hover:shadow-xl transition-all flex items-center gap-3 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Event
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Left Column: Status & Application */}
          <div className="xl:col-span-4 space-y-8">
            <section className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-b from-[#C0A04C]/10 to-transparent rounded-[2.5rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-[#3a1224]/5 p-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C0A04C]/[0.03] rounded-bl-[100px] pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-8">
                   <ShieldCheck className="w-4 h-4 text-[#C0A04C]" />
                   <span className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-[0.3em]">Credentials</span>
                </div>

                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6 ${statusTone(statusValue)}`}>
                  <span className={`w-2 h-2 rounded-full ${currentStatusConfig.dot} animate-pulse`} />
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none pt-0.5">{currentStatusConfig.label}</span>
                </div>

                <h2 className="text-3xl font-display font-bold text-[#3a1224] mb-4">Identity Status</h2>
                
                <div className="space-y-4 mb-10">
                  <p className="text-sm text-[#3a1224]/60 leading-relaxed">
                    {statusValue === "approved"
                      ? "Your producer credentials are active. You have full clearance to organize public and private events."
                      : statusValue === "pending"
                      ? "Our executive board is currently reviewing your application. Expect a response within 24-48 hours."
                      : statusValue === "rejected"
                      ? "Your recent application requires revisions. Please update your portfolio and resubmit for reconsideration."
                      : "Submit your professional portfolio to unlock event organization capabilities."}
                  </p>

                  {status?.organizerNote && statusValue !== "approved" && (
                    <div className="p-4 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-2xl">
                      <p className="text-[9px] font-black text-[#3a1224]/30 uppercase tracking-widest mb-2">Reviewer Feedback</p>
                      <p className="text-xs font-medium text-[#3a1224]/70 italic">"{status.organizerNote}"</p>
                    </div>
                  )}

                  {status?.organizerRequestedAt && statusValue !== "approved" && (
                    <div className="flex items-center gap-2 text-[10px] font-black text-[#3a1224]/30 uppercase tracking-widest pt-2">
                      <Clock className="w-3 h-3" /> Filed {formatDate(status.organizerRequestedAt)}
                    </div>
                  )}
                </div>

                {!isApproved && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest">Experience Portfolio</label>
                       <textarea
                         value={note}
                         onChange={(e) => setNote(e.target.value)}
                         rows={4}
                         className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#C0A04C]/50 transition-all outline-none text-[#3a1224] placeholder:text-[#3a1224]/20"
                         placeholder="Describe your event management experience..."
                         disabled={statusValue === "pending"}
                       />
                    </div>
                    
                    <button
                      onClick={submitRequest}
                      disabled={submitting || statusValue === "pending"}
                      className="w-full h-14 bg-[#3a1224] text-[#C0A04C] rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:shadow-[#3a1224]/20 disabled:opacity-50 transition-all active:scale-95"
                    >
                      {statusValue === "pending" ? "Awaiting Response" : submitting ? "Verifying..." : "Apply for Clearance"}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Quick Insights for Non-Approved */}
            {!isApproved && (
              <section className="p-10 bg-[#3a1224] rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-[-20px] right-[-20px] w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                 <h4 className="text-2xl font-display font-bold mb-6">Producer Perks</h4>
                 <ul className="space-y-4">
                    {[
                      { icon: Zap, text: "Convert bookings into events" },
                      { icon: Ticket, text: "Custom ticket tiering" },
                      { icon: Sparkles, text: "Native QR check-in tools" }
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-[#C0A04C] transition-colors">
                            <item.icon className="w-5 h-5 text-[#C0A04C]" />
                         </div>
                         <span className="text-sm text-white/70 font-medium tracking-tight">{item.text}</span>
                      </li>
                    ))}
                 </ul>
              </section>
            )}
          </div>

          {/* Right Column: Dashboard Data */}
          <div className="xl:col-span-8 flex flex-col gap-12">
            {isApproved ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Eligible Bookings", val: stats.eligibleBookings, icon: CalendarCheck },
                    { label: "Total Productions", val: stats.total, icon: LayoutDashboard },
                    { label: "Live Events", val: stats.published, icon: Zap },
                    { label: "Stored Drafts", val: stats.draft, icon: Clock }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[2rem] p-8 border border-[#3a1224]/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
                       <div className="w-12 h-12 bg-[#fdfaf6] rounded-2xl flex items-center justify-center mb-6 border border-[#3a1224]/5 group-hover:bg-[#3a1224] transition-colors">
                          <stat.icon className="w-6 h-6 text-[#C0A04C]" />
                       </div>
                       <p className="text-[10px] font-black text-[#3a1224]/30 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                       <p className="text-4xl font-display font-bold text-[#3a1224]">{dashboardLoading ? "–" : stat.val}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Events Section */}
                <section className="bg-white rounded-[3rem] shadow-[0_20px_50px_rgba(58,18,36,0.06)] border border-[#3a1224]/5 p-10 overflow-hidden relative">
                   <div className="flex items-center justify-between mb-12">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-[2px] bg-[#C0A04C] rounded-full" />
                          <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Chronology</span>
                        </div>
                        <h3 className="text-4xl font-display font-bold text-[#3a1224] tracking-tight">Recent Production</h3>
                      </div>
                      <button 
                        onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)}
                        className="group flex items-center gap-3 text-[#3a1224] text-[10px] font-black uppercase tracking-widest hover:text-[#C0A04C] transition-colors pt-4"
                      >
                         Archival View <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                      </button>
                   </div>

                   {dashboardLoading ? (
                     <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-24 bg-[#fdfaf6] animate-pulse rounded-2xl" />)}
                     </div>
                   ) : recentEvents.length === 0 ? (
                     <div className="py-20 flex flex-col items-center justify-center text-center bg-[#fdfaf6] rounded-[2rem] border border-dashed border-[#3a1224]/10">
                        <p className="text-sm font-medium text-[#3a1224]/40 mb-6 italic">No active productions found in the registry.</p>
                        <button 
                          onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW)}
                          className="h-12 px-8 border-2 border-[#3a1224] text-[#3a1224] rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-[#3a1224] hover:text-white transition-all"
                        >
                           Initialize First Event
                        </button>
                     </div>
                   ) : (
                     <div className="space-y-4">
                        {recentEvents.map((event, idx) => (
                           <motion.div 
                             key={event._id}
                             initial={{ opacity: 0, x: -20 }}
                             animate={{ opacity: 1, x: 0 }}
                             transition={{ delay: idx * 0.1 }}
                             className="group/item flex flex-wrap items-center justify-between gap-6 p-6 bg-[#fdfaf6] hover:bg-white rounded-[2rem] border border-transparent hover:border-[#3a1224]/5 hover:shadow-xl transition-all duration-500"
                           >
                              <div className="flex items-center gap-6">
                                 <div className="w-16 h-16 bg-[#3a1224] rounded-2xl flex items-center justify-center shadow-lg group-hover/item:bg-[#C0A04C] transition-colors">
                                    <Calendar className="w-8 h-8 text-white" />
                                 </div>
                                 <div>
                                    <h4 className="text-xl font-display font-bold text-[#3a1224] mb-1">{event.name}</h4>
                                    <div className="flex items-center gap-3 text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest">
                                       <span>{event.type || "Event"}</span>
                                       <span className="w-1 h-1 bg-[#C0A04C] rounded-full" />
                                       <span>{event.isPublic ? "Public" : "Private"} Distribution</span>
                                    </div>
                                 </div>
                              </div>
                              
                              <div className="flex items-center gap-12">
                                 <div className="hidden sm:block text-right">
                                    <p className="text-[9px] font-black text-[#3a1224]/30 uppercase tracking-widest mb-1">Entry State</p>
                                    <span className="text-[11px] font-bold text-[#3a1224]">{event.status}</span>
                                 </div>
                                 <div className="hidden sm:block text-right">
                                    <p className="text-[9px] font-black text-[#3a1224]/30 uppercase tracking-widest mb-1">Scheduled Date</p>
                                    <span className="text-[11px] font-bold text-[#3a1224]">{event.startDateTime ? formatDate(event.startDateTime) : "Not Set"}</span>
                                 </div>
                                 <button
                                   onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_DETAIL(event._id))}
                                   className="h-12 w-12 rounded-2xl bg-white border border-[#3a1224]/10 flex items-center justify-center text-[#3a1224] hover:bg-[#3a1224] hover:text-white transition-all shadow-sm active:scale-90"
                                 >
                                    <ArrowRight className="w-5 h-5" />
                                 </button>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                   )}
                </section>

                {/* Tactical Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
                  {[
                    { title: "Production Logic", desc: "Launch new experiences using verified venue bookings.", icon: CalendarCheck },
                    { title: "Distribution Control", desc: "Configure ticket hierarchies and capacity limits.", icon: ClipboardList },
                    { title: "Gateway Access", desc: "Native authentication for guests via QR technology.", icon: Sparkles }
                  ].map((feat, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-[#3a1224]/5 shadow-sm group hover:bg-[#3a1224] transition-all duration-700">
                       <div className="w-12 h-12 bg-[#fdfaf6] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                          <feat.icon className="w-6 h-6 text-[#C0A04C]" />
                       </div>
                       <h4 className="text-xl font-display font-bold text-[#3a1224] mb-3 group-hover:text-white transition-colors tracking-tight">{feat.title}</h4>
                       <p className="text-sm text-[#3a1224]/50 group-hover:text-white/60 leading-relaxed transition-colors">{feat.desc}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              {/* Informational View for non-approved users */}
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[3rem] shadow-sm border border-[#3a1224]/5 p-12 text-center">
                 <div className="w-32 h-32 bg-[#3a1224]/5 rounded-full flex items-center justify-center mb-10 relative">
                    <LayoutDashboard className="w-12 h-12 text-[#3a1224]/20" />
                    <div className="absolute top-0 right-0 w-10 h-10 bg-[#C0A04C] rounded-2xl flex items-center justify-center border-4 border-white shadow-lg rotate-12">
                       <ShieldCheck className="w-5 h-5 text-[#3a1224]" />
                    </div>
                 </div>
                 <h3 className="text-4xl font-display font-bold text-[#3a1224] mb-4">Access Restricted</h3>
                 <p className="text-lg text-[#3a1224]/50 max-w-lg mb-10 leading-relaxed">
                    Your organizer account is pending approval. Once verified, you'll unlock the full event management dashboard.
                 </p>
                 <div className="flex flex-wrap justify-center gap-4">
                    <div className="px-6 py-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#3a1224]/40 flex items-center gap-3">
                       <Zap className="w-4 h-4 text-[#C0A04C]" /> Event Creation
                    </div>
                    <div className="px-6 py-3 bg-[#fdfaf6] border border-[#3a1224]/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-[#3a1224]/40 flex items-center gap-3">
                       <Ticket className="w-4 h-4 text-[#C0A04C]" /> Ticket Management
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

