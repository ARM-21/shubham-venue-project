import Link from "next/link";
import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  GaugeCircle,
  Settings,
  Users,
  Building2,
  UtensilsCrossed,
  Shield,
  ChevronDown,
} from "lucide-react";

const iconMap = {
  dashboard: GaugeCircle,
  bookings: CalendarDays,
  menus: UtensilsCrossed,
  halls: Building2,
  users: Users,
  reports: BarChart3,
  settings: Settings,
  governance: Shield,
};

export default function AdminSidebar({ navItems = [], profile }) {
  const [expandedMenu, setExpandedMenu] = useState(null);

  return (
    <aside className="w-64 top-0 left-0 h-screen fixed bg-[var(--admin-surface-strong)] border-r border-[#3a1a1a] flex flex-col flex-shrink-0 text-white overflow-y-auto z-50">
      <div className="p-6 flex items-center gap-3 border-b border-[#3a1a1a]">
        <div className="p-2 rounded-lg bg-[var(--admin-primary)]/20">
          <div
            className="size-8 rounded-full bg-center bg-no-repeat bg-cover"
            aria-label="shubham logo"
            style={{
              backgroundImage:
                "url('/assets/business-icons/video.gif')",
                height: "35px",
                width: "35px",
            }}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold leading-tight">Event Manager</span>
          <span className="text-xs text-[var(--admin-muted)]">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto ">
        {navItems.map((item) => {
          const Icon = iconMap[item.key] ?? GaugeCircle;
          const isExpanded = expandedMenu === item.key;
          const hasSubmenu = item.submenu && item.submenu.length > 0;
          const activeClasses = item.active
            ? "bg-[var(--admin-primary)] text-white shadow-lg shadow-[var(--admin-primary)]/20"
            : "text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-surface)]";

          return (
            <div key={item.key}>
              {hasSubmenu ? (
                <button
                  onClick={() =>
                    setExpandedMenu(isExpanded ? null : item.key)
                  }
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${activeClasses}`}
                >
                  <Icon className="size-5" strokeWidth={2.4} />
                  <span className="text-sm font-medium flex-1 text-left">
                    {item.label}
                  </span>
                  <ChevronDown
                    className={`size-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <Link
                  href={item.href ?? "#"}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${activeClasses}`}
                >
                  <Icon className="size-5" strokeWidth={2.4} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )}

              {/* Submenu items */}
              {hasSubmenu && isExpanded && (
                <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-[#3a1a1a] pl-3">
                  {item.submenu.map((subitem) => {
                    const subActiveClasses = subitem.active
                      ? "bg-[var(--admin-primary)]/20 text-[var(--admin-primary)] border-l-2 border-[var(--admin-primary)]"
                      : "text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-surface)]";

                    return (
                      <Link
                        key={subitem.key}
                        href={subitem.href ?? "#"}
                        className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-medium transition-colors ${subActiveClasses}`}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {subitem.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#3a1a1a]">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[var(--admin-surface)] border border-[#3a1a1a]">
          <div
            className="size-9 rounded-full bg-center bg-cover bg-no-repeat border border-[var(--admin-primary)]/40"
            style={{
              backgroundImage: profile?.profilePicture
                ? `url(${profile.profilePicture})`
                : "linear-gradient(135deg, var(--admin-primary) 0%, #4a1d1d 100%)",
            }}
            aria-label="Admin avatar"
          />
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate">{profile?.username}</span>
            <span className="text-xs text-[var(--admin-muted)] truncate">{profile?.email}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
