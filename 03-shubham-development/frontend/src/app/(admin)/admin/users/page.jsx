"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryUsers } from "@queries/users";
import { ROUTES } from "config/routes";
import AdminTopbar from "components/admin/dashboard/AdminTopbar";
import axiosInstance from "lib/axios";
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
  Search,
  Loader2
} from "lucide-react";
import ViewUserModal from "components/admin/users/ui/ViewUserModal";

// --- Sub-Components ---

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
    return <div className="size-10 rounded-full bg-cover bg-center border border-white/10 shadow-inner" style={{ backgroundImage: `url(${src})` }} />;
  }
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase() || "").join("") || "U";
  return (
    <div className="size-10 rounded-full bg-[#250815] border border-white/10 text-white flex items-center justify-center text-sm font-bold">
      {initials}
    </div>
  );
}

// --- Main Component ---

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [meta, setMeta] = useState({ total: 0, verified: 0, admins: 0 });
  
  // Search & Debounce
  const [searchQuery, setSearchQuery] = useState(""); 
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
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

  // Handle Debounce Logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const params = useMemo(() => {
    const p = { page, q: debouncedSearch || undefined };
    if (filters.role !== "all") p.role = filters.role;
    if (filters.provider !== "all") p.provider = filters.provider;
    if (filters.verification !== "all") p.isVerified = filters.verification === "verified";
    if (filters.active !== "all") p.isActive = filters.active === "active";
    if (filters.organizerStatus !== "all") p.organizerStatus = filters.organizerStatus;
    if (filters.organizerAccess !== "all") p.organizerEnabled = filters.organizerAccess === "enabled";
    return p;
  }, [page, debouncedSearch, filters]);

  const { data: usersData, isLoading: listLoading, isError: listIsError, error: listError, refetch } = useQueryUsers({ params, keepPreviousData: true });

  useEffect(() => {
    if (usersData) {
      setUsers(usersData.users || []);
      setMeta({
        total: usersData.total || 0,
        verified: usersData.verified || 0,
        admins: usersData.admins || 0,
      });
      setPages(usersData.pages || 1);
      setError(null);
    }
  }, [usersData]);

  useEffect(() => {
    if (listIsError) setError(listError?.message || "Failed to load users");
  }, [listIsError, listError]);

  const stats = useMemo(() => [
    { label: "Total Users", value: meta.total, icon: UserIcon },
    { label: "Verified", value: meta.verified, icon: CheckCircle2 },
    { label: "Admins", value: meta.admins, icon: Shield },
  ], [meta]);

  const rows = useMemo(() => users.map((u) => ({
    id: u.id || u._id,
    name: u.name || u.username || u.email,
    email: u.email,
    phone: u.phone,
    role: (u.role || "customer").toUpperCase(),
    provider: (u.provider || "local").toUpperCase(),
    joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" }) : "—",
    status: { tone: u.isVerified ? "positive" : "warning", label: u.isVerified ? "Verified" : "Unverified" },
    avatar: u.profilePicture,
    isActive: u.isActive !== false,
    organizerStatus: (u.organizerStatus || "none").toUpperCase(),
    organizerEnabled: !!u.organizerEnabled,
    raw: u,
  })), [users]);

  // --- Action Handlers ---

  const executeAction = async (id, actionFn, successMsg) => {
    setOpenMenuId(null);
    setActionLoadingId(id);
    try {
      await actionFn();
      setActionMessage(successMsg);
      await refetch();
    } catch (err) {
      setError(err?.response?.data?.message || "Action failed");
    } finally {
      setActionLoadingId(id);
    }
  };

  const handleToggleActive = (row) => 
    executeAction(row.id, () => axiosInstance.patch(ROUTES.API.ADMIN.USER_STATUS(row.id), { isActive: !row.isActive }), 
    row.isActive ? "User disabled" : "User enabled");

  const handleRoleChange = (row) => {
    const nextRole = row.role === "ADMIN" ? "customer" : "admin";
    executeAction(row.id, () => axiosInstance.patch(ROUTES.API.ADMIN.USER_ROLE(row.id), { role: nextRole }), 
    `Role updated to ${nextRole.toUpperCase()}`);
  };

  const handleOrganizer = (row, nextStatus) => {
    const targetStatus = nextStatus || (row.organizerEnabled ? "none" : "approved");
    executeAction(row.id, () => axiosInstance.patch(ROUTES.API.ADMIN.USER_ORGANIZER(row.id), { status: targetStatus }), 
    "Organizer status updated");
  };

  const handleExport = () => {
    const headers = ["Name", "Email", "Role", "Provider", "Status", "Organizer", "Joined"];
    const csvContent = [
      headers.join(","),
      ...rows.map(r => [`"${r.name}"`, r.email, r.role, r.provider, r.status.label, r.organizerEnabled ? "Enabled" : "Disabled", r.joined].join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shubham-users-p${page}.csv`;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="User Management" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-8 pb-10">
          
          {/* Notifications */}
          {error && <div className="bg-red-900/40 border border-red-800 text-red-100 px-4 py-3 rounded-lg text-sm flex justify-between">
            {error} <button onClick={() => setError(null)}>×</button>
          </div>}
          
          {actionMessage && <div className="bg-emerald-900/40 border border-emerald-800 text-emerald-100 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
            <span>{actionMessage}</span>
            <button className="text-emerald-200 text-xs" onClick={() => setActionMessage(null)}>Dismiss</button>
          </div>}

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Manage Users</h1>
              <p className="text-[var(--admin-muted)] text-sm">Control access, verify accounts, and manage organizer permissions.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--admin-surface)] border border-white/10 text-white hover:border-[var(--admin-primary)]/50 transition-all text-sm font-medium">
                <Download className="size-4" /> Export CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--admin-primary)] text-white hover:brightness-110 border border-[var(--admin-primary)] transition-all shadow-lg shadow-[var(--admin-primary)]/20 text-sm font-bold">
                <Plus className="size-4" /> Invite User
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="relative overflow-hidden flex flex-col gap-1 rounded-xl p-6 bg-[var(--admin-surface)] border border-white/5 group hover:border-[var(--admin-primary)]/40 transition-colors shadow-lg">
                <stat.icon className="absolute -right-2 -top-2 size-16 text-[var(--admin-primary)] opacity-10 group-hover:opacity-20 transition-opacity" />
                <p className="text-[var(--admin-muted)] text-sm font-medium">{stat.label}</p>
                <p className="text-white text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filters & Search */}
          <div className="bg-[var(--admin-surface)]/80 backdrop-blur rounded-xl border border-white/10 p-5 shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-muted)] size-4" />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-11 pr-4 text-white text-sm focus:ring-1 focus:ring-[var(--admin-primary)] transition-all"
                  placeholder="Search name or email..."
                  value={searchQuery}
                  onChange={(e) => { setPage(1); setSearchQuery(e.target.value); }}
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Simplified filter set */}
                {['role', 'provider', 'verification', 'active'].map((key) => (
                  <select
                    key={key}
                    className="bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[var(--admin-primary)] outline-none capitalize"
                    value={filters[key]}
                    onChange={(e) => { setPage(1); setFilters(f => ({ ...f, [key]: e.target.value })); }}
                  >
                    <option value="all">All {key}s</option>
                    {key === 'role' && <><option value="customer">Customers</option><option value="admin">Admins</option></>}
                    {key === 'verification' && <><option value="verified">Verified</option><option value="unverified">Unverified</option></>}
                    {key === 'active' && <><option value="active">Active Only</option><option value="inactive">Disabled</option></>}
                  </select>
                ))}
                
                <button 
                  onClick={() => { setPage(1); setFilters({ role: "all", provider: "all", verification: "all", active: "all", organizerStatus: "all", organizerAccess: "all" }); }}
                  className="px-4 py-2 text-xs text-[var(--admin-muted)] hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-(--admin-surface) border border-white/5 rounded-xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[var(--admin-muted)]">
                <thead className="bg-white/5 text-[10px] uppercase tracking-wider font-bold text-white border-b border-white/5">
                  <tr>
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Role / Provider</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Organizer</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {listLoading ? (
                    <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin inline mr-2" /> Fetching data...</td></tr>
                  ) : rows.map((row) => (
                    <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={row.name} src={row.avatar} />
                          <div className="flex flex-col max-w-[180px]">
                            <span className="truncate text-white font-medium">{row.name}</span>
                            <span className="truncate text-[10px] opacity-60">{row.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-white text-xs">{row.role}</span>
                          <span className="text-[10px] opacity-50">{row.provider}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge tone={row.status.tone}>{row.status.label}</StatusBadge>
                      </td>
                      <td className="px-6 py-4">
                        <Pill tone={row.organizerEnabled ? "info" : "neutral"}>
                          {row.organizerEnabled ? "Active" : row.organizerStatus}
                        </Pill>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="relative inline-flex items-center gap-2">
                          <button onClick={() => setSelectedUserId(row.id)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <Eye className="size-4" />
                          </button>
                          <button 
                            onClick={() => setOpenMenuId(openMenuId === row.id ? null : row.id)}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                          >
                            <MoreHorizontal className="size-4" />
                          </button>

                          {openMenuId === row.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl z-50 py-1 overflow-hidden">
                              <button onClick={() => handleToggleActive(row)} className="w-full px-4 py-2 text-left text-xs hover:bg-white/5 flex items-center gap-2">
                                <Ban className="size-3" /> {row.isActive ? "Disable User" : "Enable User"}
                              </button>
                              <button onClick={() => handleRoleChange(row)} className="w-full px-4 py-2 text-left text-xs hover:bg-white/5 flex items-center gap-2">
                                <Shield className="size-3" /> {row.role === "ADMIN" ? "Demote" : "Make Admin"}
                              </button>
                              
                              <div className="h-px bg-white/5 my-1" />

                              {row.organizerStatus === "PENDING" ? (
                                <>
                                  <button onClick={() => handleOrganizer(row, "approved")} className="w-full px-4 py-2 text-left text-xs text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2">
                                    <ShieldCheck className="size-3" /> Approve Organizer
                                  </button>
                                  <button onClick={() => handleOrganizer(row, "rejected")} className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                                    <XCircle className="size-3" /> Reject Request
                                  </button>
                                </>
                              ) : (
                                <button onClick={() => handleOrganizer(row)} className="w-full px-4 py-2 text-left text-xs hover:bg-white/5 flex items-center gap-2">
                                  <ShieldCheck className="size-3" /> {row.organizerEnabled ? "Revoke Organizer" : "Grant Organizer"}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="bg-white/[0.02] px-6 py-4 border-t border-white/5 flex items-center justify-between text-xs">
              <span className="opacity-50">Showing {rows.length} of {meta.total} users</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all">Prev</button>
                <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all">Next</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedUserId && <ViewUserModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
    </div>
  );
}