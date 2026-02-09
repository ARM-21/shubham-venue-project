import AdminSidebar from "@/components/admin/dashboard/AdminSidebar";
import AdminTopbar from "@/components/admin/dashboard/AdminTopbar";
import StatCard from "@/components/admin/dashboard/StatCard";
import RevenueOverview from "@/components/admin/dashboard/RevenueOverview";
import OccupancyCard from "@/components/admin/dashboard/OccupancyCard";
import BookingsTable from "@/components/admin/dashboard/BookingsTable";
import {
  CalendarCheck,
  CircleDollarSign,
  Clock3,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Admin Dashboard",
  description: "Overview of hall bookings, revenue, and occupancy",
};

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/admin", active: true },
  { key: "bookings", label: "Bookings", href: "/admin/bookings" },
  { key: "halls", label: "Halls", href: "/admin/halls" },
  { key: "users", label: "Users", href: "/admin/users" },
  { key: "reports", label: "Reports", href: "/admin/reports" },
  { key: "settings", label: "Settings", href: "/admin/settings" },
];

const profile = {
  name: "Admin User",
  email: "admin@hallmanager.com",
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCJ5ZTh_xChOf4u6izYweUsUwxJrANabSnOLiJsq95DU092yVyC5PRnOECe2M-fFQzVjK9o4fD8SCs4rBGPrfwYilY6OpG3_cdZhdDdzRYPiPLu8w5gFM0s9akVg9KP6szTZ_bTWCqL3QFLY2S5-TXaNpMeiHXZ_vzPCrNQvEsNjg1pfT32YWLbahbkYLqHSu-L4fxub8e-4xX4_v4QAP8RZsBUCkX8STahnFHzVndPo_rpyA28Cd2dWkC5ydRzCjIRC0zTktyC9LE",
};

const stats = [
  {
    title: "Total Bookings",
    value: "124",
    trend: "+12% vs last month",
    tone: "positive",
    tag: "+12%",
    icon: CalendarCheck,
  },
  {
    title: "Monthly Revenue",
    value: "$45,200",
    trend: "+5% vs last month",
    tone: "positive",
    tag: "+5%",
    icon: CircleDollarSign,
  },
  {
    title: "Pending Approvals",
    value: "8",
    trend: "-2% vs last week",
    tone: "negative",
    tag: "-2%",
    icon: Clock3,
  },
  {
    title: "Next Event",
    value: "Wedding - Grand Ballroom",
    trend: "Happening tomorrow",
    tone: "neutral",
    tag: "Tomorrow",
    icon: Sparkles,
  },
];

const revenuePoints = [24, 32, 28, 38, 45, 52];
const revenueLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

const occupancyDays = [
  { label: 29, muted: true },
  { label: 30, muted: true },
  { label: 1 },
  { label: 2 },
  { label: 3, highlight: "primary" },
  { label: 4 },
  { label: 5 },
  { label: 6 },
  { label: 7, dot: "bg-green-500" },
  { label: 8 },
  { label: 9 },
  { label: 10 },
  { label: 11, dot: "bg-[var(--admin-primary)]" },
  { label: 12 },
  { label: 13 },
  { label: 14 },
];

const schedule = [
  { title: "Viewing: Hall A", time: "10:00 AM - 11:30 AM", color: "bg-orange-500" },
  { title: "Decor Setup", time: "02:00 PM - 05:00 PM", color: "bg-[var(--admin-primary)]" },
];

