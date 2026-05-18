"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "contexts/AuthProvider";
import { 
  LayoutGrid, 
  CalendarCheck, 
  PlusCircle, 
  ChevronRight, 
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Settings,
  BarChart3,
  User,
  ChevronDown
} from "lucide-react";
import { ROUTES } from "config/routes";
import axiosInstance from "lib/axios";
import toast from "react-hot-toast";

const navItems = [
  { label: "Dashboard", href: ROUTES.SITE.ORGANIZER, icon: LayoutGrid },
  { label: "My Events", href: ROUTES.SITE.ORGANIZER_EVENTS, icon: CalendarCheck },
  { label: "Analytics", href: "/organizer-hub/analytics", icon: BarChart3 },
  { label: "Create Event", href: ROUTES.SITE.ORGANIZER_EVENT_NEW, icon: PlusCircle },
];

function statusTone(status) {
  switch (status) {
    case "approved":
      return {
        badge: "text-emerald-700 bg-emerald-50 border-emerald-200 shadow-sm shadow-emerald-100",
        dot: "bg-emerald-500",
        label: "Active"
      };
    case "pending":
      return {
        badge: "text-amber-700 bg-amber-50 border-amber-200 shadow-sm shadow-amber-100",
        dot: "bg-amber-500",
        label: "Verification Pending"
      };
    case "rejected":
      return {
        badge: "text-rose-700 bg-rose-50 border-rose-200 shadow-sm shadow-rose-100",
        dot: "bg-rose-500",
        label: "Action Required"
      };
    default:
      return {
        badge: "text-[#3a1224]/60 bg-[#fbf8f2] border-[#e8dcc8]",
        dot: "bg-[#3a1224]/30",
        label: "Awaiting Verification"
      };
  }
}

export default function OrganizerNav({ user }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [status, setStatus] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

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

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isProfileMenuOpen]);

  const statusValue = String(status?.organizerStatus || (user?.isOrganizerEligible ? "approved" : user?.organizerStatus || "none")).toLowerCase();
  const isApproved = status?.isOrganizerEligible || statusValue === "approved" || user?.isOrganizerEligible;
  const statusInfo = statusTone(statusValue);

  const handleLogout = async () => {
    try {
      // Call logout API endpoint
      const response = await axiosInstance.post(ROUTES.API.AUTH.LOGOUT);
      
      // Clear auth context
      await logout();
      
      // Redirect to login
      router.push(ROUTES.AUTH.LOGIN);
      
      toast.success("Logged out successfully");
    } catch (err) {
      console.error('Logout error:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to logout';
      toast.error(errorMessage);
    }
  };

  const getInitials = (user) => {
    if (!user) return "?";
    const first = user.first_name?.[0] || "";
    const last = user.last_name?.[0] || "";
    return (first + last).toUpperCase() || "U";
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#e8dcc8] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo/Brand */}
          <Link 
            href={ROUTES.SITE.ORGANIZER}
            className="flex items-center gap-2 sm:gap-3 group flex-shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#3a1224] flex items-center justify-center">
              <LayoutGrid className="w-4 sm:w-5 h-4 sm:h-5 text-[#C0A04C]" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[9px] font-semibold text-[#3a1224]/40 uppercase tracking-wide">Producer Hub</p>
              <p className="text-xs font-black text-[#3a1224] leading-none">Dashboard</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isExact = pathname === item.href;
              let isSubPath = pathname?.startsWith(item.href + "/") && item.href !== ROUTES.SITE.ORGANIZER;
              
              if (item.label === "My Events" && pathname?.includes("/events/new")) {
                isSubPath = false;
              }
              
              const active = isExact || isSubPath;
              const Icon = item.icon;
              const disabled = !isApproved && item.href !== ROUTES.SITE.ORGANIZER;

              if (disabled) {
                return (
                  <button 
                    key={item.href}
                    onClick={() => toast.error("Complete verification to access")}
                    className="h-9 px-3 flex items-center gap-2 rounded-lg text-[#3a1224]/30 text-xs font-semibold uppercase tracking-wide transition-all opacity-50 cursor-not-allowed"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <Link 
                  key={item.href}
                  href={item.href}
                  className={`h-9 px-3 flex items-center gap-2 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
                    active
                      ? "bg-[#3a1224] text-white"
                      : "text-[#3a1224]/70 hover:bg-[#fbf8f2]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            {/* Status Badge - Desktop Only */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold uppercase tracking-wide ${statusInfo.badge}`}>
              <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
              <span className="hidden sm:inline">{statusInfo.label}</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg border border-[#e8dcc8] hover:bg-[#fbf8f2] text-[#3a1224]/60 transition-all"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* User Profile Menu */}
            <div ref={profileMenuRef} className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`h-9 sm:h-10 flex items-center gap-2 px-2 sm:px-3 rounded-lg border transition-all ${
                  isProfileMenuOpen
                    ? "border-[#C0A04C] bg-[#fbf8f2]"
                    : "border-[#e8dcc8] hover:bg-[#fbf8f2]"
                }`}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#3a1224] flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(user)}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-semibold text-[#3a1224] leading-none">{user?.first_name || "User"}</span>
                  <span className="text-[10px] text-[#3a1224]/40">Organizer</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-[#3a1224]/40 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e8dcc8] rounded-xl shadow-sm z-50 overflow-hidden">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-[#e8dcc8] bg-[#fbf8f2]">
                    <p className="text-sm font-semibold text-[#3a1224]">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-[#3a1224]/40">{user?.email}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/organizer-hub/settings"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3a1224]/70 hover:bg-[#fbf8f2] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-[#3a1224]/40" />
                      Settings & Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        router.push(ROUTES.SITE.PROFILE);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#3a1224]/70 hover:bg-[#fbf8f2] transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-[#3a1224]/40" />
                      View My Profile
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#e8dcc8]" />

                  {/* Logout */}
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-[#e8dcc8] bg-white">
            <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isExact = pathname === item.href;
                let isSubPath = pathname?.startsWith(item.href + "/") && item.href !== ROUTES.SITE.ORGANIZER;

                if (item.label === "My Events" && pathname?.includes("/events/new")) {
                  isSubPath = false;
                }

                const active = isExact || isSubPath;
                const Icon = item.icon;
                const disabled = !isApproved && item.href !== ROUTES.SITE.ORGANIZER;

                if (disabled) {
                  return (
                    <button
                      key={item.href}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        toast.error("Complete verification to access");
                      }}
                      className="w-full h-10 flex items-center gap-3 px-3 rounded-lg text-[#3a1224]/30 text-sm font-semibold transition-all opacity-50"
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
                    className={`w-full h-10 flex items-center gap-3 px-3 rounded-lg text-sm font-semibold transition-all ${
                      active
                        ? "bg-[#3a1224] text-white"
                        : "text-[#3a1224]/70 hover:bg-[#fbf8f2]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Status Badge */}
            <div className={`mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold uppercase tracking-wide ${statusInfo.badge}`}>
              <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </div>
          </div>
        )}
      </header>

      {/* Spacer */}
      <div className="h-16 sm:h-20" />
    </>
  );
}
