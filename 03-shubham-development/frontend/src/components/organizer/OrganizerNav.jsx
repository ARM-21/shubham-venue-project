"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutGrid, 
  CalendarCheck, 
  PlusCircle, 
  ChevronRight, 
  ShieldCheck,
  ArrowLeft,
  Menu,
  X
} from "lucide-react";
import { ROUTES } from "config/routes";
import axiosInstance from "lib/axios";
import toast from "react-hot-toast";

const navItems = [
  { label: "Dashboard", href: ROUTES.SITE.ORGANIZER, icon: LayoutGrid },
  { label: "My Events", href: ROUTES.SITE.ORGANIZER_EVENTS, icon: CalendarCheck },
  { label: "Create Event", href: ROUTES.SITE.ORGANIZER_EVENT_NEW, icon: PlusCircle },
];

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

export default function OrganizerNav({ user }) {
  const pathname = usePathname();
  const router = useRouter();
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

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-[#3a1224]/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          {/* Logo/Brand */}
          <Link 
            href={ROUTES.SITE.ORGANIZER}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3a1224] to-[#4a172d] flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-[#C0A04C]" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black text-[#3a1224]/40 uppercase tracking-widest">Organizer</p>
              <p className="text-[11px] font-bold text-[#3a1224]">Hub</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => {
              const isExact = pathname === item.href;
              const isSubPath = pathname?.startsWith(item.href + "/") && item.href !== ROUTES.SITE.ORGANIZER;
              const active = isExact || isSubPath;
              const Icon = item.icon;
              
              const disabled = !isApproved && item.href !== ROUTES.SITE.ORGANIZER;

              if (disabled) {
                return (
                  <button 
                    key={item.href}
                    onClick={() => toast.error("Verification Required", { icon: '🔒' })}
                    className="h-10 px-4 flex items-center gap-2 rounded-lg hover:bg-gray-100 text-[#3a1224]/40 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer opacity-50"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{item.label}</span>
                  </button>
                );
              }

              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`h-10 px-4 flex items-center gap-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                    active 
                      ? "bg-[#3a1224] text-white" 
                      : "hover:bg-gray-100 text-[#3a1224]"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Status Badge */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${statusTone(statusValue)}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {statusValue === "approved" ? "Active" : statusValue === "pending" ? "Pending" : "Awaiting"}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#3a1224] transition-all cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Exit Button */}
            <Link
              href={ROUTES.SITE.PROFILE}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-[#3a1224]/10 hover:bg-gray-50 text-[#3a1224] transition-all cursor-pointer"
              title="Back to Profile"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#3a1224]/5 bg-white/98 backdrop-blur-sm">
            <nav className="max-w-7xl mx-auto px-6 sm:px-8 py-4 space-y-2">
              {navItems.map((item) => {
                const isExact = pathname === item.href;
                const isSubPath = pathname?.startsWith(item.href + "/") && item.href !== ROUTES.SITE.ORGANIZER;
                const active = isExact || isSubPath;
                const Icon = item.icon;
                const disabled = !isApproved && item.href !== ROUTES.SITE.ORGANIZER;

                if (disabled) {
                  return (
                    <button 
                      key={item.href}
                      onClick={() => {
                        toast.error("Verification Required", { icon: '🔒' });
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full h-10 flex items-center gap-3 px-4 rounded-lg hover:bg-gray-50 text-[#3a1224]/40 text-[9px] font-black uppercase tracking-widest transition-all opacity-50"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                }

                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full h-10 flex items-center gap-3 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                      active 
                        ? "bg-[#3a1224] text-white" 
                        : "hover:bg-gray-100 text-[#3a1224]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-20" />
    </>
  );
}
