"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import { ROUTES } from "config/routes";
import AdminSidebar from "components/admin/dashboard/AdminSidebar";
import { useAuth } from "contexts/AuthProvider";

function buildNavItems(pathname) {
  const base = [
    { key: "dashboard", label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
    { key: "bookings", label: "Bookings", href: ROUTES.ADMIN.BOOKINGS },
    { key: "menus", label: "Menus & Services", href: ROUTES.ADMIN.MENUS },
    { key: "halls", label: "Halls", href: ROUTES.ADMIN.HALLS },
    { key: "users", label: "Users", href: ROUTES.ADMIN.USERS },
    { key: "reports", label: "Reports", href: ROUTES.ADMIN.REPORTS },
    { key: "settings", label: "Settings", href: ROUTES.ADMIN.SETTINGS },
  ];

  return base.map((item) => {
    const isActive = pathname === item.href;
    return { ...item, active: isActive };
  });
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const profile = useAuth().user || {};

  const navItems = useMemo(() => buildNavItems(pathname || ""), [pathname]);

  return (
    <div className="min-h-screen bg-[var(--admin-bg)] text-white flex overflow-hidden">
      <AdminSidebar navItems={navItems} profile={profile} />

      <div className="flex-1 flex flex-col overflow-hidden ml-64">
        {children}
      </div>
    </div>
  );
}
