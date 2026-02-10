import { MoreVertical } from "lucide-react";
import { ROUTES } from "@/config/routes";

const statusStyles = {
  confirmed: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
  review: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

export default function BookingsTable({ bookings = [] }) {
  return (
    <div className="bg-[var(--admin-surface)] rounded-xl border border-white/5 overflow-hidden">
      <div className="p-6 border-b border-[#3a1a1a] flex justify-between items-center">
        <h3 className="text-white text-lg font-bold">Recent Booking Requests</h3>
        <a className="text-[var(--admin-primary)] text-sm font-medium hover:text-[var(--admin-primary-dark)] transition-colors" href={`${ROUTES.ADMIN.BOOKINGS}`}>
          View All
        </a>
      </div>
      <div className="overflow-x-auto admin-scroll">
        <table className="w-full text-left text-sm text-[var(--admin-muted)]">
          <thead className="bg-[var(--admin-surface-strong)] text-xs uppercase font-medium text-[var(--admin-muted)]">
            <tr>
              <th className="px-6 py-4">Booking ID</th>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Hall</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              {/* <th className="px-6 py-4 text-right">Action</th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3a1a1a]">
            {bookings.map((booking) => {
              const badgeClass = statusStyles[booking.status] ?? statusStyles.pending;
              const badgeText = booking.statusLabel ?? booking.status;

              return (
                <tr key={booking.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{booking.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-9 rounded-full bg-center bg-cover bg-no-repeat"
                        style={{
                          backgroundImage: booking.profilePicture
                            ? `url(${booking.profilePicture})`
                            : "linear-gradient(135deg, #4a1d1d 0%, var(--admin-primary) 100%)",
                        }}
                      />
                      <span className="text-white">{booking.client}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{booking.hall}</td>
                  <td className="px-6 py-4">{booking.date}</td>
                  <td className="px-6 py-4 text-white">{booking.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium border ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </td>
                  {/* <td className="px-6 py-4 text-right">
                    <button className="text-[var(--admin-muted)] hover:text-white p-1">
                      <MoreVertical className="size-4" />
                    </button>
                  </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
