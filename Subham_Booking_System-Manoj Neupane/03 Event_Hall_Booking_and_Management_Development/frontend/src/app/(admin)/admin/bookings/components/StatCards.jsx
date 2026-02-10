import React from "react";

export default function StatCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-[var(--admin-surface)] p-6 rounded-xl border border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <stat.icon className="size-12 text-[var(--admin-primary)]" />
          </div>
          <p className="text-[var(--admin-muted)] font-medium mb-1">{stat.label}</p>
          <div className="flex items-end gap-3">
            <span className="text-4xl font-bold text-white">{stat.value}</span>
            {stat.badge ? (
              <span className="text-emerald-400 text-sm font-medium mb-1.5 flex items-center bg-emerald-900/30 px-2 py-0.5 rounded">
                {stat.badge}
              </span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
