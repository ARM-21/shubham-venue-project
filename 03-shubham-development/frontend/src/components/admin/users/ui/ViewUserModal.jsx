"use client";

import { useEffect } from "react";
import { useQueryUser } from "@queries/user";
import Avatar from "components/admin/users/ui/AvatarFallback";

export default function ViewUserModal({ userId, onClose }) {
  const { data, isLoading, isError, error } = useQueryUser(userId, { retry: false });

  useEffect(() => {
    if (!userId) return;
    // focus side-effect or other UX can go here
  }, [userId]);

  if (!userId) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
        <div className="bg-[var(--admin-surface)] border border-white/10 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
          <p className="text-[var(--admin-muted)]">Loading user...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
        <div className="bg-[var(--admin-surface)] border border-white/10 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
          <p className="text-red-300">{error?.message || "Failed to load user"}</p>
          <div className="flex justify-end mt-4">
            <button className="px-4 py-2 rounded-lg border border-white/10 text-sm text-[var(--admin-muted)] hover:bg-white/5" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const user = data?.user || data;

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
      <div className="bg-[var(--admin-surface)] border border-white/10 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">User Details</h3>
          <button className="text-[var(--admin-muted)] hover:text-white" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <Avatar name={user?.name} src={user?.profilePicture} />
          <div className="flex flex-col">
            <span className="text-white font-semibold">{user?.name}</span>
            <span className="text-[var(--admin-muted)] text-sm">{user?.email}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[var(--admin-muted)] text-xs uppercase">Role</p>
            <p className="text-white font-semibold">{(user?.role || "customer").toUpperCase()}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[var(--admin-muted)] text-xs uppercase">Provider</p>
            <p className="text-white font-semibold">{(user?.provider || "local").toUpperCase()}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[var(--admin-muted)] text-xs uppercase">Status</p>
            <p className="text-white font-semibold">{user?.isActive ? "Active" : "Disabled"}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[var(--admin-muted)] text-xs uppercase">Verified</p>
            <p className="text-white font-semibold">{user?.isVerified ? "Yes" : "No"}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[var(--admin-muted)] text-xs uppercase">Organizer Status</p>
            <p className="text-white font-semibold">{(user?.organizerStatus || "none").toUpperCase()}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[var(--admin-muted)] text-xs uppercase">Organizer Access</p>
            <p className="text-white font-semibold">{user?.organizerEnabled || user?.isOrganizerEligible ? "Enabled" : "Disabled"}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[var(--admin-muted)] text-xs uppercase">Organizer Requested</p>
            <p className="text-white font-semibold">{user?.organizerRequestedAt ? new Date(user.organizerRequestedAt).toLocaleString() : "—"}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[var(--admin-muted)] text-xs uppercase">Organizer Note</p>
            <p className="text-white font-semibold break-words">{user?.organizerNote || "—"}</p>
          </div>
          <div className="bg-white/5 rounded-lg p-3 border border-white/10">
            <p className="text-[var(--admin-muted)] text-xs uppercase">Phone</p>
            <p className="text-white font-semibold">{user?.phone || "—"}</p>
          </div>
        </div>
        <div className="mt-4 text-xs text-[var(--admin-muted)]">
          <p>Created: {user?.createdAt ? new Date(user.createdAt).toLocaleString() : "—"}</p>
          <p>Updated: {user?.updatedAt ? new Date(user.updatedAt).toLocaleString() : "—"}</p>
        </div>
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 rounded-lg border border-white/10 text-sm text-[var(--admin-muted)] hover:bg-white/5" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
