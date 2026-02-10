import React from "react";
import { MoreHorizontal } from "lucide-react";
import { ActionIconButton, PaymentPill, StatusPill } from "./ui";

export default function BookingTable({
  rows,
  bookingsLoading,
  bookingsTotal,
  page,
  pageSize,
  bookingsPages,
  setPage,
  openMenuId,
  setOpenMenuId,
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-[var(--admin-surface)] rounded-xl border border-white/5 shadow-xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-[var(--admin-bg)]">
              <th className="p-4 text-xs font-semibold tracking-wide text-[var(--admin-muted)] uppercase whitespace-nowrap">Booking ID</th>
              <th className="p-4 text-xs font-semibold tracking-wide text-[var(--admin-muted)] uppercase whitespace-nowrap">Customer</th>
              <th className="p-4 text-xs font-semibold tracking-wide text-[var(--admin-muted)] uppercase whitespace-nowrap">Hall</th>
              <th className="p-4 text-xs font-semibold tracking-wide text-[var(--admin-muted)] uppercase whitespace-nowrap">Event Date</th>
              <th className="p-4 text-xs font-semibold tracking-wide text-[var(--admin-muted)] uppercase whitespace-nowrap text-center">Guests</th>
              <th className="p-4 text-xs font-semibold tracking-wide text-[var(--admin-muted)] uppercase whitespace-nowrap">Payment</th>
              <th className="p-4 text-xs font-semibold tracking-wide text-[var(--admin-muted)] uppercase whitespace-nowrap">Status</th>
              <th className="p-4 text-xs font-semibold tracking-wide text-[var(--admin-muted)] uppercase whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bookingsLoading ? (
              <tr>
                <td className="p-4 text-sm text-[var(--admin-muted)]" colSpan={8}>
                  Loading bookings...
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-4 text-sm font-medium text-white whitespace-nowrap">{row.id}</td>
                  <td className="p-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {row.avatar ? (
                        <div
                          className="size-8 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${row.avatar})` }}
                        />
                      ) : (
                        <div className="flex items-center justify-center size-8 rounded-full bg-[#482323] text-white text-xs font-bold">
                          {row.customer.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">{row.customer}</span>
                        <span className="text-xs text-[var(--admin-muted)]">{row.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-300 whitespace-nowrap">{row.hall}</td>
                  <td className="p-4 text-sm text-white whitespace-nowrap">{row.eventDate}</td>
                  <td className="p-4 text-sm text-gray-300 text-center whitespace-nowrap">{row.guests}</td>
                  <td className="p-4 whitespace-nowrap">
                    <PaymentPill tone={row.payment.tone}>{row.payment.label}</PaymentPill>
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <StatusPill tone={row.status.tone}>{row.status.label}</StatusPill>
                  </td>
                  <td className="p-4 whitespace-nowrap text-right">
                    <div className="relative flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <ActionIconButton
                        title="More"
                        onClick={() => setOpenMenuId((prev) => (prev === row.id ? null : row.id))}
                      >
                        <MoreHorizontal className="size-5" />
                      </ActionIconButton>

                      {openMenuId === row.id ? (
                        <div className="absolute right-0 top-full mt-2 rounded-lg border border-white/10 bg-[var(--admin-bg)] shadow-lg z-10">
                          <div className="flex">
                            <button
                              onClick={() => onView(row.id)}
                              className="px-3 py-2 text-sm text-white hover:bg-white/10 rounded-l-lg"
                            >
                              View
                            </button>
                            <button
                              onClick={() => onEdit(row.id)}
                              className="px-3 py-2 text-sm text-white hover:bg-white/10"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDelete(row.id)}
                              className="px-3 py-2 text-sm text-red-300 hover:bg-red-900/20 rounded-r-lg"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-sm text-[var(--admin-muted)]" colSpan={8}>
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-white/5 flex items-center justify-between">
        <p className="text-xs text-[var(--admin-muted)]">
          Showing {bookingsTotal ? `${(page - 1) * pageSize + 1}-${Math.min(bookingsTotal, page * pageSize)}` : 0} of {bookingsTotal} bookings
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || bookingsLoading}
            className="px-3 py-1 text-xs font-medium text-white bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(bookingsPages, p + 1))}
            disabled={page >= bookingsPages || bookingsLoading}
            className="px-3 py-1 text-xs font-medium text-white bg-white/5 rounded hover:bg-white/10 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
