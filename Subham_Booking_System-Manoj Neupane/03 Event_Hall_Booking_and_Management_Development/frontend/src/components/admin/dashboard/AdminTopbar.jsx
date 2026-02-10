import { Bell, Search, UserRound } from "lucide-react";

export default function AdminTopbar({ heading }) {
  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 flex items-center justify-between px-6 lg:px-8 border-b border-[#3a1a1a] bg-[var(--admin-bg)]/90 backdrop-blur">
      <div className="flex items-center gap-3">
        {heading ? (
          <h2 className="text-white text-lg font-semibold tracking-tight hidden md:block">
            {heading}
          </h2>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--admin-muted)]" />
          <input
            type="search"
            placeholder="Search bookings, halls..."
            className="w-64 pl-10 pr-3 py-2 rounded-lg border-none bg-[var(--admin-surface)] text-white placeholder:text-[var(--admin-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)] focus:bg-[var(--admin-surface-strong)] text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-surface)] transition-colors">
            <Bell className="size-5" />
            <span className="absolute top-2 right-2 size-2 bg-[var(--admin-primary)] rounded-full border-2 border-[var(--admin-bg)]" />
          </button>
          <button className="p-2 rounded-lg text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-surface)] transition-colors">
            <UserRound className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
