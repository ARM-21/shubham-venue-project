import React from 'react';

export default function StatCards({ cards }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const badgeColor =
          card.badgeTone === "positive"
            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
            : card.badgeTone === "warning"
              ? "bg-amber-500/15 text-amber-200 border-amber-500/30"
              : "bg-white/10 text-white border-white/10";

        return (
          <div
            key={card.id}
            className="relative overflow-hidden bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-xl p-5 shadow-lg shadow-black/20"
          >
            <div className="absolute right-3 top-3 opacity-20">
              <Icon className="size-10 text-[var(--admin-primary)]" />
            </div>
            <p className="text-sm text-[var(--admin-muted)] mb-1 font-medium">{card.title}</p>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-bold text-white">{card.value}</h3>
              {card.badge ? (
                <span className={`text-xs font-semibold px-2 py-1 rounded border ${badgeColor}`}>
                  {card.badge}
                </span>
              ) : null}
            </div>
            {card.subtitle ? (
              <p className="text-xs text-[var(--admin-muted)] mt-1">{card.subtitle}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
