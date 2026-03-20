import React from 'react';
import { MoreHorizontal } from 'lucide-react';

export default function DishViewModal({ viewingDish, closeDishView, openDishEdit }) {
  if (!viewingDish) return null;

  const currencyFormatter = new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDishView} />
      <div className="relative z-50 w-full max-w-lg bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-2xl p-6 shadow-2xl shadow-black/30">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Item details</h3>
            <p className="text-[var(--admin-muted)] text-sm">Review pricing and availability.</p>
          </div>
          <button type="button" className="text-[var(--admin-muted)] hover:text-white" onClick={closeDishView} aria-label="Close view dish"><MoreHorizontal className="rotate-90" /></button>
        </div>

        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-xl bg-cover bg-center border border-[#3a1a1a] flex-shrink-0" style={{ backgroundImage: `url(${viewingDish.image || '/assets/business-images/hero.jpg'})` }} aria-label={viewingDish.name} />
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold border bg-[var(--admin-primary)]/15 text-white border-[var(--admin-primary)]/40">{viewingDish.section?.title || 'Uncategorized'}</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${viewingDish.isActive !== false ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30' : 'bg-rose-500/15 text-rose-200 border-rose-500/30'}`}>{viewingDish.isActive !== false ? 'Active' : 'Inactive'}</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${viewingDish.isVegetarian ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30' : 'bg-amber-500/10 text-amber-200 border-amber-500/30'}`}>{viewingDish.isVegetarian ? 'Vegetarian' : 'Non-veg'}</span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-snug break-words">{viewingDish.name}</h2>
            <p className="text-[var(--admin-muted)] text-sm leading-relaxed break-words">{viewingDish.description || 'No description'}</p>
            <div className="flex items-center gap-2 text-lg font-semibold text-[var(--admin-primary)]">{viewingDish.price ? currencyFormatter.format(viewingDish.price) : 'N/A'} <span className="text-[var(--admin-muted)] text-xs font-normal">{viewingDish.unitLabel}</span></div>
            <div className="text-[var(--admin-muted)] text-xs">Last updated: {viewingDish.updatedAt ? new Date(viewingDish.updatedAt).toLocaleString() : 'Unknown'}</div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button type="button" className="px-4 py-2 rounded-lg border border-[#3a1a1a] text-[var(--admin-muted)] hover:text-white hover:border-[var(--admin-primary)]" onClick={closeDishView}>Close</button>
          <button type="button" className="px-5 py-2 rounded-lg bg-[var(--admin-primary)] text-white font-semibold shadow-lg shadow-[var(--admin-primary)]/30 hover:bg-[var(--admin-primary-dark)]" onClick={() => { closeDishView(); openDishEdit(viewingDish); }}>Edit item</button>
        </div>
      </div>
    </div>
  );
}
