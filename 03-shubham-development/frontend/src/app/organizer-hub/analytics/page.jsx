'use client';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, CalendarDays, CheckCircle2, CircleDollarSign, TrendingUp, Users } from 'lucide-react';
import BreadcrumbNav from 'components/organizer/BreadcrumbNav';
import { useQueryOrganizerAnalytics } from '@queries/organizer/analytics';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getLatestPoint(monthly) {
  return [...monthly].reverse().find((item) => Number(item.revenue || item.attendees || 0) > 0) || monthly[monthly.length - 1] || {};
}

export default function Analytics() {
  const { data: analyticsData, isLoading, isError, error } = useQueryOrganizerAnalytics();

  const stats = analyticsData?.stats || {
    totalEvents: 0,
    totalAttendees: 0,
    checkInRate: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  };

  const chartData = {
    monthly: analyticsData?.monthlyTrend || [
      { month: 'Jan', revenue: 0, attendees: 0 },
      { month: 'Feb', revenue: 0, attendees: 0 },
      { month: 'Mar', revenue: 0, attendees: 0 },
      { month: 'Apr', revenue: 0, attendees: 0 },
      { month: 'May', revenue: 0, attendees: 0 },
      { month: 'Jun', revenue: 0, attendees: 0 },
    ],
    eventStatus: analyticsData?.eventStatus || [
      { name: 'Completed', value: 0, color: '#28705f' },
      { name: 'Upcoming', value: 0, color: '#b8872f' },
      { name: 'Draft', value: 0, color: '#7c6f63' },
    ],
  };

  const latest = getLatestPoint(chartData.monthly);
  const totalStatusCount = chartData.eventStatus.reduce((sum, item) => sum + Number(item.value || 0), 0);

  const statRows = [
    { label: 'Revenue', value: formatCurrency(stats.totalRevenue), note: 'Ticket revenue', icon: CircleDollarSign, emphasis: true },
    { label: 'Attendees', value: stats.totalAttendees, note: 'Registrations tracked', icon: Users },
    { label: 'Check-in rate', value: `${stats.checkInRate || 0}%`, note: 'Checked in at venue', icon: CheckCircle2 },
    { label: 'Events', value: stats.totalEvents, note: `${stats.upcomingEvents || 0} upcoming`, icon: CalendarDays },
  ];

  return (
    <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 pb-10">
      <BreadcrumbNav />

      <header className="overflow-hidden border border-[#e8dcc8] bg-white">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="px-5 py-6 sm:px-7 lg:px-8">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">Analytics</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-[#3a1224] sm:text-4xl">Event performance</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#3a1224]/58">
              Review revenue, registration volume, check-ins, and event status so planning decisions are based on actual activity.
            </p>
          </div>

          <div className="border-t border-[#e8dcc8] bg-[#fbf8f2] p-5 lg:border-l lg:border-t-0 lg:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/42">Latest active month</p>
            <p className="mt-3 text-2xl font-black text-[#3a1224]">{latest.month || '-'}</p>
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-[#e8dcc8] bg-[#e8dcc8]">
              <MiniStat label="Revenue" value={formatCurrency(latest.revenue)} />
              <MiniStat label="Attendees" value={latest.attendees ?? 0} />
            </div>
          </div>
        </div>
      </header>

      {isError && (
        <div className="flex items-start gap-3 border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-bold text-red-900">Failed to load analytics</p>
            <p className="mt-0.5 text-sm text-red-700">{error?.message || 'Please try refreshing the page.'}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSummary />
      ) : !isError ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statRows.map((row) => (
              <MetricCard key={row.label} {...row} />
            ))}
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="border border-[#e8dcc8] bg-white">
              <PanelHeader
                eyebrow="Trend"
                title="Revenue and attendance"
                description="Monthly movement across tracked events. Revenue and attendee lines are shown together to reveal demand quality."
              />
              <div className="h-[360px] px-3 py-5 sm:px-5">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.monthly} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eadfcb" />
                    <XAxis dataKey="month" tick={{ fill: '#6f5a62', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6f5a62', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#b8872f" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="attendees" stroke="#3a1224" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <aside className="flex flex-col gap-5">
              <div className="border border-[#e8dcc8] bg-white">
                <PanelHeader eyebrow="Mix" title="Event status" description="Current event portfolio by lifecycle." compact />
                <div className="h-[220px] px-3 py-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData.eventStatus} cx="50%" cy="50%" innerRadius={48} outerRadius={82} paddingAngle={2} dataKey="value">
                        {chartData.eventStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="divide-y divide-[#e8dcc8] border-t border-[#e8dcc8]">
                  {chartData.eventStatus.map((status) => {
                    const percent = totalStatusCount > 0 ? Math.round((Number(status.value || 0) / totalStatusCount) * 100) : 0;
                    return (
                      <div key={status.name} className="flex items-center gap-3 px-5 py-3 text-sm">
                        <span className="h-2.5 w-2.5" style={{ backgroundColor: status.color }} />
                        <span className="text-[#3a1224]/65">{status.name}</span>
                        <span className="ml-auto font-black text-[#3a1224]">{status.value}</span>
                        <span className="w-10 text-right text-xs font-bold text-[#3a1224]/35">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border border-[#e8dcc8] bg-[#fbf8f2] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/42">Planning signal</p>
                <p className="mt-3 text-sm font-black text-[#3a1224]">
                  {Number(stats.upcomingEvents || 0) > 0 ? `${stats.upcomingEvents} upcoming event${stats.upcomingEvents === 1 ? '' : 's'}` : 'No upcoming events'}
                </p>
                <p className="mt-2 text-xs leading-5 text-[#3a1224]/50">
                  {Number(stats.upcomingEvents || 0) > 0
                    ? 'Use the trend charts to compare expected demand against recent attendance.'
                    : 'Create or publish events before this report can show forward-looking demand.'}
                </p>
              </div>
            </aside>
          </section>

          <section className="border border-[#e8dcc8] bg-white">
            <PanelHeader
              eyebrow="Revenue"
              title="Monthly revenue"
              description="Use this view for payout checks, high-performing months, and event pricing decisions."
            />
            <div className="h-[320px] px-3 py-5 sm:px-5">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.monthly} margin={{ left: 0, right: 12, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eadfcb" />
                  <XAxis dataKey="month" tick={{ fill: '#6f5a62', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6f5a62', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3a1224" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-white px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40">{label}</p>
      <p className="mt-1 text-lg font-black text-[#3a1224]">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, note, icon: Icon, emphasis = false }) {
  return (
    <div className={`border p-5 ${emphasis ? 'border-[#3a1224] bg-[#3a1224] text-white' : 'border-[#e8dcc8] bg-white text-[#3a1224]'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${emphasis ? 'text-white/55' : 'text-[#3a1224]/40'}`}>{label}</p>
          <p className="mt-3 text-3xl font-black">{value}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center border ${emphasis ? 'border-white/15 bg-white/10' : 'border-[#e8dcc8] bg-[#fbf8f2]'}`}>
          <Icon className={`h-5 w-5 ${emphasis ? 'text-[#C0A04C]' : 'text-[#3a1224]/45'}`} />
        </div>
      </div>
      <p className={`mt-3 text-xs leading-5 ${emphasis ? 'text-white/60' : 'text-[#3a1224]/45'}`}>{note}</p>
    </div>
  );
}

function PanelHeader({ eyebrow, title, description, compact = false }) {
  return (
    <div className={`border-b border-[#e8dcc8] px-5 ${compact ? 'py-4' : 'py-5'}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C0A04C]">{eyebrow}</p>
      <h2 className="mt-1 text-base font-black text-[#3a1224]">{title}</h2>
      {description && <p className="mt-1 max-w-2xl text-xs leading-5 text-[#3a1224]/45">{description}</p>}
    </div>
  );
}

function LoadingSummary() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="border border-[#e8dcc8] bg-white p-5">
          <div className="h-3 w-24 animate-pulse bg-[#3a1224]/10" />
          <div className="mt-4 h-8 w-20 animate-pulse bg-[#3a1224]/10" />
          <div className="mt-3 h-3 w-32 animate-pulse bg-[#3a1224]/10" />
        </div>
      ))}
    </div>
  );
}
