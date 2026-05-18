"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, ExternalLink, UserRound } from "lucide-react";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

const NOTIFICATION_LIMIT = 6;

function formatRelativeTime(value) {
  if (!value) return "";
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "";
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AdminTopbar({ heading }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(ROUTES.API.ADMIN.NOTIFICATIONS, {
        params: { limit: NOTIFICATION_LIMIT, unreadOnly: true },
      });
      const payload = res.data || {};
      setNotifications(payload.items || []);
      setUnreadCount(payload.unreadCount || 0);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    if (menuOpen) {
      fetchNotifications();
    }
  }, [menuOpen, fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await axiosInstance.patch(ROUTES.API.ADMIN.NOTIFICATION_READ(id));
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await axiosInstance.patch(ROUTES.API.ADMIN.NOTIFICATIONS_READ_ALL);
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReview = async (notification) => {
    if (!notification?.isRead) {
      await handleMarkRead(notification._id);
    }
    setMenuOpen(false);
    router.push(notification.actionPath || ROUTES.ADMIN.USERS);
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-30 h-16 flex items-center justify-between px-6 lg:px-8 border-b border-[#3a1a1a] bg-[var(--admin-bg)]/90 backdrop-blur">
      <div className="flex items-center gap-3">
        {heading ? (
          <h2 className="text-white text-lg font-semibold tracking-tight hidden md:block">
            {heading}
          </h2>
        ) : null}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 relative">
          <button
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-surface)] transition-colors"
            onClick={() => router.push(ROUTES.HOME)}
            title="Open customer site"
          >
            <ExternalLink className="size-4" />
            View site
          </button>

          <button
            className="relative p-2 rounded-lg text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-surface)] transition-colors"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <Bell className="size-5" />
            {unreadCount > 0 ? (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--admin-primary)] text-[10px] font-semibold text-white flex items-center justify-center border-2 border-[var(--admin-bg)]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </button>
          {menuOpen ? (
            <div className="absolute right-0 top-full mt-2 w-[360px] max-w-[90vw] rounded-xl border border-white/10 bg-[var(--admin-bg)] shadow-2xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <p className="text-sm font-semibold text-white">Notifications</p>
                {unreadCount > 0 ? (
                  <button
                    className="text-xs text-[var(--admin-muted)] hover:text-white"
                    onClick={handleMarkAll}
                  >
                    Clear all
                  </button>
                ) : null}
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {loading ? (
                  <div className="px-4 py-6 text-sm text-[var(--admin-muted)]">Loading notifications...</div>
                ) : error ? (
                  <div className="px-4 py-6 text-sm text-red-200">{error}</div>
                ) : notifications.length ? (
                  notifications.map((item) => (
                    <div key={item._id} className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <p className="text-sm text-white font-semibold">{item.title}</p>
                          <p className="text-xs text-[var(--admin-muted)]">{item.message}</p>
                          {item.note ? (
                            <p className="text-xs text-[var(--admin-muted)]">"{item.note}"</p>
                          ) : null}
                          <span className="text-[10px] text-[var(--admin-muted)]">{formatRelativeTime(item.createdAt)}</span>
                        </div>
                        {!item.isRead ? (
                          <button
                            className="p-1 rounded text-[var(--admin-muted)] hover:text-white hover:bg-white/10"
                            onClick={() => handleMarkRead(item._id)}
                            title="Mark read"
                          >
                            <Check className="size-4" />
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-2">
                        <button
                          className="text-xs text-[var(--admin-primary)] hover:text-white"
                          onClick={() => handleReview(item)}
                        >
                          Review request
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-sm text-[var(--admin-muted)]">No new notifications.</div>
                )}
              </div>
              <div className="px-4 py-3 border-t border-white/10">
                <button
                  className="text-xs text-[var(--admin-primary)] hover:text-white"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push(ROUTES.ADMIN.NOTIFICATIONS);
                  }}
                >
                  See all notifications
                </button>
              </div>
            </div>
          ) : null}
          <button
            className="p-2 rounded-lg text-[var(--admin-muted)] hover:text-white hover:bg-[var(--admin-surface)] transition-colors"
            onClick={() => router.push(ROUTES.SITE.PROFILE)}
            title="Open customer profile"
          >
            <UserRound className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
