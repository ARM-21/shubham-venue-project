'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from "components/navbar/Navbar.jsx";
import Footer from "components/footer/Footer.jsx";
import { Sparkles, MapPin, Phone } from "lucide-react";

export default function SiteLayout({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Pages where footer should NOT appear (minimal/critical flows)
  const noFooterPages = [
    '/search-availability',
    '/payment/verify',
    '/tickets',
    '/profile',
    '/auth'
  ];

  // Pages where navbar and footer should NOT appear (full-screen flows)
  const noNavbarPages = [
    '/auth/onboarding',
  ];

  // Check if current page should hide navbar/header
  const shouldHideNavbar = mounted && noNavbarPages.some(page => pathname.startsWith(page));

  // Check if current page should hide footer
  const shouldHideFooter = mounted && (noFooterPages.some(page => pathname.startsWith(page)) || shouldHideNavbar);

  // Ensure hydration match by only rendering conditional content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Premium Top Bar Concierge - Hidden during onboarding */}
      {!shouldHideNavbar && (
        <div className="w-full bg-[#3a1224] text-white/80 py-2.5 border-b border-white/10 relative z-50 overflow-x-hidden">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex justify-between items-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em]">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 hover:text-[#C0A04C] transition-colors cursor-default">
                <MapPin size={12} className="text-[#C0A04C]" />
                <span className="text-white/90">Waling, Syangja, Nepal</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 hover:text-[#C0A04C] transition-colors cursor-default">
                <Phone size={12} className="text-[#C0A04C]" />
                <span className="text-white/90">+977 9812345678</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[#C0A04C] animate-pulse">
                <Sparkles size={12} />
                <span>Royal Hospitality</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!shouldHideNavbar && <Navbar />}
      
      <main className="flex-1">{children}</main>
      
      {/* Footer only on primary pages */}
      {!shouldHideFooter && <Footer />}
    </div>
  );
}
