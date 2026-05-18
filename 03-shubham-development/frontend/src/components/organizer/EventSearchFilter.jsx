'use client';

import { Search, X } from 'lucide-react';

export default function EventSearchFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClear,
  hasActiveFilters,
}) {
  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_review', label: 'In review' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3a1224]/35" />
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by event name or type"
          className="h-11 w-full border border-[#e8dcc8] bg-white pl-10 pr-4 text-sm text-[#3a1224] outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {statuses.map((status) => (
          <button
            key={status.value}
            type="button"
            onClick={() => onStatusChange(status.value)}
            className={`h-9 border px-3 text-xs font-bold transition ${
              statusFilter === status.value
                ? 'border-[#3a1224] bg-[#3a1224] text-white'
                : 'border-[#e8dcc8] bg-white text-[#3a1224]/60 hover:bg-[#fbf8f2]'
            }`}
          >
            {status.label}
          </button>
        ))}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-9 items-center gap-1 border border-[#e8dcc8] px-3 text-xs font-bold text-[#3a1224]/60 hover:bg-[#fbf8f2]"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
