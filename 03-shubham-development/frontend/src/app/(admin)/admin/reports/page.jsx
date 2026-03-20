"use client";

import AdminTopbar from "@/components/admin/dashboard/AdminTopbar";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/lib/axios";
import { ROUTES } from "@/config/routes";

export default function AdminReportsPage() {
  const [metrics, setMetrics] = useState({ revenue: "-", pending: "-", profit: "-" });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function fetchReports() {
      try {
        setLoading(true);
        const [summaryRes, txRes] = await Promise.all([
          axiosInstance.get(ROUTES.API.ADMIN.REPORTS.SUMMARY),
          axiosInstance.get(ROUTES.API.ADMIN.REPORTS.TRANSACTIONS + "?limit=10"),
        ]);

        if (!mounted) return;

        const totals = summaryRes.data?.totals || {};
        setMetrics({ revenue: `NPR ${Number(totals.revenue || 0).toLocaleString()}`, pending: `NPR ${Number(totals.pending || 0).toLocaleString()}`, profit: "NPR 0" });

        const mapPaymentStatus = (s) => {
          if (!s) return { key: "UNKNOWN", label: "Unknown" };
          const v = String(s).toUpperCase();
          if (v === "COMPLETED") return { key: v, label: "Paid" };
          if (v === "INITIATED") return { key: v, label: "Pending" };
          if (v === "FAILED") return { key: v, label: "Failed" };
          if (v === "REFUNDED") return { key: v, label: "Refunded" };
          return { key: v, label: v.charAt(0) + v.slice(1).toLowerCase() };
        };

        const tx = (txRes.data?.transactions || []).map((t) => {
          const ps = mapPaymentStatus(t.status);
          return {
            id: t.transactionId || t.id,
            name: t.client,
            event: t.event,
            date: t.date ? new Date(t.date).toLocaleDateString() : "-",
            amount: t.amount != null ? `NPR ${Number(t.amount).toLocaleString()}` : "-",
            paymentStatus: ps.key,
            paymentLabel: ps.label,
          };
        });
        setTransactions(tx);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Payments & Reports" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Financial Overview</h2>
              <p className="text-[var(--admin-muted)] mt-1 text-sm font-medium">Monitor revenue streams, track pending payments, and export reports.</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#4a1d2f] border border-gray-200 dark:border-white/10 rounded-lg text-gray-700 dark:text-gray-200 text-sm font-medium">This Month</button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-dark)] text-white rounded-lg text-sm font-medium">Download Report</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#4a1d2f] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-rose-200/70">Total Revenue (Month)</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">{metrics.revenue}</h3>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs text-gray-400 dark:text-gray-400">vs last month</span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#4a1d2f] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-rose-200/70">Pending Payments</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">{metrics.pending}</h3>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs text-gray-400 dark:text-gray-400">needs attention</span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#4a1d2f] border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-rose-200/70">Net Profit</p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1 tracking-tight">{metrics.profit}</h3>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs text-gray-400 dark:text-gray-400">margin maintained</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-[#4a1d2f] rounded-xl border border-gray-200 dark:border-white/5 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Analytics</h3>
                <div className="flex gap-2">
                  <select className="bg-gray-50 dark:bg-[#2a0d1a] border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 text-xs rounded-lg focus:ring-[var(--admin-primary)] focus:border-[var(--admin-primary)]">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>
              <div className="h-64 w-full flex items-end justify-between gap-2 md:gap-4 px-2">
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="w-full bg-[var(--admin-primary)]/20 dark:bg-rose-900/40 rounded-t-sm h-[40%] relative" />
                  <span className="text-xs text-gray-400 dark:text-gray-400">Mon</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="w-full bg-[var(--admin-primary)]/20 dark:bg-rose-900/40 rounded-t-sm h-[65%] relative" />
                  <span className="text-xs text-gray-400 dark:text-gray-400">Tue</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="w-full bg-[var(--admin-primary)]/20 dark:bg-rose-900/40 rounded-t-sm h-[35%] relative" />
                  <span className="text-xs text-gray-400 dark:text-gray-400">Wed</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="w-full bg-[var(--admin-primary)]/20 dark:bg-rose-900/40 rounded-t-sm h-[50%] relative" />
                  <span className="text-xs text-gray-400 dark:text-gray-400">Thu</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="w-full bg-[var(--admin-primary)] dark:bg-rose-600 rounded-t-sm h-[85%] relative shadow-[0_0_15px_rgba(179,15,15,0.4)]" />
                  <span className="text-xs text-[var(--admin-primary)] font-bold dark:text-rose-400">Fri</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="w-full bg-[var(--admin-primary)]/20 dark:bg-rose-900/40 rounded-t-sm h-[95%] relative" />
                  <span className="text-xs text-gray-400 dark:text-gray-400">Sat</span>
                </div>
                <div className="flex flex-col items-center gap-2 w-full group">
                  <div className="w-full bg-[var(--admin-primary)]/20 dark:bg-rose-900/40 rounded-t-sm h-[60%] relative" />
                  <span className="text-xs text-gray-400 dark:text-gray-400">Sun</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-[var(--admin-primary)] dark:bg-rose-800 bg-opacity-90 rounded-xl p-6 text-white relative overflow-hidden shadow-lg">
                <h3 className="text-lg font-bold mb-2">Generate Reports</h3>
                <p className="text-primary-100 dark:text-rose-100 text-sm mb-6">Quickly export financial data for your team or accountant.</p>
                <div className="flex flex-col gap-3">
                  <button className="flex items-center justify-between w-full px-4 py-3 bg-white text-[var(--admin-primary)] rounded-lg text-sm font-bold">Export to Excel</button>
                  <button className="flex items-center justify-between w-full px-4 py-3 bg-black/20 text-white rounded-lg text-sm font-bold">Export to PDF</button>
                </div>
              </div>
              <div className="bg-white dark:bg-[#4a1d2f] rounded-xl border border-l-4 border-l-red-500 border-gray-200 dark:border-white/5 p-5 shadow-sm">
                <div className="flex gap-3">
                  <div className="bg-red-100 dark:bg-red-500/10 p-2 rounded-full h-fit text-red-600 dark:text-red-400">!</div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Overdue Payment</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">Booking #HB-2024-002 (Smith Wedding) is 3 days overdue.</p>
                    <button className="mt-3 text-xs font-bold text-[var(--admin-primary)] hover:underline">Send Reminder</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#4a1d2f] rounded-xl border border-gray-200 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <select className="pl-9 pr-8 py-2 bg-gray-50 dark:bg-[#2a0d1a] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-200 appearance-none">
                    <option>All Statuses</option>
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Overdue</option>
                  </select>
                </div>
                <div className="relative">
                  <input className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#2a0d1a] border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-700 dark:text-gray-200 w-40" placeholder="Filter by date" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#2a0d1a]/50 border-b border-gray-200 dark:border-white/5">
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Transaction ID</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Client / Event</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Date</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Amount</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 dark:text-rose-100">{t.id}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/20 dark:bg-rose-500/20 flex items-center justify-center text-primary dark:text-rose-300 text-xs font-bold ring-1 ring-primary/30">{t.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{t.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{t.event}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">{t.date}</td>
                      <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">{t.amount}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${t.paymentLabel === 'Paid' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300' : t.paymentLabel === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300' : t.paymentLabel === 'Failed' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {t.paymentLabel}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-gray-400 hover:text-[var(--admin-primary)] dark:hover:text-rose-400 transition-colors p-1 rounded">Download</button>
                        <button className="text-gray-400 hover:text-[var(--admin-primary)] dark:hover:text-rose-400 transition-colors p-1 rounded ml-1">More</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-white/5 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">Showing 1-5 of 42 transactions</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400 disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 rounded border border-gray-200 dark:border-white/10 text-sm bg-[var(--admin-primary)] dark:bg-rose-700 text-white">1</button>
                <button className="px-3 py-1 rounded border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400">2</button>
                <button className="px-3 py-1 rounded border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400">3</button>
                <button className="px-3 py-1 rounded border border-gray-200 dark:border-white/10 text-sm text-gray-600 dark:text-gray-400">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
