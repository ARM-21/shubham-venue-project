import React from "react";
import { CalendarDays, Download, Search } from "lucide-react";

export default function FiltersBar({ filters, setFilters, halls, setPage, fromDateRef, toDateRef, searchInput, setSearchInput, onSearch }) {
  return (
    <div className="p-5 border-b border-white/5 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <div className="relative group">
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, status: e.target.value }));
              setPage(1);
            }}
            className="appearance-none bg-[var(--admin-bg)] border border-white/10 text-white text-sm rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:border-[var(--admin-primary)] cursor-pointer hover:border-white/20 transition-colors"
          >
            {["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].map((option) => (
              <option key={option} value={option}>
                {option === "ALL" ? "All Statuses" : option}
              </option>
            ))}
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] pointer-events-none text-lg">▼</span>
        </div>

        <div className="relative group">
          <select
            value={filters.hallId}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, hallId: e.target.value }));
              setPage(1);
            }}
            className="appearance-none bg-[var(--admin-bg)] border border-white/10 text-white text-sm rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:border-[var(--admin-primary)] cursor-pointer hover:border-white/20 transition-colors"
          >
            <option value="ALL">All Halls</option>
            {halls.map((hall) => (
              <option key={hall.id} value={hall.id}>
                {hall.name}
              </option>
            ))}
          </select>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] pointer-events-none text-lg">▼</span>
        </div>

        <div className="flex items-center gap-2 bg-[var(--admin-bg)] border border-white/10 text-white text-sm rounded-lg px-3 py-2.5">
          <label
            htmlFor="from-date"
            className="cursor-pointer"
            onClick={() => {
              const el = fromDateRef.current;
              if (!el) return;
              if (typeof el.showPicker === "function") {
                el.showPicker();
              } else {
                el.focus();
              }
            }}
            title="Open start date"
          >
            <CalendarDays className="size-4 text-[var(--admin-muted)]" />
          </label>
          <input
            ref={fromDateRef}
            type="date"
            id="from-date"
            value={filters.dateFrom}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, dateFrom: e.target.value }));
              setPage(1);
            }}
            className="bg-transparent focus:outline-none text-xs"
          />
          <span className="text-[var(--admin-muted)]">to</span>

          <label
            htmlFor="to-date"
            className="cursor-pointer"
            onClick={() => {
              const el = toDateRef.current;
              if (!el) return;
              if (typeof el.showPicker === "function") {
                el.showPicker();
              } else {
                el.focus();
              }
            }}
            title="Open end date"
          >
            <CalendarDays className="size-4 text-[var(--admin-muted)]" />
          </label>
          <input
            ref={toDateRef}
            type="date"
            id="to-date"
            value={filters.dateTo}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, dateTo: e.target.value }));
              setPage(1);
            }}
            className="bg-transparent focus:outline-none text-xs"
          />
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] size-4" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
            placeholder="Search name, email, booking id..."
            className="w-full h-10 pl-10 pr-24 bg-[var(--admin-bg)] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[var(--admin-primary)] placeholder:text-[var(--admin-muted)]/70 transition-all"
          />
          <button
            onClick={onSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-dark)] rounded-md text-white"
          >
            Search
          </button>
        </div>
      </div>

      <div className="flex gap-2 self-end lg:self-auto">
        <button className="p-2 text-[var(--admin-muted)] hover:text-white border border-white/10 rounded-lg hover:bg-white/5">
          <Download className="size-4" />
        </button>
      </div>
    </div>
  );
}
