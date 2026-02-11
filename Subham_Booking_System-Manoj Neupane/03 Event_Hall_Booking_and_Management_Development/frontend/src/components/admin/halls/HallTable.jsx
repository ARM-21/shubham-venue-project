import React from "react";
import StatusBadge from "./StatusBadge";

export default function HallTable({ loading, rows, filteredCount, onEdit, onView }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Detailed Inventory</h2>
        <button className="text-[var(--admin-primary)] text-sm font-medium hover:underline">View All</button>
      </div>
      <div className="bg-[var(--admin-surface)] border border-white/5 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--admin-muted)]">
            <thead className="bg-[var(--admin-primary)]/20 text-xs uppercase font-semibold text-white border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Hall Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Last Booked</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-[var(--admin-muted)] text-sm" colSpan={6}>
                    Loading halls...
                  </td>
                </tr>
              ) : !rows.length ? (
                <tr>
                  <td className="px-6 py-6 text-[var(--admin-muted)] text-sm" colSpan={6}>
                    No halls available.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id || row.name} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3 whitespace-nowrap">
                      <div
                        className="w-10 h-10 rounded bg-cover bg-center bg-[var(--admin-bg)] border border-white/10"
                        style={{ backgroundImage: `url(${row.thumb})` }}
                      />
                      {row.name}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge tone={row.status.tone}>{row.status.label}</StatusBadge>
                    </td>
                    <td className="px-6 py-4">{row.capacity}</td>
                    <td className="px-6 py-4">{row.price}</td>
                    <td className="px-6 py-4">{row.lastBooked}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onView(row.id)}
                        className="text-[var(--admin-primary)] hover:text-white transition-colors text-sm font-medium mr-4"
                      >
                        View
                      </button>
                      <button
                        onClick={() => onEdit(row.id)}
                        className="text-[var(--admin-primary)] hover:text-white transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-[var(--admin-primary)]/10 px-6 py-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-[var(--admin-muted)]">Showing {rows.length} of {filteredCount} halls</span>
          <div className="flex gap-2">
            <button className="p-1 rounded hover:bg-white/5 text-[var(--admin-muted)] hover:text-white disabled:opacity-50">◀</button>
            <button className="p-1 rounded hover:bg-white/5 text-[var(--admin-muted)] hover:text-white">▶</button>
          </div>
        </div>
      </div>
    </div>
  );
}