const bookings = [
  {
    id: "#BK-2024-001",
    client: "Sarah Mitchell",
    hall: "Grand Ballroom",
    date: "Oct 24, 2024",
    amount: "$4,500",
    status: "confirmed",
    statusLabel: "Confirmed",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcBDY1NNlyZ5LG46932khe2_zGvanEzI_P0imgCYMQcz-6hd2lBgV-q6J4EQBEKq3LCuYz1UvAGwtvzliN3Mnv0AIfzYMbGOdQtxpyriUj_H3TLwGy6GpbVSBwUOLtm7wn3X47Q5Equimz9QStv955fVSy5NNtgcaoCdT6mt4niyE9Fcx1VPxF3p5MrLq8izKGD_g37xqceprSf_3adxy8iy_WOzvNjcchlk33OpnqERY4Gq5YyGiSKh6_e2giALDWkGTauxEAN2I",
  },
  {
    id: "#BK-2024-002",
    client: "John Doe",
    hall: "Garden Suite",
    date: "Nov 12, 2024",
    amount: "$2,100",
    status: "pending",
    statusLabel: "Pending",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCAx8ZgajT8ZWCjRm11noXNaTPR38vxQ4kKPAt92b6mOKbJb-HQr8BS07nxIxXonqmEUjnkZnLg9XBesFG061eLC2jd7JeqmvSw0_B2cP0Hu8Qq7f0Y8LzjSPNOXBAW9j7S8L6S6jp4A7ngSzIdNqD5iqarUqD0BVnkd_LxqStG_uusFzKeON1hxYvqHYH5fY7yOvtYn4UIa2Mv5Sm-FMGFZ5ubukFeLiHx0rynaljggnSteuYZuVAMpuEaTPq8uJKynTyqgJ7aiuM",
  },
  {
    id: "#BK-2024-003",
    client: "Emily Rose",
    hall: "Main Hall",
    date: "Dec 05, 2024",
    amount: "$3,200",
    status: "cancelled",
    statusLabel: "Cancelled",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDjixE6TGhlvfSFSCp172WgJbwDUx-UxPai0WjnVDMDlrJUr6FOyZaacupRzK0hXH6J3-Dq9Ls30Y-rHiiyh0oS973lxtnjds1eBa4EXr2X5YsahND96orSDD0lpFd7We7Ad7Bk5agC-dN8QLhi_uZ-RDALcI80LM3AtWNutJryeoVm0FsHD2Gp58UKtib4gNjNBDtI4sSQ0gVEEna7qR3s-s9nKeVMiStPJaMSR2JFviiGy1o4dyvVdrVvOFSiIiLMzl5821e0pSc",
  },
  {
    id: "#BK-2024-004",
    client: "Michael Scott",
    hall: "Conference Room B",
    date: "Oct 28, 2024",
    amount: "$800",
    status: "review",
    statusLabel: "In Review",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAezR2qMw2CY3jklOjsFy1T90_wO6B2Ba1QCKuZh6PTqdgYJr4HtbEymqevf--u0XZ1FGzxn-OvhIKYpgLSobXVetu1D842NfgNKcV63fkoWj7ZbjQ6vKQs7i_HAX3hhAt9OP96kKlgDVFsuI0lB9xggwudFkP6_mr9A8Q4IbPmmioN_S6FwW7WYZA2x5SvCAkzbrIVVrefaIhMvCrS_MsPsHKQf4xRH5sBaumMMHg7xtUNaQudIeJBeRIv_O6v2Sol_MSbhlh9sXE",
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--admin-bg)] text-white flex overflow-hidden">
      <AdminSidebar navItems={navItems} profile={profile} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar heading="Dashboard Overview" />

        <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-wrap justify-between items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-1">Welcome back, Admin</h1>
                <p className="text-[var(--admin-muted)]">
                  Here is what is happening with your halls today.
                </p>
              </div>
              <button className="bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-dark)] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg shadow-[var(--admin-primary)]/25 transition-all flex items-center gap-2">
                <span className="text-lg leading-none">+</span>
                New Booking
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <RevenueOverview points={revenuePoints} labels={revenueLabels} />
              <OccupancyCard monthLabel="October 2024" days={occupancyDays} schedule={schedule} />
            </div>

            <BookingsTable bookings={bookings} />
          </div>
        </div>
      </div>
    </div>
  );
}
