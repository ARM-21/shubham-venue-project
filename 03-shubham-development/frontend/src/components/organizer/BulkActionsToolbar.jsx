'use client';

import { Trash2, Copy, Download } from 'lucide-react';

export default function BulkActionsToolbar({
  selectedCount,
  onSelectAll,
  onClear,
  onExport,
  onDuplicate,
  onDelete,
  totalCount,
  disabled,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-5 left-4 right-4 z-40 mx-auto max-w-3xl border border-[#e8dcc8] bg-white p-3 shadow-lg">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-black text-[#3a1224]">
          {selectedCount} selected{selectedCount === totalCount ? ' (all visible)' : ''}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {selectedCount < totalCount && (
            <button onClick={onSelectAll} className="h-9 border border-[#e8dcc8] px-3 text-xs font-bold text-[#3a1224] hover:bg-[#fbf8f2]">
              Select all
            </button>
          )}
          <button onClick={onExport} disabled={disabled} className="inline-flex h-9 items-center gap-2 border border-[#e8dcc8] px-3 text-xs font-bold text-[#3a1224] hover:bg-[#fbf8f2] disabled:opacity-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button onClick={onDuplicate} disabled={disabled || selectedCount !== 1} className="inline-flex h-9 items-center gap-2 border border-[#e8dcc8] px-3 text-xs font-bold text-[#3a1224] hover:bg-[#fbf8f2] disabled:opacity-50">
            <Copy className="h-3.5 w-3.5" /> Duplicate
          </button>
          <button onClick={onDelete} disabled={disabled} className="inline-flex h-9 items-center gap-2 border border-red-200 px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
          <button onClick={onClear} className="h-9 border border-[#e8dcc8] px-3 text-xs font-bold text-[#3a1224]/60 hover:bg-[#fbf8f2]">
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
