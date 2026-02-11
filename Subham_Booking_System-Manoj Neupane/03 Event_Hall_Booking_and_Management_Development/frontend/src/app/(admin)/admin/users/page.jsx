"use client";

import { useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/config/routes";
import AdminTopbar from "@/components/admin/dashboard/AdminTopbar";
import axiosInstance from "@/lib/axios";
import { CheckCircle2, Download, Filter, Mail, Phone, Plus, Search, Shield, User as UserIcon, XCircle } from "lucide-react";

function StatusBadge({ tone = "neutral", children }) {
  const palette = {
    positive: "bg-emerald-900/40 text-emerald-300 border border-emerald-800",
    warning: "bg-yellow-900/40 text-yellow-300 border border-yellow-800",
    danger: "bg-red-900/40 text-red-300 border border-red-800",
    info: "bg-indigo-900/40 text-indigo-300 border border-indigo-800",
    neutral: "bg-white/5 text-white border border-white/10",
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${palette[tone]}`}>{children}</span>;
}

function Avatar({ name = "User", src }) {
  if (src) {
    return <div className="size-10 rounded-full bg-cover bg-center border border-white/10" style={{ backgroundImage: `url(${src})` }} />;
  }
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase?.() || "")
    .join("") || "U";
  return (
    <div className="size-10 rounded-full bg-[var(--admin-bg)] border border-white/10 text-white flex items-center justify-center text-sm font-semibold">
      {initials}
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [meta, setMeta] = useState({ total: 0, verified: 0, admins: 0 });
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    async function fetchUsers() {
      try {
        setLoading(true);
        const res = await axiosInstance.get(ROUTES.API.ADMIN.USERS, {
          params: { page, q: search || undefined },
        });
        if (!active) return;
        const payload = res.data || {};
        setUsers(payload.users || []);
        setMeta({
          total: payload.total || 0,
          verified: payload.verified || 0,
          admins: payload.admins || 0,
        });
        setPages(payload.pages || 1);
        setError(null);
      } catch (err) {
        if (!active) return;
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load users");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchUsers();
    return () => {
      active = false;
    };
  }, [page, search]);

  const stats = useMemo(
    () => [
      { label: "Total Users", value: meta.total, tone: "positive", icon: UserIcon },
      { label: "Verified", value: meta.verified, tone: "info", icon: CheckCircle2 },
      { label: "Admins", value: meta.admins, tone: "warning", icon: Shield },
    ],
    [meta.admins, meta.total, meta.verified],
  );

  const rows = useMemo(
    () =>
      users.map((u) => {
        const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" }) : "—";
        const statusTone = u.isVerified ? "positive" : "warning";
        const statusLabel = u.isVerified ? "Verified" : "Unverified";
        return {
          id: u.id || u._id,
          name: u.name || u.username || u.email,
          email: u.email,
          phone: u.phone,
          role: (u.role || "customer").toUpperCase(),
          provider: (u.provider || "local").toUpperCase(),
          joined,
          status: { tone: statusTone, label: statusLabel },
          avatar: u.profilePicture,
        };
      }),
    [users],
  );

  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="User Management" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-10">
          {error ? (
            <div className="bg-red-900/40 border border-red-800 text-red-100 px-4 py-3 rounded-lg text-sm">{error}</div>
          ) : null}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm text-[var(--admin-muted)]">
                <span className="hover:text-white transition-colors">Home</span>
                <span className="text-xs">/</span>
                <span className="text-white font-medium">Users</span>
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Manage Users</h1>
              <p className="text-[var(--admin-muted)] text-sm">Review access levels, verification status, and contact details.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--admin-surface)] border border-white/10 text-white hover:bg-white/5 hover:border-[var(--admin-primary)]/50 transition-colors text-sm font-medium shadow-sm">
                <Download className="size-4" />
                Export CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)] border border-[var(--admin-primary)] transition-all shadow-lg shadow-[var(--admin-primary)]/30 text-sm font-bold">
                <Plus className="size-4" />
                Invite User
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden flex flex-col gap-1 rounded-xl p-6 bg-[var(--admin-surface)] border border-white/5 group hover:border-[var(--admin-primary)]/50 transition-colors shadow-lg"
              >
                <div className="absolute -right-4 -top-4 text-[var(--admin-primary)] opacity-20 group-hover:opacity-40 transition-opacity">
                  <stat.icon className="size-16" />
                </div>
                <p className="text-[var(--admin-muted)] text-sm font-medium z-10">{stat.label}</p>
                <p className="text-white text-3xl font-bold z-10">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[var(--admin-surface)] rounded-xl border border-white/5 p-4 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] size-4" />
                <input
                  className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm placeholder:text-[var(--admin-muted)]/60 focus:ring-1 focus:ring-[var(--admin-primary)] focus:border-[var(--admin-primary)] transition-all"
                  placeholder="Search name or email"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg border border-white/10 text-[var(--admin-muted)] hover:text-white hover:border-[var(--admin-primary)]/60 transition-colors flex items-center gap-2">
                  <Filter className="size-4" />
                  Filters
                </button>
                <button className="px-4 py-2 rounded-lg border border-white/10 text-[var(--admin-muted)] hover:text-white hover:border-[var(--admin-primary)]/60 transition-colors">
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[var(--admin-surface)] border border-white/5 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--admin-muted)]">
                <thead className="bg-[var(--admin-primary)]/20 text-xs uppercase font-semibold text-white border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td className="px-6 py-6 text-[var(--admin-muted)] text-sm" colSpan={7}>
                        Loading users...
                      </td>
                    </tr>
                  ) : !rows.length ? (
                    <tr>
                      <td className="px-6 py-6 text-[var(--admin-muted)] text-sm" colSpan={7}>
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium text-white flex items-center gap-3 whitespace-nowrap">
                          <Avatar name={row.name} src={row.avatar} />
                          <div className="flex flex-col">
                            <span>{row.name}</span>
                            <span className="text-xs text-[var(--admin-muted)] flex items-center gap-1">
                              <Phone className="size-3" />
                              {row.phone || "Not provided"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2">
                          <Mail className="size-4 text-[var(--admin-muted)]" />
                          <span>{row.email}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.provider}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge tone={row.status.tone}>
                            {row.status.tone === "positive" ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                            {row.status.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.joined}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <button className="text-[var(--admin-muted)] hover:text-white transition-colors text-sm">Manage</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-[var(--admin-primary)]/10 px-6 py-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-[var(--admin-muted)]">Page {page} of {pages} • {meta.total} users</span>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 rounded bg-white/5 text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
                  onClick={() => canPrev && setPage((p) => p - 1)}
                  disabled={!canPrev}
                >
                  Prev
                </button>
                <button
                  className="px-3 py-1 rounded bg-white/5 text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10"
                  onClick={() => canNext && setPage((p) => p + 1)}
                  disabled={!canNext}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
