"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutGrid, CalendarCheck, PlusCircle } from "lucide-react";
import { ROUTES } from "@/config/routes";
import axiosInstance from "@/lib/axios";

const navItems = [
  { label: "Organizer Hub", href: ROUTES.SITE.ORGANIZER, icon: LayoutGrid },
  { label: "My Events", href: ROUTES.SITE.ORGANIZER_EVENTS, icon: CalendarCheck },
  { label: "Create Event", href: ROUTES.SITE.ORGANIZER_EVENT_NEW, icon: PlusCircle },
];

function statusTone(status) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function OrganizerNav({ user }) {
  const pathname = usePathname();
  const [status, setStatus] = useState(null);

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

  const isOrganizer = Boolean(user?.isOrganizerEligible) || Boolean(status?.isOrganizerEligible) || user?.role?.toLowerCase?.() === "admin";
  const rawStatus = String(status?.organizerStatus || user?.organizerStatus || "none").toLowerCase();
  const statusLabel = isOrganizer ? "approved" : rawStatus;

  return (
    <aside className="w-full lg:w-64">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm sticky top-24">
        <div className="pb-4 border-b border-gray-100">
          <p className="text-xs uppercase tracking-widest text-gray-500">Organizer Space</p>
          <h2 className="text-lg font-semibold text-gray-900 mt-1">{user?.first_name || user?.username || "Account"}</h2>
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold mt-3 ${statusTone(statusLabel)}`}>
            {statusLabel.toUpperCase()}
          </div>
        </div>

        <nav className="mt-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== ROUTES.SITE.ORGANIZER && pathname?.startsWith(item.href));
            const disabled = !isOrganizer && item.href !== ROUTES.SITE.ORGANIZER;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  active ? "bg-[#8B0000]/10 text-[#8B0000]" : "text-gray-600 hover:bg-gray-50"
                } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                aria-disabled={disabled}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {!isOrganizer && (
          <div className="mt-5 text-xs text-gray-500 leading-relaxed">
            Complete the organizer request to unlock event creation, tickets, and check-in tools.
          </div>
        )}
      </div>
    </aside>
  );
}
