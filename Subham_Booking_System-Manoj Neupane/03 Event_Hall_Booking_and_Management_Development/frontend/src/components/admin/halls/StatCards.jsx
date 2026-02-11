import React from "react";

export default function StatCards({ stats }) {
  if (!stats?.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="relative overflow-hidden flex flex-col gap-1 rounded-xl p-6 bg-[var(--admin-surface)] border border-white/5 group hover:border-[var(--admin-primary)]/50 transition-colors shadow-lg"
        >
          <div className="absolute -right-4 -top-4 text-[var(--admin-primary)] opacity-20 group-hover:opacity-40 transition-opacity">
            <stat.icon className="size-16" />
          </div>
          <p className="text-[var(--admin-muted)] text-sm font-medium z-10">{stat.label}</p>
          <p className="text-white text-3xl font-bold z-10">{stat.value}</p>
          <div className="flex items-center gap-1 text-xs font-medium mt-2 z-10 text-[var(--admin-muted)]">{stat.hint}</div>
        </div>
      ))}
    </div>
  );
}
