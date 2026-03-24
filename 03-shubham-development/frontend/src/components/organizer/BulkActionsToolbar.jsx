'use client';

import { Checkbox, Trash2, Copy, Download, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Tooltip from './Tooltip';

export default function BulkActionsToolbar({ selectedCount, onSelectAll, onClear, onExport, onDuplicate, onDelete, totalCount, disabled }) {
  const [showMenu, setShowMenu] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 max-w-2xl mx-auto z-40 bg-[#3a1224] text-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4"
    >
      <div className="flex items-center gap-3 order-1">
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest truncate">
          {selectedCount} <span className="hidden sm:inline">Selected</span>{selectedCount === totalCount ? ' (All)' : ''}
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap order-2">
        {/* Select/Deselect All */}
        {selectedCount < totalCount && (
          <Tooltip content="Select all events matching current filters" position="top">
            <button
              onClick={onSelectAll}
              className="h-9 sm:h-10 px-2 sm:px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
            >
              <span className="hidden sm:inline">Select All</span>
              <span className="sm:hidden">Select</span>
            </button>
          </Tooltip>
        )}

        {/* Export */}
        <Tooltip content="Download selected events as CSV file for reporting" title="Export Events" position="top">
          <button
            onClick={onExport}
            disabled={disabled}
            className="h-9 sm:h-10 px-2 sm:px-4 bg-[#C0A04C]/20 hover:bg-[#C0A04C]/30 text-[#C0A04C] rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1 sm:gap-2"
          >
            <Download size={13} className="sm:w-3.5" /> <span className="hidden sm:inline">Export</span>
          </button>
        </Tooltip>

        {/* Duplicate */}
        <Tooltip content="Create a copy of selected event in draft mode" title="Clone Event" position="top">
          <button
            onClick={onDuplicate}
            disabled={disabled || selectedCount !== 1}
            className="h-9 sm:h-10 px-2 sm:px-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1 sm:gap-2"
            title="Select one event to duplicate"
          >
            <Copy size={13} className="sm:w-3.5" /> <span className="hidden sm:inline">Copy</span>
          </button>
        </Tooltip>

        {/* Delete */}
        <Tooltip content="Permanently remove selected events (cannot be undone)" title="Delete Events" position="top">
          <button
            onClick={onDelete}
            disabled={disabled}
            className="h-9 sm:h-10 px-2 sm:px-4 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1 sm:gap-2"
          >
            <Trash2 size={13} className="sm:w-3.5" /> <span className="hidden sm:inline">Delete</span>
          </button>
        </Tooltip>

        {/* Clear */}
        <button
          onClick={onClear}
          className="h-9 sm:h-10 px-2 sm:px-4 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all"
        >
          Clear
        </button>
      </div>
    </motion.div>
  );
}
