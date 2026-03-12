"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ROUTES } from "@/config/routes";
import AdminTopbar from "@/components/admin/dashboard/AdminTopbar";
import axiosInstance from "@/lib/axios";
import {
  Ban,
  CheckCircle2,
  Download,
  Eye,
  Filter,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  RotateCw,
  Shield,
  ShieldCheck,
  Trash2,
  User as UserIcon,
  XCircle,
} from "lucide-react";
import { Search } from "lucide-react";

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

function Pill({ tone = "neutral", children }) {
  const palette = {
    positive: "bg-emerald-900/40 text-emerald-300 border border-emerald-800",
    warning: "bg-yellow-900/40 text-yellow-300 border border-yellow-800",
    danger: "bg-red-900/40 text-red-300 border border-red-800",
    info: "bg-indigo-900/40 text-indigo-300 border border-indigo-800",
    neutral: "bg-white/5 text-white border border-white/10",
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${palette[tone]}`}>{children}</span>;
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
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [filters, setFilters] = useState({
    role: "all",
    provider: "all",
    verification: "all",
    active: "all",
    organizerStatus: "all",
    organizerAccess: "all",
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, q: search || undefined };

      if (filters.role !== "all") params.role = filters.role;
      if (filters.provider !== "all") params.provider = filters.provider;
      if (filters.verification !== "all") params.isVerified = filters.verification === "verified";
      if (filters.active !== "all") params.isActive = filters.active === "active";
      if (filters.organizerStatus !== "all") params.organizerStatus = filters.organizerStatus;
      if (filters.organizerAccess !== "all") params.organizerEnabled = filters.organizerAccess === "enabled";

      const res = await axiosInstance.get(ROUTES.API.ADMIN.USERS, { params });
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
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
        const organizerEnabled = Boolean(u.organizerEnabled ?? u.isOrganizerEligible);
        const organizerStatus = (u.organizerStatus || "none").toUpperCase();
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
          isActive: u.isActive !== false,
          organizerStatus,
          organizerEnabled,
          raw: u,
        };
      }),
    [users],
  );

  const canPrev = page > 1;
  const canNext = page < pages;

  const handleView = async (userId) => {
    try {
      const res = await axiosInstance.get(ROUTES.API.ADMIN.USER(userId));
      setViewUser(res.data.user || null);
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load user");
    }
  };

  const handleToggleActive = async (row) => {
    try {
      setActionLoadingId(row.id);
      await axiosInstance.patch(ROUTES.API.ADMIN.USER_STATUS(row.id), { isActive: !row.isActive });
      setActionMessage(row.isActive ? "User disabled" : "User enabled");
      setOpenMenuId(null);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update user status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReset = async (row) => {
    try {
      if ((row.raw?.provider || "").toLowerCase() === "google") {
        setError("Password is managed by Google for this account");
        return;
      }
      setActionLoadingId(row.id);
      await axiosInstance.post(ROUTES.API.ADMIN.USER_RESET(row.id));
      setActionMessage("Password reset link sent");
      setOpenMenuId(null);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to send reset link");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOrganizer = async (row, nextStatus) => {
    try {
      setActionLoadingId(row.id);
      const targetStatus = nextStatus || (row.organizerEnabled ? "none" : "approved");
      await axiosInstance.patch(ROUTES.API.ADMIN.USER_ORGANIZER(row.id), { status: targetStatus });
      const messageByStatus = {
        approved: "Organizer access approved",
        rejected: "Organizer request rejected",
        none: "Organizer access revoked",
        pending: "Organizer status updated",
      };
      setActionMessage(messageByStatus[targetStatus] || "Organizer status updated");
      setOpenMenuId(null);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to update organizer status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (row) => {
    const confirmed = typeof window !== "undefined" ? window.confirm(`Delete ${row.name}? This cannot be undone.`) : false;
    if (!confirmed) return;
    try {
      setActionLoadingId(row.id);
      await axiosInstance.delete(ROUTES.API.ADMIN.USER(row.id));
      setActionMessage("User deleted");
      setOpenMenuId(null);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="User Management" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-10">
          {error ? (
            <div className="bg-red-900/40 border border-red-800 text-red-100 px-4 py-3 rounded-lg text-sm">{error}</div>
          ) : null}

          {actionMessage ? (
            <div className="bg-emerald-900/40 border border-emerald-800 text-emerald-100 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
              <span>{actionMessage}</span>
              <button className="text-emerald-200 text-xs" onClick={() => setActionMessage(null)}>
                Dismiss
              </button>
            </div>
          ) : null}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
       
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

          <div className="bg-[var(--admin-surface)]/80 backdrop-blur rounded-xl border border-white/10 p-5 shadow-lg shadow-black/20">
            <div className="flex flex-col gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] size-4" />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-11 pr-4 text-white text-sm placeholder:text-[var(--admin-muted)]/70 focus:ring-1 focus:ring-[var(--admin-primary)] focus:border-[var(--admin-primary)] transition-all"
                  placeholder="Search name or email"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-[var(--admin-primary)] focus:border-[var(--admin-primary)]"
                  value={filters.role}
                  onChange={(e) => {
                    setPage(1);
                    setFilters((f) => ({ ...f, role: e.target.value }));
                  }}
                >
                  <option value="all">All roles</option>
                  <option value="customer">Customers</option>
                  <option value="admin">Admins</option>
                </select>
                <select
                  className="bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-[var(--admin-primary)] focus:border-[var(--admin-primary)]"
                  value={filters.provider}
                  onChange={(e) => {
                    setPage(1);
                    setFilters((f) => ({ ...f, provider: e.target.value }));
                  }}
                >
                  <option value="all">All providers</option>
                  <option value="local">Local</option>
                  <option value="google">Google</option>
                </select>
                <select
                  className="bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-[var(--admin-primary)] focus:border-[var(--admin-primary)]"
                  value={filters.verification}
                  onChange={(e) => {
                    setPage(1);
                    setFilters((f) => ({ ...f, verification: e.target.value }));
                  }}
                >
                  <option value="all">Verification</option>
                  <option value="verified">Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
                <select
                  className="bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-[var(--admin-primary)] focus:border-[var(--admin-primary)]"
                  value={filters.active}
                  onChange={(e) => {
                    setPage(1);
                    setFilters((f) => ({ ...f, active: e.target.value }));
                  }}
                >
                  <option value="all">Active</option>
                  <option value="active">Active</option>
                  <option value="inactive">Disabled</option>
                </select>
                <select
                  className="bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-[var(--admin-primary)] focus:border-[var(--admin-primary)]"
                  value={filters.organizerStatus}
                  onChange={(e) => {
                    setPage(1);
                    setFilters((f) => ({ ...f, organizerStatus: e.target.value }));
                  }}
                >
                  <option value="all">Organizer status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="none">None</option>
                </select>
                <select
                  className="bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:ring-1 focus:ring-[var(--admin-primary)] focus:border-[var(--admin-primary)]"
                  value={filters.organizerAccess}
                  onChange={(e) => {
                    setPage(1);
                    setFilters((f) => ({ ...f, organizerAccess: e.target.value }));
                  }}
                >
                  <option value="all">Organizer access</option>
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
                <button
                  className="px-4 py-2.5 rounded-lg border border-white/10 text-sm text-[var(--admin-muted)] hover:text-white hover:border-[var(--admin-primary)]/60 transition-colors flex items-center gap-2"
                  onClick={() => {
                    setPage(1);
                    setFilters({ role: "all", provider: "all", verification: "all", active: "all", organizerStatus: "all", organizerAccess: "all" });
                  }}
                >
                  <Filter className="size-4" />
                  Clear filters
                </button>
                <button
                  className="px-4 py-2.5 rounded-lg border border-white/10 text-sm text-[var(--admin-muted)] hover:text-white hover:border-[var(--admin-primary)]/60 transition-colors"
                  onClick={() => fetchUsers()}
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[var(--admin-surface)] border border-white/5 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--admin-muted)] table-fixed">
                <thead className="bg-[var(--admin-primary)]/20 text-xs uppercase font-semibold text-white border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Verification</th>
                    <th className="px-6 py-4">Active</th>
                    <th className="px-6 py-4">Organizer Access</th>
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
                        <td className="px-6 py-4 font-medium text-white">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar name={row.name} src={row.avatar} />
                            <div className="flex flex-col min-w-0">
                              <span className="truncate max-w-[200px]" title={row.name}>{row.name}</span>
                              <span className="text-xs text-[var(--admin-muted)] flex items-center gap-1 truncate max-w-[200px]" title={row.phone || "Not provided"}>
                                <Phone className="size-3" />
                                {row.phone || "Not provided"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-2 min-w-0">
                          <Mail className="size-4 text-[var(--admin-muted)]" />
                          <span className="truncate max-w-[240px]" title={row.email}>{row.email}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.provider}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge tone={row.status.tone}>
                            {row.status.tone === "positive" ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                            {row.status.label}
                          </StatusBadge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Pill tone={row.isActive ? "positive" : "danger"}>{row.isActive ? "Active" : "Disabled"}</Pill>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {(() => {
                            const tone = row.organizerEnabled
                              ? "info"
                              : row.organizerStatus === "PENDING"
                                ? "warning"
                                : row.organizerStatus === "REJECTED"
                                  ? "danger"
                                  : "neutral";
                            const label = row.organizerEnabled
                              ? "Enabled"
                              : row.organizerStatus === "PENDING"
                                ? "Pending"
                                : row.organizerStatus === "REJECTED"
                                  ? "Rejected"
                                  : "None";
                            return <Pill tone={tone}>{label}</Pill>;
                          })()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{row.joined}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="relative inline-flex items-center gap-2">
                            <button
                              onClick={() => handleView(row.id)}
                              className="text-[var(--admin-muted)] hover:text-white transition-colors text-sm flex items-center gap-1"
                            >
                              <Eye className="size-4" />
                              View
                            </button>
                            <button
                              onClick={() => setOpenMenuId((prev) => (prev === row.id ? null : row.id))}
                              className="p-2 rounded hover:bg-white/5 text-[var(--admin-muted)] hover:text-white"
                            >
                              <MoreHorizontal className="size-4" />
                            </button>
                            {openMenuId === row.id ? (
                              <div className="absolute right-0 top-full mt-2 min-w-[180px] rounded-lg border border-white/10 bg-[var(--admin-bg)] shadow-lg z-10">
                                <div className="flex flex-col divide-y divide-white/5">
                                  <button
                                    onClick={() => handleToggleActive(row)}
                                    className="px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                                    disabled={actionLoadingId === row.id}
                                  >
                                    <Ban className="size-4" /> {row.isActive ? "Disable" : "Enable"}
                                  </button>
                                  {(row.raw?.provider || "").toLowerCase() !== "google" ? (
                                    <button
                                      onClick={() => handleReset(row)}
                                      className="px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                                      disabled={actionLoadingId === row.id}
                                    >
                                      <RotateCw className="size-4" /> Send reset link
                                    </button>
                                  ) : null}
                                  {row.organizerStatus === "PENDING" && !row.organizerEnabled ? (
                                    <>
                                      <button
                                        onClick={() => handleOrganizer(row, "approved")}
                                        className="px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                                        disabled={actionLoadingId === row.id}
                                      >
                                        <ShieldCheck className="size-4" />
                                        Approve organizer request
                                      </button>
                                      <button
                                        onClick={() => handleOrganizer(row, "rejected")}
                                        className="px-3 py-2 text-left text-sm text-red-300 hover:bg-red-900/20 flex items-center gap-2"
                                        disabled={actionLoadingId === row.id}
                                      >
                                        <XCircle className="size-4" />
                                        Reject organizer request
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() => handleOrganizer(row)}
                                      className="px-3 py-2 text-left text-sm text-white hover:bg-white/10 flex items-center gap-2"
                                      disabled={actionLoadingId === row.id}
                                    >
                                      <ShieldCheck className="size-4" />
                                      {row.organizerEnabled ? "Revoke organizer access" : "Grant organizer access"}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDelete(row)}
                                    className="px-3 py-2 text-left text-sm text-red-300 hover:bg-red-900/20 flex items-center gap-2"
                                    disabled={actionLoadingId === row.id}
                                  >
                                    <Trash2 className="size-4" /> Delete
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
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

        {viewUser ? (
          <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
            <div className="bg-[var(--admin-surface)] border border-white/10 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">User Details</h3>
                <button className="text-[var(--admin-muted)] hover:text-white" onClick={() => setViewUser(null)}>
                  ✕
                </button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Avatar name={viewUser.name} src={viewUser.profilePicture} />
                <div className="flex flex-col">
                  <span className="text-white font-semibold">{viewUser.name}</span>
                  <span className="text-[var(--admin-muted)] text-sm">{viewUser.email}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-[var(--admin-muted)] text-xs uppercase">Role</p>
                  <p className="text-white font-semibold">{(viewUser.role || "customer").toUpperCase()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-[var(--admin-muted)] text-xs uppercase">Provider</p>
                  <p className="text-white font-semibold">{(viewUser.provider || "local").toUpperCase()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-[var(--admin-muted)] text-xs uppercase">Status</p>
                  <p className="text-white font-semibold">{viewUser.isActive ? "Active" : "Disabled"}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-[var(--admin-muted)] text-xs uppercase">Verified</p>
                  <p className="text-white font-semibold">{viewUser.isVerified ? "Yes" : "No"}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-[var(--admin-muted)] text-xs uppercase">Organizer Status</p>
                  <p className="text-white font-semibold">{(viewUser.organizerStatus || "none").toUpperCase()}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-[var(--admin-muted)] text-xs uppercase">Organizer Access</p>
                  <p className="text-white font-semibold">{viewUser.organizerEnabled || viewUser.isOrganizerEligible ? "Enabled" : "Disabled"}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-[var(--admin-muted)] text-xs uppercase">Organizer Requested</p>
                  <p className="text-white font-semibold">
                    {viewUser.organizerRequestedAt ? new Date(viewUser.organizerRequestedAt).toLocaleString() : "—"}
                  </p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-[var(--admin-muted)] text-xs uppercase">Organizer Note</p>
                  <p className="text-white font-semibold break-words">{viewUser.organizerNote || "—"}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-[var(--admin-muted)] text-xs uppercase">Phone</p>
                  <p className="text-white font-semibold">{viewUser.phone || "—"}</p>
                </div>
              </div>
              <div className="mt-4 text-xs text-[var(--admin-muted)]">
                <p>Created: {viewUser.createdAt ? new Date(viewUser.createdAt).toLocaleString() : "—"}</p>
                <p>Updated: {viewUser.updatedAt ? new Date(viewUser.updatedAt).toLocaleString() : "—"}</p>
              </div>
              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 rounded-lg border border-white/10 text-sm text-[var(--admin-muted)] hover:bg-white/5" onClick={() => setViewUser(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
    </div>
  );
}
