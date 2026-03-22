"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "contexts/AuthProvider";
import { ROUTES } from "config/routes";
import OrganizerNav from "components/organizer/OrganizerNav";

export default function OrganizerLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const target = pathname || ROUTES.SITE.ORGANIZER;
      router.replace(`${ROUTES.AUTH.ROOT}?redirect=${encodeURIComponent(target)}`);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#8B0000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf6]">
      <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row min-h-screen">
        <OrganizerNav user={user} />
        <section className="flex-1 px-6 sm:px-10 py-12 lg:py-20 overflow-hidden">{children}</section>
      </div>
    </div>
  );
}
