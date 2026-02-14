"use client";

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import DishCreateModal from './ui/DishCreateModal';

export default function InventorySection({
  loading,
  selectedCategory,
  setSelectedCategory,
  categories,
  sections = [],
  dishes,
  toggleDishStatus,
  openDishView,
  openDishEdit,
  handleDeleteDish,
  onCreatedDish,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [dishPage, setDishPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [openDishActionsId, setOpenDishActionsId] = useState(null);
  // Compute filtered inventory locally using internal search term and selected category
  const filtered = useMemo(() => {
    const query = String(searchTerm || '').trim().toLowerCase();
    let list = dishes || [];

    if (selectedCategory !== 'all') {
      list = list.filter((dish) => {
        const normalized = String(dish.section?.title || '').trim().toLowerCase();
        if (selectedCategory === 'decor') return /decor/.test(normalized);
        if (selectedCategory === 'services') return /service|extra|addon/.test(normalized);
        return normalized === selectedCategory;
      });
    }

    if (query) {
      list = list.filter((item) =>
        [item.name, item.section?.title, item.description]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(query)),
      );
    }

    return list;
  }, [dishes, searchTerm, selectedCategory]);

  const paginated = useMemo(() => {
    const start = (dishPage - 1) * pageSize;
    return (filtered || []).slice(start, start + pageSize);
  }, [filtered, dishPage, pageSize]);
  const currencyFormatter = new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 });
  const [createOpen, setCreateOpen] = useState(false);
  const [createSectionId, setCreateSectionId] = useState('');

  const normalize = (v) => String(v || '').trim().toLowerCase();

  return (
    <section className="bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-xl shadow-lg shadow-black/20 overflow-hidden">
      <div className="p-6 border-b border-[#3a1a1a] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">Individual Items Inventory</h3>
          <p className="text-[var(--admin-muted)] text-sm">Manage pricing for single items and add-ons.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto md:items-center justify-end">
            <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--admin-muted)]" />
            <input type="search" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setDishPage(1); }} className="bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)] w-full" placeholder="Filter items..." />
          </div>
          <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setDishPage(1); }} className="bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)]">
            {categories.map((cat) => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value) || 8); setDishPage(1); }} className="bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)]">
            {[8, 12, 16, 24].map((size) => (
              <option key={size} value={size}>{size} / page</option>
            ))}
          </select>
          <button type="button" onClick={() => {
            // preselect section based on selectedCategory if possible
            let pre = '';
            if (selectedCategory && selectedCategory !== 'all') {
              const found = (sections || []).find((s) => normalize(s.title) === normalize(selectedCategory));
              if (found) pre = found._id || found.id || '';
            }
            setCreateSectionId(pre);
            setCreateOpen(true);
          }} className="px-4 py-2 bg-[var(--admin-primary)] text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-[var(--admin-primary-dark)]">Add item</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--admin-bg)] text-[var(--admin-muted)] text-xs uppercase tracking-[0.08em]">
              <th className="p-4 border-b border-[#3a1a1a]">Item Name</th>
              <th className="p-4 border-b border-[#3a1a1a]">Category</th>
              <th className="p-4 border-b border-[#3a1a1a]">Unit Price</th>
              <th className="p-4 border-b border-[#3a1a1a]">Last Updated</th>
              <th className="p-4 border-b border-[#3a1a1a] text-center">Availability</th>
              <th className="p-4 border-b border-[#3a1a1a] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3a1a1a] text-sm">
            {loading ? (
              <tr>
                <td className="p-4 text-[var(--admin-muted)]" colSpan={6}>Loading items...</td>
              </tr>
            ) : (filtered || []).length ? (
              paginated.map((item) => {
                const id = item._id || item.id;
                const categoryLabel = item.section?.title || "Uncategorized";
                const isActive = item.isActive !== false;
                const priceLabel = typeof item.price === "number" && item.price > 0 ? currencyFormatter.format(item.price) : "N/A";
                const updatedLabel = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" }) : "";

                return (
                  <tr key={id} className={`transition-colors ${!isActive ? "opacity-60" : "hover:bg-[var(--admin-bg)]/80"}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded bg-cover bg-center border border-[#3a1a1a] ${!isActive ? "grayscale" : ""}`} style={{ backgroundImage: `url(${item.image || "/assets/business-images/hero.jpg"})` }} aria-label={item.name} />
                        <div className="flex flex-col gap-0.5">
                          <span className={`font-semibold text-white ${!isActive ? "line-through" : ""}`}>{item.name}</span>
                          {!isActive ? <span className="text-[10px] uppercase px-1 py-0.5 rounded border border-amber-400/30 text-amber-200 bg-amber-400/10 w-fit">Unavailable</span> : null}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded text-[11px] font-semibold border bg-[var(--admin-primary)]/15 text-white border-[var(--admin-primary)]/40">{categoryLabel}</span>
                    </td>
                    <td className="p-4 text-white font-medium">{priceLabel} <span className="text-[var(--admin-muted)] text-xs">{item.unitLabel}</span></td>
                    <td className="p-4 text-[var(--admin-muted)]">{updatedLabel}</td>
                    <td className="p-4 text-center">
                      <label className="relative inline-flex cursor-pointer items-center">
                        <input type="checkbox" className="peer sr-only" checked={isActive} onChange={() => toggleDishStatus(id, isActive)} />
                        <div className="w-9 h-4 bg-white/10 rounded-full peer peer-checked:bg-[var(--admin-primary)] transition-colors" />
                        <div className="absolute left-0.5 top-0.5 h-3 w-3 rounded-full bg-white transition-transform peer-checked:translate-x-5" />
                      </label>
                    </td>
                    <td className="p-4 text-right">
                      <div className="relative inline-block" data-dish-actions>
                        <button className="text-[var(--admin-muted)] hover:text-white p-1 rounded transition-colors border border-transparent hover:border-[var(--admin-primary)]/40" type="button" aria-label="More actions" onClick={() => setOpenDishActionsId((cur) => (cur === id ? null : id))}>
                          <span className="size-4">⋯</span>
                        </button>

                        {openDishActionsId === id ? (
                          <div className="absolute right-0 mt-2 w-40 bg-[var(--admin-surface)] border border-[#3a1a1a] rounded shadow-lg z-50">
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[var(--admin-bg)]" type="button" onClick={() => { setOpenDishActionsId(null); openDishView(item); }}>View</button>
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[var(--admin-bg)]" type="button" onClick={() => { setOpenDishActionsId(null); openDishEdit(item); }}>Edit</button>
                            <button className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[var(--admin-bg)]" type="button" onClick={() => { setOpenDishActionsId(null); handleDeleteDish(id); }}>Delete</button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className="p-4 text-[var(--admin-muted)]" colSpan={6}>No items found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <DishCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        origin="inventory"
        sections={sections}
        sectionId={createSectionId}
        onCreated={(dish) => { if (onCreatedDish) onCreatedDish(dish); setCreateOpen(false); }}
      />

        <div className="p-4 border-t border-[#3a1a1a] flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-3">
        <span className="text-[var(--admin-muted)]">Showing {paginated.length} of {(filtered || []).length} items</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 rounded bg-[var(--admin-surface-strong)] border border-[#3a1a1a] text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-primary)]/20 disabled:opacity-50" type="button" onClick={() => setDishPage((p) => Math.max(1, p - 1))} disabled={dishPage <= 1}>Prev</button>
          <span className="px-2 text-white/80">{dishPage} / {Math.max(1, Math.ceil(((filtered || []).length || 0) / pageSize))}</span>
          <button className="px-3 py-1 rounded bg-[var(--admin-surface-strong)] border border-[#3a1a1a] text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-primary)]/20 disabled:opacity-50" type="button" onClick={() => setDishPage((p) => Math.min(Math.max(1, Math.ceil(((filtered || []).length || 0) / pageSize)), p + 1))} disabled={dishPage >= Math.max(1, Math.ceil(((filtered || []).length || 0) / pageSize))}>Next</button>
        </div>
      </div>
    </section>
  );
}
