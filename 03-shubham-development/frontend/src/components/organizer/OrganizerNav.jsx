"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutGrid, 
  CalendarCheck, 
  PlusCircle, 
  ChevronRight, 
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { ROUTES } from "config/routes";
import axiosInstance from "lib/axios";
import toast from "react-hot-toast";

const navItems = [
  { label: "Dashboard", href: ROUTES.SITE.ORGANIZER, icon: LayoutGrid },
  { label: "My Events", href: ROUTES.SITE.ORGANIZER_EVENTS, icon: CalendarCheck },
  { label: "Create New Event", href: ROUTES.SITE.ORGANIZER_EVENT_NEW, icon: PlusCircle },
];

function statusTone(status) {
  switch (status) {
    case "approved":
      return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    case "pending":
      return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    case "rejected":
      return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    default:
      return "text-[#3a1224]/40 bg-[#3a1224]/5 border-[#3a1224]/10";
  }
}

export default function OrganizerNav({ user }) {
  const pathname = usePathname();
  const [status, setStatus] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchStatus() {
      try {
        const res = await axiosInstance.get(ROUTES.API.ORGANIZER_REQUESTS.ME);
        if (!ignore) setStatus(res.data || null);
      } catch (err) {
        if (!ignore) setStatus(null);
      }
    }
    if (user) fetchStatus();
    return () => {
      ignore = true;
    };
  }, [user]);

  const statusValue = String(status?.organizerStatus || (user?.isOrganizerEligible ? "approved" : user?.organizerStatus || "none")).toLowerCase();
  const isApproved = status?.isOrganizerEligible || statusValue === "approved" || user?.isOrganizerEligible;
  const statusLabel = isApproved ? "approved" : statusValue;

  return (
    <>
      {/* Mobile Sticky Bar - Compact & Meaningful */}
      <div className="lg:hidden w-full bg-[#3a1224] h-14 px-5 flex items-center justify-between border-b border-white/5 sticky top-0 z-50">
        <Link 
          href={ROUTES.SITE.PROFILE}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#C0A04C] group-hover:bg-[#C0A04C] group-hover:text-[#3a1224] transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-white font-black text-[9px] uppercase tracking-[0.2em]">Exit</span>
        </Link>
        
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-[#C0A04C] active:scale-95 transition-all outline-none"
        >
          {isMobileMenuOpen ? <LayoutGrid className="w-5 h-5 rotate-45 transition-transform" /> : <LayoutGrid className="w-5 h-5 transition-transform" />}
        </button>
      </div>

      {/* Sidebar - Desktop Layout / Mobile Overlay */}
      <aside className={`
        fixed inset-0 z-50 lg:relative lg:translate-x-0 transition-transform duration-500 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-[80%] sm:w-80 lg:w-80 h-full lg:h-screen bg-[#3a1224] flex flex-col shrink-0 overflow-x-hidden
      `}>
        {/* Mobile Header for Sidebar - Ensures Back Button is visible */}
        <div className="lg:hidden flex items-center justify-between px-6 py-8 border-b border-white/5 bg-[#3a1224] relative z-[60]">
          <Link 
            href={ROUTES.SITE.PROFILE}
            className="group flex items-center gap-3 text-[#C0A04C] hover:text-white transition-all py-2"
          >
            <div className="w-10 h-10 rounded-full bg-[#C0A04C]/10 flex items-center justify-center group-hover:bg-[#C0A04C] group-hover:text-[#3a1224] transition-all shrink-0 shadow-lg shadow-black/20">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-[12px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Exit to Profile</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="w-10 h-10 flex items-center justify-center text-white/40 active:scale-95 transition-all bg-white/5 rounded-full"
          >
            <LayoutGrid className="w-5 h-5 rotate-45" />
          </button>
        </div>

        {/* Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
           <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="relative flex flex-col h-full px-6 sm:px-8 lg:px-10 py-8 lg:py-12 overflow-y-auto no-scrollbar">
          {/* Desktop Navigation Control */}
          <Link 
            href={ROUTES.SITE.PROFILE}
            className="hidden lg:flex group items-center gap-3 mb-8 lg:mb-12 text-[#C0A04C] hover:text-white transition-all duration-500"
          >
            <div className="w-8 h-8 rounded-full bg-[#C0A04C]/10 flex items-center justify-center group-hover:bg-[#C0A04C] group-hover:text-[#3a1224] transition-all duration-500 shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Exit to Profile</span>
          </Link>

          {/* Profile Card */}
          <div className="relative group mb-8 lg:mb-10 min-w-0">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#C0A04C]/20 to-transparent rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-1000" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-4 lg:mb-6">
                 <div className="w-8 sm:w-10 h-[1px] bg-[#C0A04C]/40 shrink-0" />
                 <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em] whitespace-nowrap">Organizer Profile</span>
              </div>
              
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest mb-4 lg:mb-6 ${statusTone(statusLabel)} whitespace-nowrap shrink-0`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusLabel === 'approved' ? 'bg-emerald-500' : statusLabel === 'pending' ? 'bg-amber-500' : 'bg-[#3a1224]/20'}`} />
                {statusLabel}
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 leading-tight break-words">
                {user?.first_name || user?.username || "Organizer"}
              </h2>
              <p className="text-white/40 text-xs font-medium tracking-wide truncate">
                {user?.email || "Level 1 Access"}
              </p>
            </div>
          </div>

          {/* Tactical Navigation */}
          <nav className="flex-1 space-y-2 min-w-0">
            {navItems.map((item) => {
              const isExact = pathname === item.href;
              const isSubPath = pathname?.startsWith(item.href + "/") && item.href !== ROUTES.SITE.ORGANIZER;
              const active = isExact || isSubPath;

              const isDashboard = item.href === ROUTES.SITE.ORGANIZER;
              const disabled = !isApproved && !isDashboard;
              const Icon = item.icon;
              
              const commonClasses = `flex items-center justify-between px-5 py-4 lg:px-6 lg:py-5 rounded-2xl lg:rounded-[2rem] transition-all duration-500`;

              if (disabled) {
                return (
                  <button 
                    key={item.href}
                    onClick={() => {
                      toast.error("Verification Required", { icon: '🔒' });
                      setIsMobileMenuOpen(false);
                    }}
                    className={`${commonClasses} w-full text-white/40 bg-white/[0.02] border border-white/5 transition-all duration-300`}
                  >
                    <div className="flex items-center gap-4 lg:gap-5">
                       <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center bg-white/5 border border-white/5">
                          <Icon className="w-4.5 h-4.5 lg:w-5 lg:h-5 text-white/10" />
                       </div>
                       <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                    </div>
                    <ShieldCheck className="w-3.5 h-3.5 text-white/10" />
                  </button>
                );
              }

              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`${commonClasses} group ${
                    active 
                      ? "bg-[#C0A04C] text-[#3a1224] shadow-lg shadow-[#C0A04C]/10" 
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-4 lg:gap-5">
                     <div className={`w-9 h-9 lg:w-10 lg:h-10 rounded-xl lg:rounded-2xl flex items-center justify-center transition-colors ${active ? "bg-[#3a1224]/20" : "bg-white/5 group-hover:bg-[#C0A04C]/30"}`}>
                        <Icon className={`w-4.5 h-4.5 lg:w-5 lg:h-5 ${active ? "text-[#3a1224]" : "text-white"}`} />
                     </div>
                     <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap">{item.label}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${active ? "translate-x-0" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1"} transition-all`} />
                </Link>
              );
            })}
          </nav>

          {/* System Footer Badge */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3 opacity-30">
             <ShieldCheck className="w-4 h-4 text-[#C0A04C]" />
             <span className="text-[8px] font-black text-white uppercase tracking-widest">Verified Module</span>
          </div>
        </div>
      </aside>

      {/* Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity"
        />
      )}
    </>
  );
}
