"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  Zap,
  Users,
  TrendingUp,
  Ticket,
  User,
  Fingerprint,
  Shield,
} from "lucide-react";
import { ROUTES } from "config/routes";
import { useAuth } from "contexts/AuthProvider";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import BreadcrumbNav from "components/organizer/BreadcrumbNav";
import { submitOrganizerRequestMutator } from "@api/organizer/organizer-request-submit-mutator";
import { useQueryOrganizerStatus } from "@queries/organizer/status";
import { useQueryOrganizerEvents } from "@queries/organizer/events";
import { useQueryOrganizerBookings } from "@queries/organizer/bookings";
import { useQueryOrganizerAnalytics } from "@queries/organizer/analytics";
import { useQueryOrganizerReputation } from "@queries/organizer/reputation";
import { OrganizerTrustScoreDashboard } from "components/organizer/TrustScoreDashboard";

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
  const queryClient = useQueryClient();
  const [note, setNote] = useState("");

  // React Query Hooks
  const { data: statusData, isLoading: statusLoading } = useQueryOrganizerStatus({
    enabled: !!user,
  });

  const { data: eventsData, isLoading: eventsLoading } = useQueryOrganizerEvents({
    enabled: !!statusData?.isOrganizerEligible,
  });

  const { data: bookingsData, isLoading: bookingsLoading } = useQueryOrganizerBookings({
    params: { eligibleForEvent: true },
    enabled: !!statusData?.isOrganizerEligible,
  });

  const { data: analyticsData, isLoading: analyticsLoading } = useQueryOrganizerAnalytics({
    enabled: !!statusData?.isOrganizerEligible,
  });

  const { data: reputationData, isLoading: reputationLoading } = useQueryOrganizerReputation({
    enabled: !!statusData?.isOrganizerEligible,
  });

  // Mutation - Written directly in page
  const submitRequestMutation = useMutation({
    mutationFn: submitOrganizerRequestMutator,
    onSuccess: (data) => {
      toast.success("Application submitted successfully!");
      setNote("");
      queryClient.invalidateQueries({ queryKey: ["organizer-status"] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to submit application");
    },
  });

  // Extract data from query results
  const status = statusData;
  const events = eventsData?.events || [];
  const eligibleBookings = bookingsData?.bookings || [];
  const analytics = analyticsData;
  const eventStats = analyticsData?.stats;
  const statusLoading_computed = statusLoading;
  const dashboardLoading = eventsLoading || bookingsLoading || analyticsLoading;

  const statusValue = String(status?.organizerStatus || (user?.isOrganizerEligible ? "approved" : user?.organizerStatus || "none")).toLowerCase();
  const isApproved = status?.isOrganizerEligible || statusValue === "approved" || user?.isOrganizerEligible;

  const stats = useMemo(() => {
    const total = events.length;
    const published = events.filter((e) => e.status === "PUBLISHED").length;
    const draft = events.filter((e) => e.status === "DRAFT").length;
    return { total, published, draft, eligibleBookings: eligibleBookings.length };
  }, [events, eligibleBookings]);

  async function submitRequest() {
    if (submitRequestMutation.isPending) return;
    submitRequestMutation.mutate({ note: note.trim() });
  }

  const recentEvents = events.slice(0, 3);
  const currentStatusConfig = statusConfig[statusValue] || statusConfig.none;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <main className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full overflow-y-auto">
        
        {/* Premium Header with Status Badge */}
        <div className="bg-gradient-to-r from-[#3a1224] via-[#4a172d] to-[#3a1224] text-white px-6 sm:px-8 py-12 sm:py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#C0A04C] rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative z-10 flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-[#C0A04C]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/70 uppercase tracking-wider">Welcome back</p>
                  <h1 className="text-3xl sm:text-4xl font-black text-white">Organizer Hub</h1>
                </div>
              </div>
              <p className="text-white/80 text-sm sm:text-base font-medium max-w-2xl">Manage your events, track attendees, and grow your business</p>
            </div>
            
            {isApproved && (
              <motion.button
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_NEW)}
                className="px-6 py-3 bg-[#C0A04C] text-[#3a1224] rounded-xl font-black text-sm uppercase tracking-wider hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5" /> Create Event
              </motion.button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-6 sm:px-8 py-12">
          {/* Status Card - Premium Style */}
          {!isApproved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mt-1 shrink-0">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-blue-900">Verification in Progress</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusTone(statusValue)}`}>
                      {statusValue === 'pending' ? 'Under Review' : 'Required'}
                    </span>
                  </div>
                  <p className="text-blue-800 text-sm mb-4">
                    {statusValue === "pending"
                      ? "Your application is being reviewed by our team. You'll gain full access within 24-48 hours."
                      : "Complete your verification to unlock all organizer features and boost your trust score."}
                  </p>
                  {statusValue === 'pending' && status?.organizerNote && (
                    <div className="bg-white/60 border-l-4 border-blue-500 p-4 rounded text-sm text-blue-900">
                      <p className="font-semibold text-blue-600 mb-1">Application Note:</p>
                      <p className="italic">"{status.organizerNote}"</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {isApproved ? (
            <div className="space-y-12">
              {/* KPI Cards - Professional Grid */}
              <div>
                <h2 className="text-2xl font-black text-[#3a1224] mb-6 flex items-center gap-2">
                  <Zap className="w-6 h-6 text-[#C0A04C]" />
                  Quick Stats
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: "Total Events", val: stats.total, icon: Calendar, color: "#3a1224", bgGradient: "from-blue-500/10 to-blue-600/5" },
                    { label: "Attendees", val: analytics?.stats?.totalAttendees || 0, icon: Users, color: "#C0A04C", bgGradient: "from-amber-500/10 to-amber-600/5" },
                    { label: "Check-in Rate", val: `${analytics?.stats?.checkInRate || 0}%`, icon: CheckCircle2, color: "#10b981", bgGradient: "from-emerald-500/10 to-emerald-600/5" },
                    { label: "Total Revenue", val: `$${(analytics?.stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: "#f59e0b", bgGradient: "from-amber-500/10 to-amber-600/5" }
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`bg-gradient-to-br ${stat.bgGradient} border border-slate-200 rounded-2xl p-6 hover:shadow-lg hover:border-slate-300 transition-all`}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">{stat.label}</p>
                            <p className="text-3xl font-black text-[#3a1224]">{dashboardLoading ? "..." : stat.val}</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                            <Icon size={24} style={{ color: stat.color }} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Trust Score Dashboard */}
              <div>
                <h2 className="text-2xl font-black text-[#3a1224] mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-[#C0A04C]" />
                  Trust & Reputation
                </h2>
                <OrganizerTrustScoreDashboard 
                  data={reputationData}
                  isLoading={reputationLoading}
                />
              </div>

              {/* Events & Analytics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Events */}
                <div className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-[#3a1224] flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-[#C0A04C]" />
                      Recent Events
                    </h2>
                    <button 
                      onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENTS)}
                      className="px-4 py-2 text-[#C0A04C] font-bold text-sm hover:bg-[#C0A04C]/10 rounded-lg transition-all flex items-center gap-2"
                    >
                      View All <ArrowRight size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {recentEvents.length === 0 ? (
                      <div className="h-48 flex items-center justify-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <div className="text-center">
                          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-slate-500 font-semibold">No events yet</p>
                          <p className="text-sm text-slate-400">Create your first event to get started</p>
                        </div>
                      </div>
                    ) : (
                      recentEvents.map((event) => (
                        <motion.div 
                          key={event._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-[#C0A04C]/30 transition-all cursor-pointer group"
                          onClick={() => router.push(ROUTES.SITE.ORGANIZER_EVENT_DETAIL(event._id))}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 bg-gradient-to-br from-[#C0A04C]/20 to-[#C0A04C]/10 rounded-lg flex items-center justify-center mt-1">
                                <Calendar className="w-6 h-6 text-[#C0A04C]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-[#3a1224] text-base mb-1 truncate">{event.name}</h4>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    event.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                                    event.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' :
                                    'bg-amber-100 text-amber-700'
                                  }`}>
                                    {event.status}
                                  </span>
                                  <span className="text-xs text-slate-500">{formatDate(event.startDateTime)}</span>
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-[#C0A04C] transition-colors" />
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>

                {/* Analytics Card */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
                  <div className="mb-8">
                    <h3 className="text-lg font-black uppercase tracking-wider mb-2">Performance</h3>
                    <p className="text-white/70 text-sm">Track detailed analytics</p>
                  </div>
                  
                  <div className="space-y-6 mb-8">
                    <div>
                      <p className="text-white/70 text-sm font-semibold mb-2">Approval Rate</p>
                      <p className="text-4xl font-black text-[#C0A04C]">{eventStats?.checkInRate || 0}%</p>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#C0A04C] to-yellow-400 transition-all duration-500" 
                        style={{ width: `${eventStats?.checkInRate || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/organizer-hub/analytics")}
                    className="w-full py-3 bg-[#C0A04C] text-[#3a1224] rounded-lg font-black text-sm uppercase tracking-wider hover:shadow-lg transition-all"
                  >
                    View Full Analytics
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Not Approved State */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                  <ShieldCheck className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                  <h3 className="text-2xl font-black text-[#3a1224] mb-3">Awaiting Verification</h3>
                  <p className="text-slate-600 max-w-md mx-auto text-base">
                    Once your account is verified, you'll get access to event management, analytics, ticket sales, and more.
                  </p>
                </div>
              </div>

              {/* Sidebar for Unapproved */}
              <div className="bg-white border border-slate-200 rounded-2xl p-8 h-fit">
                <h4 className="text-lg font-black text-[#3a1224] mb-4 flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-[#C0A04C]" />
                  Pending Features
                </h4>
                <ul className="space-y-3 mb-8">
                  {["Event Management", "Analytics Dashboard", "Ticket Sales", "Attendee Tracking", "Marketing Tools"].map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle2 className="w-5 h-5 text-slate-300" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={submitRequest}
                  disabled={submitRequestMutation.isPending || statusValue === 'pending'}
                  className="w-full py-3 bg-[#C0A04C] text-[#3a1224] rounded-lg font-black text-sm uppercase tracking-wider hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {statusValue === 'pending' ? 'Application Submitted' : 'Apply for Access'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
