import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Mail } from "lucide-react";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

export default function EditBookingModal({ editModal, setEditModal, saveEdit, actionLoading, onClose }) {
  const isOpen = !!editModal.open;
  const [sendingInvoice, setSendingInvoice] = useState(false);
  const paymentStatusKey = (editModal.paymentStatus || "INITIATED").toUpperCase().trim();

  const paymentOptions = useMemo(() => {
    const key = (editModal.originalPaymentStatus || "INITIATED").toUpperCase();
    if (key === "INITIATED") return ["INITIATED", "COMPLETED", "FAILED"];
    if (key === "FAILED") return ["FAILED", "INITIATED", "COMPLETED"];
    if (key === "COMPLETED") return ["COMPLETED", "REFUNDED"];
    if (key === "REFUNDED") return ["REFUNDED"];
    return ["INITIATED", "COMPLETED", "FAILED"];
  }, [editModal.originalPaymentStatus]);

  const baseStatusOptions = useMemo(() => {
    const key = (editModal.originalStatus || "PENDING").toUpperCase();
    if (key === "PENDING") return ["PENDING", "CONFIRMED", "CANCELLED"];
    if (key === "CONFIRMED") return ["CONFIRMED", "COMPLETED", "CANCELLED"];
    if (key === "CANCELLED") return ["CANCELLED"];
    if (key === "COMPLETED") return ["COMPLETED"];
    return ["PENDING", "CONFIRMED", "CANCELLED"];
  }, [editModal.originalStatus]);

  const statusOptions = useMemo(() => {
    if (paymentStatusKey === "FAILED") {
      return baseStatusOptions.filter((s) => s === "PENDING" || s === "CANCELLED");
    }
    if (paymentStatusKey === "INITIATED") {
      return baseStatusOptions.filter((s) => s !== "COMPLETED");
    }
    if (paymentStatusKey === "REFUNDED") {
      return baseStatusOptions.filter((s) => s === "CANCELLED");
    }
    if (paymentStatusKey === "COMPLETED") {
      return baseStatusOptions.filter((s) => s !== "PENDING");
    }
    return baseStatusOptions;
  }, [baseStatusOptions, paymentStatusKey]);

  useEffect(() => {
    if (!statusOptions.includes((editModal.status || "").toUpperCase())) {
      setEditModal((prev) => ({ ...prev, status: statusOptions[0] }));
    }
  }, [editModal.status, setEditModal, statusOptions]);

  useEffect(() => {
    const normalized = (editModal.paymentStatus || "").toUpperCase().trim();
    if (!paymentOptions.includes(normalized)) {
      setEditModal((prev) => ({ ...prev, paymentStatus: paymentOptions[0] }));
    }
  }, [editModal.paymentStatus, paymentOptions, setEditModal]);

  const handleSendInvoice = async () => {
    setSendingInvoice(true);
    try {
      await axiosInstance.post(ROUTES.API.ADMIN.BOOKING_SEND_INVOICE(editModal.id));
      toast.success('Invoice sent to customer email');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send invoice');
    } finally {
      setSendingInvoice(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--admin-surface)] border border-white/10 rounded-xl w-full max-w-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white">Edit Booking</h3>
        <div className="space-y-3">
          <label className="block text-sm text-[var(--admin-muted)]">Date</label>
          <input
            type="date"
            value={editModal.date}                                                                                                                                      
            onChange={(e) => setEditModal((prev) => ({ ...prev, date: e.target.value }))}
            className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]"
          />
          <label className="block text-sm text-[var(--admin-muted)]">Slot</label>
          <select
            value={editModal.slot}
            onChange={(e) => setEditModal((prev) => ({ ...prev, slot: e.target.value }))}
            className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]"
          >
            <option value="morning">Morning (08:00 AM - 01:00 PM)</option>
            <option value="afternoon">Afternoon (01:00 PM - 05:00 PM)</option>
            <option value="evening">Evening (05:00 PM - 11:00 PM)</option>
            <option value="wholeday">Whole Day (08:00 AM - 11:00 PM)</option>
          </select>
          <label className="block text-sm text-[var(--admin-muted)]">Guests</label>
          <input
            type="number"
            min={1}
            value={editModal.guests}
            onChange={(e) => setEditModal((prev) => ({ ...prev, guests: e.target.value }))}
            className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]"
          />
          <label className="block text-sm text-[var(--admin-muted)]">Status</label>
          <select
            value={editModal.status}
            onChange={(e) => setEditModal((prev) => ({ ...prev, status: e.target.value }))}
            className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <label className="block text-sm text-[var(--admin-muted)]">Payment</label>
          <select
            value={editModal.paymentStatus}
            onChange={(e) => setEditModal((prev) => ({ ...prev, paymentStatus: e.target.value }))}
            className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]"
          >
            {paymentOptions.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </option>
            ))}
          </select>
          {editModal.status === "CANCELLED" ? (
            <>
              <label className="block text-sm text-[var(--admin-muted)]">Cancellation reason</label>
              <textarea
                value={editModal.cancelReason}
                onChange={(e) => setEditModal((prev) => ({ ...prev, cancelReason: e.target.value }))}
                className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]"
                rows={3}
                placeholder="Reason for cancellation"
              />
            </>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          {paymentStatusKey === "COMPLETED" && (
            <button
              onClick={handleSendInvoice}
              disabled={sendingInvoice}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 text-sm transition-colors disabled:opacity-50"
              title="Send invoice email to customer"
            >
              <Mail className="size-4" />
              {sendingInvoice ? 'Sending...' : 'Send Invoice'}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-white/10 text-sm text-[var(--admin-muted)] hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={saveEdit}
            disabled={actionLoading}
            className="px-4 py-2 rounded-lg bg-[var(--admin-primary)] text-white text-sm hover:bg-[var(--admin-primary-dark)] disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
