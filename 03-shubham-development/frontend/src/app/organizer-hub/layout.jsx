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
      redirect(`${ROUTES.AUTH.LOGIN}?callbackUrl=${ROUTES.SITE.ORGANIZER}`);
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
      <main className="flex-1 w-full min-h-0 flex flex-col relative lg:pt-20">
        {/* Dynamic Page Content */}
        <div className="relative flex-1 p-3 sm:p-4 lg:p-6 xl:p-8">
          {children}
        </div>

        {/* Global Footer (Internal) */}
        <footer className="relative px-8 py-4 border-t border-[#3a1224]/5 hidden sm:flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#3a1224]/30">Organizer Hub</p>
          <p className="text-xs text-[#3a1224]/25">&copy; {new Date().getFullYear()} Venue. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
