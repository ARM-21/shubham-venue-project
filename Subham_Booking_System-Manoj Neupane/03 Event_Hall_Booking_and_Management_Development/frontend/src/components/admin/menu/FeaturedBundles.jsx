"use client";

import React, { useState } from 'react';
import { MoreHorizontal, Plus } from 'lucide-react';

export default function FeaturedBundles({ menus, loading, onEdit, onToggleStatus, onView, onDelete, onDuplicate, onAddBundle }) {
  const [openMenuId, setOpenMenuId] = useState(null);
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Featured Bundles</h3>
        <span className="text-[var(--admin-muted)] text-sm">{menus.length} total</span>
      </div>

      {loading ? (
        <p className="text-[var(--admin-muted)]">Loading menus...</p>
      ) : menus.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menus.map((bundle) => {
            const id = bundle._id || bundle.id;
            const price = typeof bundle.pricePerPerson === "number" ? new Intl.NumberFormat("en-NP", { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(bundle.pricePerPerson) : "N/A";
            const active = bundle.isActive !== false;
            const banner = bundle.isCustomMenu ? "Custom" : "";

            return (
              <article key={id} className="bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-xl overflow-visible shadow-lg shadow-black/20 hover:shadow-[var(--admin-primary)]/20 transition-all">
                <div className="h-44 bg-cover bg-center relative" style={{ backgroundImage: `url(${bundle.heroImage || "/assets/business-images/hero.jpg"})` }} aria-label={bundle.name}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  {banner ? <span className="absolute top-3 right-3 bg-white/15 backdrop-blur px-2 py-1 rounded text-[11px] font-semibold text-white border border-white/20">{banner}</span> : null}
                  <div className="absolute bottom-3 left-3 space-y-0.5">
                    <h4 className="text-white font-semibold text-lg leading-tight drop-shadow">{bundle.name}</h4>
                    <p className="text-white/80 text-xs line-clamp-1">{bundle.description || ""}</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-white text-2xl font-bold">
                      {price}
                      <span className="text-sm text-[var(--admin-muted)] font-normal">/head</span>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" className="peer sr-only" checked={active} onChange={() => onToggleStatus(id, active)} />
                      <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:bg-[var(--admin-primary)] transition-colors" />
                      <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                    </label>
                  </div>
                  <p className="text-[var(--admin-muted)] text-xs leading-relaxed line-clamp-2">{(bundle.sections || []).length} sections • {bundle.dishCount ?? 0} dishes</p>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-[var(--admin-bg)] text-white text-xs font-semibold hover:bg-[var(--admin-primary)] transition-colors border border-[#3a1a1a]" type="button" onClick={() => onEdit(bundle)}>Edit details</button>
                    <div className="relative" data-menu-actions>
                      <button className="p-2 rounded-lg bg-[var(--admin-surface-strong)] text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-primary)]/20 border border-[#3a1a1a]" type="button" aria-label="More options" onClick={() => setOpenMenuId((cur) => (cur === id ? null : id))}>
                        <MoreHorizontal className="size-4" />
                      </button>

                      {openMenuId === id ? (
                        <div className="absolute right-0 mt-2 w-40 bg-[var(--admin-surface)] border border-[#3a1a1a] rounded shadow-lg z-50">
                          <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[var(--admin-bg)]" type="button" onClick={() => { setOpenMenuId(null); onView(bundle); }}>View</button>
                          <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[var(--admin-bg)]" type="button" onClick={() => { setOpenMenuId(null); onDelete(id); }}>Delete</button>
                          <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[var(--admin-bg)]" type="button" onClick={() => { setOpenMenuId(null); onDuplicate(id); }}>Duplicate</button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          <button type="button" onClick={onAddBundle} className="bg-[var(--admin-bg)] border border-dashed border-[#3a1a1a] rounded-xl flex flex-col items-center justify-center p-6 hover:border-[var(--admin-primary)] hover:text-white transition-all text-[var(--admin-muted)]">
            <div className="size-14 rounded-full bg-[var(--admin-surface)] flex items-center justify-center mb-3 text-white/70">
              <Plus className="size-6" />
            </div>
            <span className="text-white font-semibold">Create new bundle</span>
            <p className="text-[11px] text-[var(--admin-muted)] mt-1">Set up a custom package</p>
          </button>
        </div>
      ) : (
        <p className="text-[var(--admin-muted)]">No menus found.</p>
      )}
    </section>
  );
}
