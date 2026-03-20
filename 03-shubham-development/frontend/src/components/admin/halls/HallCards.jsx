import React from "react";
import { Building2, Eye, Users } from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function HallCards({ loading, hallCards, onEdit, onView }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        <div className="text-[var(--admin-muted)] col-span-full text-sm">Loading halls...</div>
      ) : !hallCards.length ? (
        <div className="text-[var(--admin-muted)] col-span-full text-sm">No halls found.</div>
      ) : (
        hallCards.map((hall) => (
          <div
            key={hall.id || hall.name}
            className="bg-[var(--admin-surface)] border border-white/5 rounded-2xl overflow-hidden group hover:shadow-xl hover:border-[var(--admin-primary)] transition-all duration-300 flex flex-col"
          >
            <div className="relative h-48 w-full overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                style={{ backgroundImage: `url(${hall.image})` }}
              />
              <div className="absolute top-3 right-3">
                <StatusBadge tone={hall.status.tone}>{hall.status.label}</StatusBadge>
              </div>
              <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white text-xs font-medium flex items-center gap-1">
                <span className="text-[var(--admin-primary)]">•</span>
                {hall.location}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1 gap-4">
              <div>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-white text-lg font-bold">{hall.name}</h3>
                  <p className="text-[var(--admin-primary)] font-bold text-lg">
                    {hall.price}
                    <span className="text-[var(--admin-muted)] text-xs font-normal">{hall.unit}</span>
                  </p>
                </div>
                <p className="text-[var(--admin-muted)] text-sm line-clamp-2">Elegant space suitable for events and corporate gatherings.</p>
              </div>
              <div className="flex items-center gap-4 py-2 border-t border-white/5">
                <div className="flex items-center gap-2 text-[var(--admin-muted)] text-sm">
                  <Users className="size-4" />
                  <span>{hall.capacity}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--admin-muted)] text-sm">
                  <Building2 className="size-4" />
                  <span>{hall.size}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {hall.amenities.map((a) => (
                  <span key={a} className="px-2 py-1 rounded bg-[var(--admin-bg)] border border-white/5 text-xs text-[var(--admin-muted)]">
                    {a}
                  </span>
                ))}
              </div>
              <div className="mt-auto flex gap-2 pt-2">
                <button
                  onClick={() => onEdit(hall.id)}
                  className="flex-1 bg-[var(--admin-bg)] hover:bg-white/5 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-white/10"
                >
                  Edit
                </button>
                <button
                  onClick={() => onView(hall.id)}
                  className="bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-dark)] text-white px-3 rounded-lg flex items-center justify-center transition-colors border border-[var(--admin-primary)]"
                >
                  <Eye className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
