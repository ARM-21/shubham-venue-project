'use client';

import { useState } from "react";
import { Download, Search, Users } from "lucide-react";
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
      weekday: "short",
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

  const handleRowClick = (guest) => {
    setSelectedGuest(guest);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
  };

  const exportAttendees = async (all = false) => {
    try {
      setExporting(true);
      const url = all
        ? ROUTES.API.ORGANIZER.EVENT_ATTENDEES_EXPORT_ALL(eventId)
        : ROUTES.API.ORGANIZER.EVENT_ATTENDEES_EXPORT(eventId);
      const response = await axiosInstance.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `${all ? "attendees-all" : "attendees-checked-in"}-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(objectUrl);
      document.body.removeChild(link);
      toast.success(all ? "All attendees exported" : "Checked-in attendees exported");
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to export attendees");
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <section className="border border-[#e8dcc8] bg-white">
        <div className="flex flex-col gap-4 border-b border-[#e8dcc8] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#3a1224]/45" />
              <h2 className="text-base font-black text-[#3a1224]">Guest manifest</h2>
              <span className="border border-[#e8dcc8] bg-[#fbf8f2] px-2 py-0.5 text-xs font-black text-[#3a1224]">{totalAttendees}</span>
            </div>
            <p className="mt-1 text-xs leading-5 text-[#3a1224]/45">Search registrations, export attendance, and open guest details.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3a1224]/30" />
              <input
                type="text"
                placeholder="Search guests"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-10 w-full border border-[#e8dcc8] bg-white pl-9 pr-3 text-sm font-bold text-[#3a1224] outline-none focus:border-[#C0A04C]"
              />
            </div>
            <button
              type="button"
              onClick={() => exportAttendees(false)}
              disabled={exporting || !eventId}
              className="inline-flex h-10 items-center justify-center gap-2 border border-[#e8dcc8] px-3 text-xs font-bold text-[#3a1224] hover:bg-[#fbf8f2] disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              Checked-in
            </button>
            <button
              type="button"
              onClick={() => exportAttendees(true)}
              disabled={exporting || !eventId}
              className="inline-flex h-10 items-center justify-center gap-2 bg-[#3a1224] px-3 text-xs font-bold text-white hover:bg-[#4b1830] disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[#e8dcc8] bg-[#fbf8f2]">
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Guest</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Ticket code</th>
                <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Entry time</th>
                <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8dcc8]">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-5 py-4"><div className="h-4 w-36 animate-pulse bg-[#3a1224]/10" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-20 animate-pulse bg-[#3a1224]/10" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-28 animate-pulse bg-[#3a1224]/10" /></td>
                    <td className="px-5 py-4"><div className="ml-auto h-4 w-16 animate-pulse bg-[#3a1224]/10" /></td>
                  </tr>
                ))
              ) : attendees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-14 text-center">
                    <Users className="mx-auto h-7 w-7 text-[#3a1224]/20" />
                    <p className="mt-2 text-sm font-bold text-[#3a1224]/45">No guests found</p>
                  </td>
                </tr>
              ) : (
                attendees.map((attendee, index) => (
                  <tr key={attendee._id || `attendee-${index}`} onClick={() => handleRowClick(attendee)} className="cursor-pointer hover:bg-[#fbf8f2]">
                    <td className="px-5 py-4">
                      <p className="font-black text-[#3a1224]">{attendee.attendee?.first_name} {attendee.attendee?.last_name}</p>
                      <p className="mt-1 text-xs text-[#3a1224]/45">{attendee.attendee?.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-black text-[#3a1224]/65">{attendee.qrCodeValue?.substring(0, 8)}...</p>
                    </td>
                    <td className="px-5 py-4 text-xs font-bold text-[#3a1224]/55">
                      {attendee.checkedInAt ? formatDate(attendee.checkedInAt) : formatDate(attendee.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className={`inline-flex border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${attendee.checkedInAt ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#e8dcc8] bg-[#fbf8f2] text-[#3a1224]/50"}`}>
                        {attendee.checkedInAt ? "Checked in" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t border-[#e8dcc8] px-5 py-4">
            <p className="text-xs font-bold text-[#3a1224]/45">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button type="button" disabled={page <= 1} onClick={onPrevPage} className="h-9 border border-[#e8dcc8] px-3 text-xs font-bold text-[#3a1224] hover:bg-[#fbf8f2] disabled:opacity-40">Prev</button>
              <button type="button" disabled={page >= totalPages} onClick={onNextPage} className="h-9 border border-[#e8dcc8] px-3 text-xs font-bold text-[#3a1224] hover:bg-[#fbf8f2] disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </section>
      <GuestDetailModal guest={selectedGuest} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
