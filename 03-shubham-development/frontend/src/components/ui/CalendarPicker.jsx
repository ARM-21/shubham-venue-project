'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function buildCells(monthDate) {
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const firstDow = new Date(y, m, 1).getDay();
  const total = new Date(y, m + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(y, m, d));
  return cells;
}

function toIso(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function CalendarPicker({ value, onChange, minDate }) {
  const [displayMonth, setDisplayMonth] = useState(() => {
    if (value) return new Date(`${value}T00:00:00`);
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), 1);
  });

  const cells = buildCells(displayMonth);
  const prev = () => setDisplayMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const next = () => setDisplayMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  return (
    <div>
      {/* Month nav */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prev}
          className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#e8dcc8] bg-[#fbf8f2] text-[#3a1224] transition hover:border-[#C0A04C]/50"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-black text-[#3a1224]">
          {displayMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button
          type="button"
          onClick={next}
          className="flex h-7 w-7 items-center justify-center rounded-xl border border-[#e8dcc8] bg-[#fbf8f2] text-[#3a1224] transition hover:border-[#C0A04C]/50"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Grid */}
      <div className="rounded-2xl border border-[#e8dcc8] bg-[#fbf8f2] p-3">
        <div className="mb-2 grid grid-cols-7 text-center">
          {DAY_LABELS.map((d) => (
            <span key={d} className="text-[9px] font-black uppercase tracking-wide text-[#3a1224]/30">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((dt, idx) => {
            if (!dt) return <div key={idx} />;
            const iso = toIso(dt);
            const isPast = minDate ? iso < minDate : false;
            if (isPast) return <div key={idx} />;
            const isSelected = value === iso;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(iso)}
                className={`flex h-8 w-full items-center justify-center rounded-xl text-xs font-bold transition ${
                  isSelected
                    ? 'bg-[#3a1224] text-white'
                    : 'text-[#3a1224] hover:bg-[#e8dcc8]'
                }`}
              >
                {dt.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
