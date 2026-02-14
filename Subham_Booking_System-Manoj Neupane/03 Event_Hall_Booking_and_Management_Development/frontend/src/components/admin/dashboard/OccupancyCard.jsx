import { ChevronLeft, ChevronRight } from "lucide-react";

function DayCell({ day }) {
  const base = "p-2 text-xs text-center relative";
  const muted = day.muted ? "text-[var(--admin-muted)]/60" : "text-[var(--admin-muted)]";
  const highlight =
    day.highlight === "primary"
      ? "bg-[var(--admin-primary)] text-white rounded-full"
      : day.highlight === "subtle"
        ? "bg-white/5 text-white rounded-full"
        : "";

  return (
    <div className={`${base} ${muted} ${highlight}`}>
      {day.label}
      {day.dot ? (
        <span
          className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 size-1 rounded-full ${day.dot}`}
        />
      ) : null}
    </div>
  );
}

export default function OccupancyCard({ monthLabel, days = [], schedule = [] }) {
  return (
    <div className="bg-[var(--admin-surface)] rounded-xl p-6 border border-white/5 flex flex-col h-full">
      <h3 className="text-white text-lg font-bold mb-4">Occupancy</h3>

      <div className="bg-[var(--admin-surface-strong)] rounded-lg p-4 mb-4 border border-[#3a1a1a]">
        <div className="flex justify-between items-center mb-3 text-white">
          <span className="text-sm font-semibold">{monthLabel}</span>
          {/* <div className="flex gap-2 text-[var(--admin-muted)]">
            <ChevronLeft className="size-4 cursor-pointer" />
            <ChevronRight className="size-4 cursor-pointer" />
          </div> */}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 text-[var(--admin-muted)]/70">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div key={`${day}-${index}`}>{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {days.map((day, index) => (
            <DayCell key={`${day.label}-${index}`} day={day} />
          ))}
        </div>
      </div>

      <div className="space-y-3 mt-auto">
        <h4 className="text-xs font-semibold text-[var(--admin-muted)] uppercase tracking-wider">
          Upcoming Schedule
        </h4>
        {schedule.map((item,indx) => (
          <div
            key={item.title + indx}
            className="flex items-center gap-3 p-3 rounded-lg bg-[var(--admin-surface-strong)] border border-[#3a1a1a]"
          >
            <div className={`w-1 h-10 rounded-full ${item.color}`} />
            <div>
              <p className="text-white text-sm font-medium">{item.title}</p>
              <p className="text-[var(--admin-muted)] text-xs">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
