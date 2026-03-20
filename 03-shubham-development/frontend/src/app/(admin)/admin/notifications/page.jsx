"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, RotateCw } from "lucide-react";
import AdminTopbar from "components/admin/dashboard/AdminTopbar";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

const PAGE_SIZE = 10;

function formatDateTime(value) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "-";
  }
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(ROUTES.API.ADMIN.NOTIFICATIONS, {
        params: { page, limit: PAGE_SIZE, unreadOnly },
      });
      const payload = res.data || {};
      setNotifications(payload.items || []);
      setTotal(payload.total || 0);
      setUnreadCount(payload.unreadCount || 0);
      setPages(payload.pages || 1);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await axiosInstance.patch(ROUTES.API.ADMIN.NOTIFICATION_READ(id));
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    try {
      await axiosInstance.patch(ROUTES.API.ADMIN.NOTIFICATIONS_READ_ALL);
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar heading="Notifications" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
        <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-10">
          {error ? (
            <div className="bg-red-900/40 border border-red-800 text-red-100 px-4 py-3 rounded-lg text-sm">{error}</div>
          ) : null}

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-white tracking-tight">Notifications</h1>
              <p className="text-[var(--admin-muted)] text-sm">Review organizer access requests and other admin alerts.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--admin-muted)]">
              <span>Unread: {unreadCount}</span>
              <span>All: {total}</span>
            </div>
          </div>

          <div className="bg-[var(--admin-surface)]/80 backdrop-blur rounded-xl border border-white/10 p-4 shadow-lg shadow-black/20 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-white">
              <input
                type="checkbox"
                checked={unreadOnly}
                onChange={(e) => {
                  setPage(1);
                  setUnreadOnly(e.target.checked);
                }}
                className="accent-[var(--admin-primary)]"
              />
              Show unread only
            </label>
            <button
              className="px-3 py-2 rounded-lg border border-white/10 text-sm text-[var(--admin-muted)] hover:text-white hover:border-[var(--admin-primary)]/60 transition-colors flex items-center gap-2"
              onClick={fetchNotifications}
              disabled={loading}
            >
              <RotateCw className="size-4" />
              Refresh
            </button>
            {unreadCount > 0 ? (
              <button
                className="px-3 py-2 rounded-lg bg-[var(--admin-primary)] text-white hover:bg-[var(--admin-primary-dark)] border border-[var(--admin-primary)] transition-all text-sm font-semibold"
                onClick={handleClearAll}
              >
                Clear all
              </button>
            ) : null}
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="bg-[var(--admin-surface)] border border-white/5 rounded-xl p-5 text-sm text-[var(--admin-muted)]">
                Loading notifications...
              </div>
            ) : notifications.length ? (
              notifications.map((item) => (
                <div key={item._id} className="bg-[var(--admin-surface)] border border-white/5 rounded-xl p-5 shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-white font-semibold">{item.title}</p>
                      <p className="text-sm text-[var(--admin-muted)]">{item.message}</p>
                      {item.note ? (
                        <p className="text-xs text-[var(--admin-muted)]">"{item.note}"</p>
                      ) : null}
                      <span className="text-xs text-[var(--admin-muted)]">Created: {formatDateTime(item.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          item.isRead
                            ? "bg-white/5 text-[var(--admin-muted)] border-white/10"
                            : "bg-[var(--admin-primary)]/20 text-white border-[var(--admin-primary)]/40"
                        }`}
                      >
                        {item.isRead ? "Read" : "Unread"}
                      </span>
                      {!item.isRead ? (
                        <button
                          className="p-2 rounded-lg text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-surface)]"
                          onClick={() => handleMarkRead(item._id)}
                          title="Mark read"
                        >
                          <Check className="size-4" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-3">
                    <button
                      className="text-xs text-[var(--admin-primary)] hover:text-white"
                      onClick={() => router.push(item.actionPath || ROUTES.ADMIN.USERS)}
                    >
                      Review request
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-[var(--admin-surface)] border border-white/5 rounded-xl p-5 text-sm text-[var(--admin-muted)]">
                No notifications found.
              </div>
            )}
          </div>

          <div className="bg-[var(--admin-primary)]/10 px-6 py-3 border border-white/5 rounded-xl flex items-center justify-between">
            <span className="text-xs text-[var(--admin-muted)]">Page {page} of {pages} • {total} notifications</span>
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
  );
}
