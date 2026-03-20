"use client";

import AdminTopbar from "components/admin/dashboard/AdminTopbar";
import { useMemo, useState, useRef } from "react";
import { useQueryReportsSummary, useQueryReportsTransactions } from "@queries/report";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { downloadExcelAsCsv, openPrintableReport } from "lib/exportReports";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, Filler);

export default function AdminReportsPage() {
  const { data: summaryData, isLoading: loadingSummary } = useQueryReportsSummary();
  const [preset, setPreset] = useState("30");
  const chartRef = useRef(null);

  const currencyFormatter = new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  });

  const params = useMemo(() => {
    const fmt = (d) => new Date(d).toISOString().slice(0, 10);
    const end = fmt(new Date());
    let start = "";
    if (preset === "7") start = fmt(new Date(Date.now() - 1000 * 60 * 60 * 24 * 6));
    else if (preset === "30") start = fmt(new Date(Date.now() - 1000 * 60 * 60 * 24 * 29));
    else if (preset === "month") {
      const d = new Date();
      start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    }
    const p = { limit: 10 };
    if (start) p.startDate = start;
    if (end) p.endDate = end;
    return p;
  }, [preset]);

  const { data: txData, isLoading: loadingTx } = useQueryReportsTransactions(params);

  const metrics = useMemo(() => {
    const totals = summaryData?.totals || {};
    return {
      revenue: currencyFormatter.format(Number(totals.revenue || 0)),
      pending: currencyFormatter.format(Number(totals.pending || 0)),
      profit: currencyFormatter.format(0),
    };
  }, [summaryData]);

  const transactions = useMemo(() => {
    return (txData?.transactions || []).map((t) => ({
      id: t.transactionId || t.id,
      name: t.client || "Guest",
      event: t.event || "Event",
      date: t.date ? new Date(t.date).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" }) : "-",
      amount: t.amount != null ? currencyFormatter.format(Number(t.amount)) : "-",
      rawAmount: Number(t.amount) || 0,
      paymentLabel: t.status?.toUpperCase() === "COMPLETED" ? "Paid" : "Pending",
    }));
  }, [txData]);

  const chartData = useMemo(() => {
    const chartTxs = [...transactions].reverse();
    return {
      labels: chartTxs.map((t) => t.date),
      datasets: [
        {
          label: "Revenue",
          data: chartTxs.map((t) => t.rawAmount),
          backgroundColor: "rgba(179, 15, 15, 0.8)",
          borderColor: "#b30f0f",
          borderWidth: 0,
          borderRadius: 6,
          hoverBackgroundColor: "#e11d48",
          barPercentage: 0.5,
        },
      ],
    };
  }, [transactions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a060e",
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "rgba(255,255,255,0.4)", font: { size: 10 } } },
      x: { grid: { display: false }, ticks: { color: "rgba(255,255,255,0.4)", font: { size: 10 } } },
    },
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden ">
      <AdminTopbar heading="Payments & Reports" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Financial Reports</h1>
              <p className="text-(--admin-muted) text-sm font-medium italic">
                {loadingSummary ? "Calculating financial data..." : "Detailed breakdown of your revenue and collections."}
              </p>
            </div>
            <button className="bg-(--admin-primary) hover:brightness-110 text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-[var(--admin-primary)]/20 transition-all">
              Download Full Report
            </button>
          </div>

          {/* Metric Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: "Revenue", value: metrics.revenue, sub: "current period" },
              { label: "Pending", value: metrics.pending, sub: "awaiting clearance" },
              { label: "Net Profit", value: metrics.profit, sub: "estimated profit" },
            ].map((m, i) => (
              <div key={i} className="rounded-2xl  bg-(--admin-surface)   border border-white/5 p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--admin-muted)] mb-2">{m.label}</p>
                <h3 className="text-3xl font-black text-white tracking-tighter">{loadingSummary ? "---" : m.value}</h3>
                <p className="text-[10px] text-[var(--admin-muted)] mt-4 font-bold italic opacity-60 uppercase">{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 bg-(--admin-surface) lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2   rounded-2xl border border-white/5 p-7">
              <div className="flex items-center justify-between mb-10">
                <h3 className="font-bold text-white tracking-tight">Revenue Trends</h3>
                <select
                  value={preset}
                  onChange={(e) => setPreset(e.target.value)}
                  className="bg-transparent border border-white text-(--admin-muted) text-[10px] font-bold uppercase rounded-md px-3 py-1.5 outline-none tracking-widest"
                >
                  <option value="30" className="bg-black">Last 30 Days</option>
                  <option value="7" className="bg-black">Last 7 Days</option>
                  <option value="month" className="bg-black">This Month</option>
                </select>
              </div>
              <div className="h-72">
                {loadingTx ? <div className="h-full w-full bg-white/5 animate-pulse rounded-xl" /> : <Bar data={chartData} options={chartOptions} />}
              </div>
            </div>

            {/* Export Actions */}
            <div className="space-y-6">
              <div className="bg-(--admin-primary) rounded-2xl p-7 text-white shadow-xl shadow-[var(--admin-primary)]/10">
                <h3 className="text-lg font-bold mb-1">Export Data</h3>
                <p className="text-white/60 text-xs mb-8">Generate official financial documents.</p>
                <div className="space-y-3">
                  <button onClick={() => downloadExcelAsCsv("report.csv", transactions)} className="w-full py-3.5 bg-white text-[var(--admin-primary)] rounded-xl text-xs font-black uppercase tracking-widest transition-transform active:scale-95 shadow-lg">Export CSV</button>
                  <button onClick={() => openPrintableReport("Report", transactions)} className="w-full py-3.5 bg-black/20 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black/30 transition-colors">Print PDF</button>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-(--admin-surface) rounded-2xl border border-white/5 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="font-bold text-white tracking-tight text-sm">Detailed Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[700px]">
                <thead>
                  <tr className="bg-white/[0.03] text-[10px] font-black uppercase text-[var(--admin-muted)] tracking-[0.2em] border-b border-white/5">
                    <th className="py-5 px-8">ID</th>
                    <th className="py-5 px-8">Client / Event</th>
                    <th className="py-5 px-8">Date</th>
                    <th className="py-5 px-8">Amount</th>
                    <th className="py-5 px-8">Status</th>
                    <th className="py-5 px-8 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((t) => (
                    <tr key={t.id} className="text-xs hover:bg-white/[0.02] transition-colors group">
                      <td className="py-5 px-8 text-[var(--admin-muted)] font-mono text-[10px]">{t.id}</td>
                      <td className="py-5 px-8">
                        <div className="font-bold text-white leading-tight capitalize">{t.name}</div>
                        <div className="text-[10px] text-[var(--admin-muted)] mt-1 font-medium">{t.event}</div>
                      </td>
                      <td className="py-5 px-8 text-white/50">{t.date}</td>
                      <td className="py-5 px-8 font-black text-white">{t.amount}</td>
                      <td className="py-5 px-8">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          t.paymentLabel === "Paid" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {t.paymentLabel}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <button className="text-[var(--admin-primary)] font-black uppercase text-[10px] tracking-widest hover:underline">Download</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}