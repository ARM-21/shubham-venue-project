"use client";

import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';

export default function MenuViewModal({ viewingMenu, closeViewModal, openFullMenuPage }) {
  if (!viewingMenu) return null;
  const [viewCategory, setViewCategory] = useState('all');

  const sectionsInView = viewingMenu.sections || [];
  const totalItems = sectionsInView.reduce((sum, s) => sum + (s.dishes?.length || 0), 0);
  const viewCategories = [
    { key: 'all', label: 'All Items', count: totalItems },
    ...sectionsInView.map((s, idx) => ({ key: String((s.section?.title || `section-${idx}`).trim().toLowerCase()), label: s.section?.title || `Section ${idx + 1}`, count: s.dishes?.length || 0 })),
  ];

  const filteredSections = viewCategory === 'all' ? sectionsInView : sectionsInView.filter((s, idx) => String((s.section?.title || `section-${idx}`).trim().toLowerCase()) === viewCategory);
  const visibleItems = filteredSections.reduce((sum, s) => sum + (s.dishes?.length || 0), 0);
  const badge = viewingMenu.isCustomMenu ? 'Premium Bundle' : 'Menu';
  const priceLabel = typeof viewingMenu.pricePerPerson === 'number' ? new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(viewingMenu.pricePerPerson) : 'N/A';
  const heroImage = viewingMenu.heroImage || '/assets/business-images/hero.jpg';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={closeViewModal} />
      <div className="relative z-50 w-full max-w-6xl h-[92vh] flex flex-col bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-3xl shadow-2xl overflow-hidden">
        <div className="relative h-64 sm:h-72 md:h-80 bg-black">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroImage})` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/15 text-white border border-white/25">{badge}</span>
                  <span className="text-[12px] text-white/80">{viewingMenu.slug || viewingMenu._id}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{viewingMenu.name}</h1>
                <p className="text-sm text-white/80">{priceLabel}<span className="text-xs text-white/70 font-normal"> / head</span> • {sectionsInView.length} sections • {totalItems} dishes</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${viewingMenu.isActive !== false ? 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/25' : 'bg-rose-500/10 text-rose-200 border border-rose-500/20'}`}>{viewingMenu.isActive !== false ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-lg border border-white/30 text-white/90 hover:text-white hover:border-white" type="button" onClick={() => openFullMenuPage(viewingMenu)}>Open full page</button>
                <button className="px-5 py-2 rounded-lg bg-[var(--admin-primary)] text-white font-semibold shadow shadow-[var(--admin-primary)]/30 hover:bg-[var(--admin-primary-dark)]" type="button">Select this menu</button>
                <button onClick={closeViewModal} className="size-10 rounded-full border border-white/30 text-white/80 hover:text-white hover:border-white/60 bg-black/30" aria-label="Close"><X className="size-5 mx-auto" /></button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-none px-6 pt-4 pb-2 bg-[var(--admin-surface)] border-b border-[#3a1a1a]">
          <div className="flex items-center gap-2 overflow-x-auto admin-scroll pb-2">
            {viewCategories.map((cat) => {
              const active = viewCategory === cat.key;
              return (
                <button key={cat.key} onClick={() => setViewCategory(cat.key)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border transition-colors flex items-center gap-2 ${active ? 'bg-[var(--admin-primary)] text-white border-[var(--admin-primary)]' : 'text-[var(--admin-muted)] border-[#3a1a1a] hover:text-white hover:border-[var(--admin-primary)]/60'}`} type="button">
                  <span>{cat.label}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-white/15 text-white' : 'bg-white/5 text-white/80'}`}>{cat.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto admin-scroll p-6 space-y-8 bg-[var(--admin-surface)]">
          {filteredSections.map((sectionItem, index) => {
            const section = sectionItem.section;
            const dishes = sectionItem.dishes || [];
            return (
              <section key={section?._id || index} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-6 rounded-full bg-[var(--admin-primary)]" />
                    <h2 className="text-lg font-bold text-white">{section?.title || `Section ${index + 1}`}</h2>
                  </div>
                  <span className="text-xs text-[var(--admin-muted)] uppercase tracking-wide">{dishes.length} items</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dishes.map((dish) => (
                    <div key={dish._id} className="flex items-center gap-4 p-4 rounded-xl border border-[#3a1a1a] bg-[var(--admin-bg)] hover:border-[var(--admin-primary)]/50 transition-colors">
                      <div className="w-16 h-16 rounded-lg bg-cover bg-center border border-[#3a1a1a]" style={{ backgroundImage: `url(${dish.image || '/assets/business-images/hero.jpg'})` }} aria-label={dish.name} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white leading-tight truncate">{dish.name}</h3>
                        <p className="text-xs text-[var(--admin-muted)] mt-1 line-clamp-2">{dish.description || ""}</p>
                      </div>
                      <div className="text-sm font-semibold text-[var(--admin-primary)] whitespace-nowrap">{dish.price ? new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(dish.price) : ''}</div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="flex-none p-5 border-t border-[#3a1a1a] bg-[var(--admin-surface)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm text-[var(--admin-muted)]">Showing {filteredSections.length} sections • {visibleItems} items</div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none px-4 py-2 rounded-xl font-semibold text-white bg-white/5 border border-[#3a1a1a] hover:bg-white/10 transition-colors" type="button" onClick={closeViewModal}>Back to list</button>
            <button className="flex-1 sm:flex-none px-5 py-2 rounded-xl font-bold bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)] shadow-lg shadow-[var(--admin-primary)]/20 transition-all" type="button" onClick={() => openFullMenuPage(viewingMenu)}>Open full page</button>
          </div>
        </div>
      </div>
    </div>
  );
}
