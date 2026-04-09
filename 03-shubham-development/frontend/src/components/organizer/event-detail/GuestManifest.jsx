'use client';

import { useState } from "react";
import { Users, Search, Download } from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";
import { GuestDetailModal } from "./GuestDetailModal";

function formatDate(value) {
  try {
    return new Intl.DateTimeFormat("en-GB", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      weekday: "short"
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

export function GuestManifest({
  attendees,
  totalAttendees,
  query,
  setQuery,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
  isLoading,
  eventId,
}) {
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const filteredAttendees = attendees;

  const handleRowClick = (guest) => {
    setSelectedGuest(guest);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
  };

  const handleExportCheckedIn = async () => {
    try {
      setExporting(true);
      const response = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENT_ATTENDEES_EXPORT(eventId), {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendees-export-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success('Attendees exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to export attendees';
      toast.error(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  const handleExportAll = async () => {
    try {
      setExporting(true);
      const response = await axiosInstance.get(ROUTES.API.ORGANIZER.EVENT_ATTENDEES_EXPORT_ALL(eventId), {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendees-all-export-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast.success('All attendees exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      const errorMsg = error?.response?.data?.message || error.message || 'Failed to export attendees';
      toast.error(errorMsg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
    <section className="bg-white rounded-2xl border border-[#3a1224]/5 p-8 shadow-sm overflow-hidden">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-[#C0A04C]" />
            <h3 className="text-lg sm:text-xl font-black text-[#3a1224] uppercase tracking-wider">Guest Manifest</h3>
            <span className="text-xs sm:text-sm font-bold text-white bg-[#3a1224] px-3 py-1 rounded-full">{totalAttendees}</span>
          </div>
          <div className="relative flex-1 sm:ml-auto sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3a1224]/20" />
            <input
              type="text"
              placeholder="Search guests..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#fdfaf6] border border-[#3a1224]/5 rounded-lg pl-10 pr-4 py-2 text-sm sm:text-base font-bold text-[#3a1224] focus:ring-1 ring-[#C0A04C]/20 outline-none"
            />
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={handleExportCheckedIn}
            disabled={exporting || !eventId}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} className="sm:w-4" />
            <span className="hidden sm:inline">Export Checked-In</span>
            <span className="sm:hidden">Checked-In</span>
          </button>

          <button
            onClick={handleExportAll}
            disabled={exporting || !eventId}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border border-blue-500/30 rounded-lg text-xs sm:text-sm font-black uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={14} className="sm:w-4" />
            <span className="hidden sm:inline">Export All</span>
            <span className="sm:hidden">All</span>
          </button>

          {exporting && (
            <span className="text-xs font-bold text-[#3a1224]/40 animate-pulse">Exporting...</span>
          )}
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#3a1224]/5">
              <th className="pb-3 px-4 text-xs sm:text-sm font-black text-[#3a1224]/40 uppercase tracking-widest text-left">Guest</th>
              <th className="pb-3 px-4 text-xs sm:text-sm font-black text-[#3a1224]/40 uppercase tracking-widest text-left">ID</th>
              <th className="pb-3 px-4 text-xs sm:text-sm font-black text-[#3a1224]/40 uppercase tracking-widest text-right hidden sm:table-cell">Entry Time</th>
              <th className="pb-3 px-4 text-xs sm:text-sm font-black text-[#3a1224]/40 uppercase tracking-widest text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3a1224]/5">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-4"><div className="w-24 h-3 bg-[#3a1224]/5 rounded-full" /></td>
                  <td className="py-4 px-4"><div className="w-20 h-3 bg-[#3a1224]/5 rounded-full" /></td>
                  <td className="py-4 px-4 hidden sm:table-cell"><div className="w-16 h-3 bg-[#3a1224]/5 rounded-full ml-auto" /></td>
                  <td className="py-4 px-4"><div className="w-12 h-3 bg-[#3a1224]/5 rounded-full ml-auto" /></td>
                </tr>
              ))
            ) : filteredAttendees.length === 0 ? (
              <tr key="empty-state">
                <td colSpan={4} className="py-16 text-center">
                  <Users className="w-8 h-8 text-[#3a1224]/10 mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#3a1224]/20">No guests found</p>
                </td>
              </tr>
            ) : (
              filteredAttendees.map((a, index) => (
                <tr
                  key={a._id || `attendee-${index}`}
                  onClick={() => handleRowClick(a)}
                  className="hover:bg-[#C0A04C]/5 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-xs sm:text-sm font-black text-[#3a1224]">{a.attendee?.first_name} {a.attendee?.last_name}</p>
                      <p className="text-xs text-[#3a1224]/40">{a.attendee?.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-xs sm:text-sm font-mono text-[#C0A04C] font-black">{a.qrCodeValue?.substring(0, 6)}...</p>
                  </td>
                  <td className="py-4 px-4 hidden sm:table-cell text-right">
                    <p className="text-xs sm:text-sm font-bold text-[#3a1224]/60">{a.checkedInAt ? formatDate(a.checkedInAt) : formatDate(a.createdAt)}</p>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs sm:text-sm font-black uppercase tracking-wider ${a.checkedInAt ? 'bg-emerald-500/10 text-emerald-600' : 'bg-[#3a1224]/5 text-[#3a1224]/40'}`}>
                      {a.checkedInAt ? '✓ In' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 mt-6 pt-6 border-t border-[#3a1224]/5">
          <p className="text-xs sm:text-sm font-bold text-[#3a1224]/40">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={onPrevPage}
              className="px-4 py-2 rounded-lg bg-white border border-[#3a1224]/5 text-xs sm:text-sm font-bold uppercase disabled:opacity-30 hover:bg-[#3a1224] hover:text-white"
            >
              ← Prev
            </button>
            <button
              disabled={page >= totalPages}
              onClick={onNextPage}
              className="px-4 py-2 rounded-lg bg-white border border-[#3a1224]/5 text-xs sm:text-sm font-bold uppercase disabled:opacity-30 hover:bg-[#3a1224] hover:text-white"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </section>
    <GuestDetailModal guest={selectedGuest} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
