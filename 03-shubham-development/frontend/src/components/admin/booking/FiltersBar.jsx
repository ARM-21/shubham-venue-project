import React, { useState } from "react";
import { CalendarDays, Download, Search, AlertCircle, X } from "lucide-react";

export default function FiltersBar({ filters, setFilters, halls, setPage, fromDateRef, toDateRef, searchInput, setSearchInput, onSearch }) {
  const [dateError, setDateError] = useState("");

  const handleDateChange = (field, value) => {
    setDateError(""); // Clear error on change
    
    const updatedFilters = { ...filters, [field]: value };
    
    // Validation: dateFrom must be less than dateTo
    if (updatedFilters.dateFrom && updatedFilters.dateTo) {
      const fromDate = new Date(updatedFilters.dateFrom);
      const toDate = new Date(updatedFilters.dateTo);
      
      if (fromDate > toDate) {
        setDateError("Start date must be before end date");
        return;
      }
    }

    // Validation: dates shouldn't be in the past (optional for bookings)
    if (value) {
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today && field === "dateFrom") {
        setDateError("Start date cannot be in the past");
        return;
      }
    }

    setFilters((prev) => updatedFilters);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setFilters((prev) => ({ ...prev, status: value }));
    setPage(1);
  };

  const handleHallChange = (value) => {
    setFilters((prev) => ({ ...prev, hallId: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({ status: "ALL", hallId: "ALL", dateFrom: "", dateTo: "" });
    setSearchInput("");
    setDateError("");
    setPage(1);
  };

  const isFiltersActive = filters.status !== "ALL" || filters.hallId !== "ALL" || filters.dateFrom || filters.dateTo || searchInput;

  return (
    <div className="space-y-3">
      {/* Date Validation Error */}
      {dateError && (
        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          <AlertCircle className="size-4 flex-shrink-0" />
          <span>{dateError}</span>
        </div>
      )}

      <div className="p-5 border border-white/5 rounded-xl bg-[var(--admin-bg)]/50 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Status Filter */}
          <div className="relative group">
            <select
              value={filters.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="appearance-none bg-[var(--admin-bg)] border border-white/10 text-white text-sm rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:border-[var(--admin-primary)] cursor-pointer hover:border-white/20 transition-colors"
              title="Filter by booking status"
            >
              {["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].map((option) => (
                <option key={option} value={option}>
                  {option === "ALL" ? "All Statuses" : option}
                </option>
              ))}
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] pointer-events-none text-lg">▼</span>
          </div>

          {/* Hall Filter */}
          <div className="relative group">
            <select
              value={filters.hallId}
              onChange={(e) => handleHallChange(e.target.value)}
              className="appearance-none bg-[var(--admin-bg)] border border-white/10 text-white text-sm rounded-lg pl-3 pr-10 py-2.5 focus:outline-none focus:border-[var(--admin-primary)] cursor-pointer hover:border-white/20 transition-colors"
              title="Filter by hall"
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

          {/* Date Range Filter */}
          <div className={`flex items-center gap-2 bg-[var(--admin-bg)] border rounded-lg px-3 py-2.5 transition-colors ${
            dateError ? "border-red-500/50" : "border-white/10 hover:border-white/20"
          }`}>
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
              title="Select start date"
            >
              <CalendarDays className="size-4 text-[var(--admin-muted)]" />
            </label>
            <input
              ref={fromDateRef}
              type="date"
              id="from-date"
              value={filters.dateFrom}
              onChange={(e) => handleDateChange("dateFrom", e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-white"
              title="Start date (cannot be in the past)"
            />
            <span className="text-[var(--admin-muted)] text-xs">to</span>

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
              title="Select end date"
            >
              <CalendarDays className="size-4 text-[var(--admin-muted)]" />
            </label>
            <input
              ref={toDateRef}
              type="date"
              id="to-date"
              value={filters.dateTo}
              onChange={(e) => handleDateChange("dateTo", e.target.value)}
              className="bg-transparent focus:outline-none text-xs text-white"
              title="End date"
            />
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] size-4" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch();
              }}
              placeholder="Search name, email, ID..."
              className="w-full h-10 pl-10 pr-24 bg-[var(--admin-bg)] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-[var(--admin-primary)] placeholder:text-[var(--admin-muted)]/70 transition-all"
            />
            <button
              onClick={onSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 text-xs bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-dark)] rounded-md text-white transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 self-end lg:self-auto">
          {isFiltersActive && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 px-3 py-2 text-xs text-white bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors"
              title="Reset all filters"
            >
              <X className="size-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
