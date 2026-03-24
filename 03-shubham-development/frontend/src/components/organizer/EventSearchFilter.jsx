'use client';

import { Search, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tooltip from './Tooltip';

export default function EventSearchFilter({ 
  searchQuery, 
  onSearchChange, 
  statusFilter, 
  onStatusChange, 
  onClear,
  hasActiveFilters 
}) {
  const statuses = [
    { value: 'all', label: 'All Events', color: 'text-[#3a1224]' },
    { value: 'published', label: 'Published', color: 'text-emerald-600' },
    { value: 'draft', label: 'Draft', color: 'text-amber-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' },
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#3a1224]/40" size={16} />
        <Tooltip 
          content="Find events by typing their name. Combines with status filters for precise results."
          title="Search Events"
          position="bottom"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events..."
            className="w-full h-10 sm:h-12 pl-10 sm:pl-12 pr-4 bg-white border border-[#3a1224]/10 rounded-lg sm:rounded-xl text-[13px] sm:text-sm text-[#3a1224] placeholder-[#3a1224]/40 focus:border-[#C0A04C]/50 focus:ring-2 focus:ring-[#C0A04C]/20 transition-all"
          />
        </Tooltip>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Tooltip 
          content="Filter events by their current publication status"
          title="Filter by Status"
          position="right"
        >
          <div className="cursor-help">
            <Filter size={15} className="text-[#3a1224]/40" />
          </div>
        </Tooltip>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {statuses.map((status) => (
            <motion.button
              key={status.value}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onStatusChange(status.value)}
              className={`h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all ${
                statusFilter === status.value
                  ? `bg-[#3a1224] text-white shadow-lg`
                  : `bg-white border border-[#3a1224]/10 text-[#3a1224]/60 hover:border-[#3a1224]/30`
              }`}
            >
              {status.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2 sm:p-3 bg-[#C0A04C]/10 border border-[#C0A04C]/20 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          >
            <span className="text-[8px] sm:text-[9px] font-black text-[#3a1224] uppercase tracking-widest leading-tight">
              Filters active — Tap to clear
            </span>
            <button
              onClick={onClear}
              className="h-7 px-3 bg-[#C0A04C]/20 hover:bg-[#C0A04C]/30 text-[#C0A04C] rounded-lg text-[7px] sm:text-[8px] font-black uppercase tracking-widest flex items-center gap-1 transition-all whitespace-nowrap"
            >
              <X size={11} /> Clear All
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
