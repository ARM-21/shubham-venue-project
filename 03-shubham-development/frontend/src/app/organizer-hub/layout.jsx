"use client";

import OrganizerNav from "components/organizer/OrganizerNav";
import { useAuth } from "contexts/AuthProvider";
import { redirect } from "next/navigation";
import { ROUTES } from "config/routes";
import { useEffect } from "react";

export default function OrganizerLayout({ children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      redirect(`${ROUTES.SITE.LOGIN}?callbackUrl=${ROUTES.SITE.ORGANIZER}`);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#3a1224] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#FDFCFB] overflow-x-hidden">
      {/* Navigation - Sticky on mobile via component, static sidebar on desktop */}
      <OrganizerNav user={user} />
      
      {/* Main Framework Content */}
      <main className="flex-1 w-full min-h-0 flex flex-col relative">
        {/* Subtle Global Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#3a1224]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#C0A04C]/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />
        </div>

        {/* Dynamic Page Content */}
        <div className="relative flex-1 p-3 sm:p-4 lg:p-6 xl:p-8">
          {children}
        </div>

        {/* Global Footer (Internal) */}
        <footer className="relative px-8 py-4 border-t border-[#3a1224]/5 hidden sm:flex items-center justify-between">
           <span className="text-[10px] font-black uppercase tracking-widest text-[#3a1224]/20 italic">Elite Series • Organizer Hub</span>
           <span className="text-[10px] font-black uppercase tracking-widest text-[#3a1224]/20 italic">SECURE SYSTEM v3.0</span>
        </footer>
      </main>
    </div>
  );
}
