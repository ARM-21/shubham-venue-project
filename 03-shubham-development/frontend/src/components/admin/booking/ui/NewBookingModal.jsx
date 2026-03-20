"use client";

import { useState } from "react";
import { X, Calendar, Users, Home, Clock, Loader2, AlertCircle } from "lucide-react";

export default function NewBookingModal({ isOpen, onClose, onSave, halls, loading }) {
  const [formData, setFormData] = useState({
    userEmail: "",
    hallId: "",
    date: "",
    slot: "morning",
    guests: "",
  });

  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic Validation
    if (!formData.userEmail.includes("@")) return setError("Please enter a valid customer email.");
    if (!formData.hallId) return setError("Please select a hall.");
    if (!formData.date) return setError("Please select an event date.");
    if (Number(formData.guests) <= 0) return setError("Guest count must be greater than 0.");

    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
          <div>
            <h2 className="text-xl font-bold text-white">Create New Booking</h2>
            <p className="text-xs text-[var(--admin-muted)] mt-1">Manual reservation for offline clients.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full text-[var(--admin-muted)] hover:text-white transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="size-4" /> {error}
            </div>
          )}

          {/* Customer Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--admin-muted)] uppercase tracking-wider">Customer Email</label>
            <div className="relative">
              <input
                type="email"
                name="userEmail"
                required
                value={formData.userEmail}
                onChange={handleChange}
                placeholder="customer@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)] outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Hall Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--admin-muted)] uppercase tracking-wider">Select Hall</label>
              <div className="relative">
                <select
                  name="hallId"
                  required
                  value={formData.hallId}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--admin-primary)] outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#121212]">Choose Hall</option>
                  {halls.map((hall) => (
                    <option key={hall.id} value={hall.id} className="bg-[#121212]">
                      {hall.name}
                    </option>
                  ))}
                </select>
                <Home className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-white/20 pointer-events-none" />
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--admin-muted)] uppercase tracking-wider">Event Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--admin-primary)] outline-none [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Slot Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--admin-muted)] uppercase tracking-wider">Time Slot</label>
              <div className="relative">
                <select
                  name="slot"
                  value={formData.slot}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--admin-primary)] outline-none appearance-none cursor-pointer"
                >
                  <option value="morning" className="bg-[#121212]">Morning</option>
                  <option value="evening" className="bg-[#121212]">Evening</option>
                  <option value="full_day" className="bg-[#121212]">Full Day</option>
                </select>
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-white/20 pointer-events-none" />
              </div>
            </div>

            {/* Guests Count */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--admin-muted)] uppercase tracking-wider">No. of Guests</label>
              <div className="relative">
                <input
                  type="number"
                  name="guests"
                  required
                  placeholder="e.g. 250"
                  value={formData.guests}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--admin-primary)] outline-none"
                />
                <Users className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-white/20 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[var(--admin-primary)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl shadow-lg shadow-[var(--admin-primary)]/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin size-4" /> : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}