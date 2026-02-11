import React from "react";
import { Users, Building2, Search, Filter } from "lucide-react";

export default function FiltersBar({ filterDraft, setFilterDraft, amenityOptions, applyFilters, clearFilters }) {
  return (
    <div className="bg-[var(--admin-surface)] rounded-xl border border-white/5 p-4 shadow-md">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[var(--admin-muted)] text-xs font-medium mb-1.5 ml-1">Filter by Capacity</label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] size-4" />
            <input
              className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-[var(--admin-muted)]/60 focus:ring-1 focus:ring-[var(--admin-primary)] focus:border-[var(--admin-primary)] transition-all"
              placeholder="Min Guests"
              value={filterDraft.minCapacity}
              onChange={(e) => setFilterDraft((prev) => ({ ...prev, minCapacity: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[var(--admin-muted)] text-xs font-medium mb-1.5 ml-1">Price Range (per hour)</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] size-4" />
            <input
              className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-[var(--admin-muted)]/60 focus:ring-1 focus:ring-[var(--admin-primary)] focus:border-[var(--admin-primary)] transition-all"
              placeholder="Max Price"
              value={filterDraft.maxPrice}
              onChange={(e) => setFilterDraft((prev) => ({ ...prev, maxPrice: e.target.value }))}
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[var(--admin-muted)] text-xs font-medium mb-1.5 ml-1">Amenities</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] size-4" />
            <select
              className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg py-2.5 pl-10 pr-8 text-white text-sm focus:ring-1 focus:ring-[var(--admin-primary)] focus:border-[var(--admin-primary)] transition-all appearance-none cursor-pointer"
              value={filterDraft.amenity}
              onChange={(e) => setFilterDraft((prev) => ({ ...prev, amenity: e.target.value }))}
            >
              <option value="">All Amenities</option>
              {amenityOptions.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] size-4">▼</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearFilters}
            className="h-[42px] px-4 bg-transparent text-white text-sm font-medium rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-colors shadow-sm flex items-center gap-2"
          >
            Clear
          </button>
          <button
            onClick={applyFilters}
            className="h-[42px] px-6 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-dark)] text-white text-sm font-medium rounded-lg border border-[var(--admin-primary)] transition-colors shadow-sm flex items-center gap-2"
          >
            <Filter className="size-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}
