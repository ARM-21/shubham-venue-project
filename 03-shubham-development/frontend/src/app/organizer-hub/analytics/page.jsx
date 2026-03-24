'use client';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, CheckCircle2, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import BreadcrumbNav from 'components/organizer/BreadcrumbNav';
import { useQueryOrganizerAnalytics } from '@queries/organizer/analytics';

export default function Analytics() {
  const { data: analyticsData, isLoading, isError, error } = useQueryOrganizerAnalytics();

  // Extract stats from analytics data
  const stats = analyticsData?.stats || {
    totalEvents: 0,
    totalAttendees: 0,
    checkInRate: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  };

  // Extract chart data
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
      { name: 'Completed', value: 0, color: '#10b981' },
      { name: 'Upcoming', value: 0, color: '#f59e0b' },
      { name: 'Draft', value: 0, color: '#6b7280' },
    ],
  };

  const statCards = [
    { icon: Calendar, label: 'Total Events', value: stats.totalEvents, color: '#3a1224' },
    { icon: Users, label: 'Total Attendees', value: stats.totalAttendees, color: '#C0A04C' },
    { icon: CheckCircle2, label: 'Check-in Rate', value: `${stats.checkInRate}%`, color: '#10b981' },
    { icon: DollarSign, label: 'Total Revenue', value: `$${stats.totalRevenue.toLocaleString()}`, color: '#f59e0b' },
    { icon: TrendingUp, label: 'Upcoming Events', value: stats.upcomingEvents, color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen bg-[#fdfaf6] relative">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-[#3a1224] via-[#3a1224]/80 to-[#fdfaf6] pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-32 pb-20">
        {/* Breadcrumb */}
        <div className="mb-8">
          <BreadcrumbNav />
        </div>

        {/* Header */}
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-[1px] bg-[#C0A04C]" />
            <span className="text-[10px] font-black text-[#C0A04C] uppercase tracking-[0.4em]">Analytics</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-display font-bold text-white mb-4">
            Event <span className="text-[#C0A04C] italic font-serif">Analytics</span>
          </h1>
          <p className="text-white/70 text-base sm:text-lg font-light max-w-2xl">
            Track your event performance, revenue, and attendee engagement metrics.
          </p>
        </header>

        {/* Error State */}
        {isError && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-4">
            <AlertCircle className="text-red-600 mt-1" size={24} />
            <div>
              <p className="text-red-900 font-semibold">Failed to load analytics</p>
              <p className="text-red-700 text-sm">{error?.message || 'Please try refreshing the page.'}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white/95 rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="w-12 h-12 bg-gray-300 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                  <div className="h-8 bg-gray-300 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stat Cards */}
        {!isLoading && !isError && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {statCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-white/95 rounded-2xl shadow-lg border border-[#3a1224]/5 p-6 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C0A04C]/20 to-[#C0A04C]/10 flex items-center justify-center">
                        <Icon size={24} style={{ color: card.color }} />
                      </div>
                    </div>
                    <p className="text-[9px] font-black text-[#3a1224]/40 uppercase tracking-widest mb-2">{card.label}</p>
                    <p className="text-3xl font-black text-[#3a1224]">{card.value}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Revenue & Attendees Trend */}
              <div className="lg:col-span-2 bg-white/95 rounded-3xl shadow-lg border border-[#3a1224]/5 p-8">
                <h2 className="text-2xl font-display font-bold text-[#3a1224] mb-6">Revenue & Attendees Trend</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#C0A04C" strokeWidth={2} dot={{ fill: '#3a1224' }} />
                    <Line type="monotone" dataKey="attendees" stroke="#3a1224" strokeWidth={2} dot={{ fill: '#C0A04C' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Event Status Distribution */}
              <div className="bg-white/95 rounded-3xl shadow-lg border border-[#3a1224]/5 p-8">
                <h2 className="text-2xl font-display font-bold text-[#3a1224] mb-6">Event Status</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={chartData.eventStatus} cx="50%" cy="50%" labelLine={false} label={({ percent }) => `${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                      {chartData.eventStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-6 space-y-2">
                  {chartData.eventStatus.map((status, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="text-[#3a1224]/70">{status.name}</span>
                      <span className="ml-auto font-bold text-[#3a1224]">{status.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Monthly Revenue Bar Chart */}
            <div className="mt-8 bg-white/95 rounded-3xl shadow-lg border border-[#3a1224]/5 p-8">
              <h2 className="text-2xl font-display font-bold text-[#3a1224] mb-6">Monthly Revenue</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#3a1224" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
