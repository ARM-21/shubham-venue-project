'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from "components/navbar/Navbar.jsx";
import Footer from "components/footer/Footer.jsx";

export default function SiteLayout({ children }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Pages where footer should NOT appear (minimal/critical flows)
  const noFooterPages = [
    '/search-availability',
    '/payment/verify',
    '/tickets',
    '/profile',
    '/auth',
    '/menus/'
  ];

  // Pages where navbar and footer should NOT appear (full-screen flows)
  const noNavbarPages = [
    '/auth/onboarding',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/menus/'
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
    <div className="flex min-h-screen flex-col bg-white">
      {!shouldHideNavbar && (
        <div className="relative z-50 w-full overflow-x-hidden border-b border-white/10 bg-[#3a1224] py-2.5 text-white/80">
          <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-4 text-[10px] font-bold uppercase tracking-[0.2em] sm:gap-4 sm:px-6 sm:text-[11px]">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="flex cursor-default items-center gap-2">
                <span className="text-white/90">Waling, Syangja, Nepal</span>
              </div>
              <div className="hidden cursor-default items-center gap-2 sm:flex">
                <span className="text-white/90">+977 9812345678</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="rounded border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[9px] font-black text-[#C0A04C] sm:text-[10px]">
                UNDER DEVELOPMENT
              </span>
            </div>
          </div>
        </div>
      )}

      {!shouldHideNavbar && <Navbar />}
      
      <main className="flex-1">{children}</main>
      
      {!shouldHideFooter && <Footer />}
    </div>
  );
}
