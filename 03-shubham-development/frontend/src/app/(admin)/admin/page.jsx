"use client";

import { useMemo, useState } from "react";
import AdminTopbar from "components/admin/dashboard/AdminTopbar";
import StatCard from "components/admin/dashboard/StatCard";
import RevenueOverview from "components/admin/dashboard/RevenueOverview";
import OccupancyCard from "components/admin/dashboard/OccupancyCard";
import BookingsTable from "components/admin/dashboard/BookingsTable";
import { useQueryDashboardOverview } from "@queries/dashboard";
import { CalendarCheck, CircleDollarSign, Clock3, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "contexts/AuthProvider";

export default function AdminDashboardPage() {
  const profile = useAuth().user || {};

  const { data: dashboard, isLoading: loading, isError: isQueryError, error: queryError } = useQueryDashboardOverview({
    onError: (err) => {
      try { toast.error(err?.response?.data?.message || err?.message || 'Failed to load dashboard'); } catch (e) { /* ignore */ }
    }
  });

  const stats = useMemo(() => {
    const totals = dashboard?.totals || {};
    return [
      {
        title: "Total Bookings",
        value: String(totals.bookings ?? 0),
        trend: "",
        tone: "positive",
        tag: `${totals.completed ?? 0} completed`,
        icon: CalendarCheck,
      },
      {
        title: "Revenue (last 6 months)",
        value: `NPR ${Number(totals.revenue || 0).toLocaleString()}`,
        trend: "",
        tone: "positive",
        tag: "",
        icon: CircleDollarSign,
      },
      {
        title: "Pending",
        value: String(totals.pending ?? 0),
        trend: "",
        tone: "negative",
        tag: "pending",
        icon: Clock3,
      },
      {
        title: "Upcoming events",
        value: String(dashboard?.upcoming?.length ?? 0),
        trend: "",
        tone: "neutral",
        tag: "",
        icon: Sparkles,
      },
    ];
  }, [dashboard]);

  const revenuePoints = dashboard?.revenue?.points || [];
  const revenueLabels = dashboard?.revenue?.labels || [];

  const currencyFormatter = new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR", maximumFractionDigits: 0 });

  const bookings = useMemo(() => {
    return (dashboard?.recentBookings || []).map((b) => {
      const date = b.date ? new Date(b.date).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" }) : "-";
      const amount = b.amount != null ? currencyFormatter.format(Number(b.amount)) : "-";
      return { ...b, date, amount };
    });
  }, [dashboard]);

  const occupancyDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const label = d.getDate();
      const match = (dashboard?.upcoming || []).find((u) => new Date(u.date).toDateString() === d.toDateString());
      days.push({ label, highlight: match ? "primary" : undefined });
    }
    return days;
  }, [dashboard]);

  const schedule = (dashboard?.upcoming || []).map((u) => ({
    title: u.title,
    time: u.time,
    color: "bg-[var(--admin-primary)]",
  }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Dashboard Overview" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back, Admin</h1>
              <p className="text-[var(--admin-muted)]">
                {loading ? "Loading analytics..." : "Here is what is happening with your business trends."}
              </p>
            </div>
            <button className="bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-dark)] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-[var(--admin-primary)]/25 transition-all flex items-center gap-2">
              <span className="text-lg leading-none">+</span>
              New Booking
            </button>
          </div>

          {isQueryError ? (
            <div className="bg-red-900/40 border border-red-700 text-red-100 px-4 py-3 rounded-lg">{String(queryError?.response?.data?.message || queryError?.message || 'Failed to load dashboard')}</div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueOverview heading="Revenue Overview" points={revenuePoints} labels={revenueLabels} />
            <OccupancyCard monthLabel="Next 14 days" days={occupancyDays} schedule={schedule} />
          </div>

          <BookingsTable bookings={bookings} />
        </div>
      </div>
    </div>
  )
}