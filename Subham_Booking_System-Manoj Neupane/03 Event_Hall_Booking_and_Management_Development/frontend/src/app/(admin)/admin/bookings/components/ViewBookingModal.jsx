import React from "react";
import { PaymentPill, StatusPill } from "./ui";
import { ROUTES } from "@/config/routes";

export default function ViewBookingModal({ viewModal, setViewModal, currencyFormatter }) {
  if (!viewModal.open) return null;

  const toneForStatus = (status) => {
    const key = (status || "").toLowerCase();
    if (key === "confirmed") return "positive";
    if (key === "pending") return "warning";
    if (key === "cancelled") return "danger";
    return "info";
  };

  const toneForPayment = (status) => {
    const key = (status || "initiated").toLowerCase();
    if (key === "completed") return "positive";
    if (key === "failed") return "danger";
    if (key === "refunded") return "neutral";
    return "warning";
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--admin-surface)] border border-white/10 rounded-xl w-full max-w-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Booking Details</h3>
          <button
            onClick={() => setViewModal({ open: false, loading: false, data: null })}
            className="text-[var(--admin-muted)] hover:text-white text-sm"
          >
            Close
          </button>
        </div>

        {viewModal.loading ? (
          <p className="text-sm text-[var(--admin-muted)]">Loading...</p>
        ) : viewModal.data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white">
            <div className="space-y-1">
              <p className="text-[var(--admin-muted)]">Booking ID</p>
              <p className="font-mono text-xs bg-white/5 rounded px-2 py-1">{viewModal.data.id}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--admin-muted)]">Status</p>
              <StatusPill tone={toneForStatus(viewModal.data.status)}>{viewModal.data.status}</StatusPill>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--admin-muted)]">Event</p>
              <p className="font-medium">{viewModal.data.eventName || "—"}</p>
              <p className="text-xs text-[var(--admin-muted)]">{viewModal.data.eventType || ""}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--admin-muted)]">Hall</p>
              <p className="font-medium">{viewModal.data.hall?.name || "Hall"}</p>
              <p className="text-xs text-[var(--admin-muted)]">Capacity: {viewModal.data.hall?.capacity || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--admin-muted)]">Date & Slot</p>
              <p className="font-medium">
                {viewModal.data.date ? new Date(viewModal.data.date).toLocaleDateString("en-NP", { month: "short", day: "numeric", year: "numeric" }) : "-"}
                {" "}•{" "}
                {viewModal.data.slot}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--admin-muted)]">Guests</p>
              <p className="font-medium">{viewModal.data.guests}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[var(--admin-muted)]">Customer</p>
              <p className="font-medium">
                {[viewModal.data.user?.first_name, viewModal.data.user?.last_name].filter(Boolean).join(" ") || viewModal.data.user?.email || "Client"}
              </p>
              <p className="text-xs text-[var(--admin-muted)]">{viewModal.data.user?.email}</p>
              {viewModal.data.user?.phone ? <p className="text-xs text-[var(--admin-muted)]">{viewModal.data.user.phone}</p> : null}
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 bg-white/5 rounded-lg p-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[var(--admin-muted)]">Menu</p>
                  {viewModal.data.menu?.package?.id || viewModal.data.menu?.package?.slug ? (
                    <a
                      href={viewModal.data.menu?.package?.slug ? ROUTES.ADMIN.MENU_DETAIL(viewModal.data.menu.package.slug) : ROUTES.ADMIN.MENU_DETAIL(viewModal.data.menu.package.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--admin-primary)] hover:underline"
                    >
                      Open menu
                    </a>
                  ) : null}
                </div>
                <p className="font-medium">{viewModal.data.menu?.package?.name || "Custom / Per item"}</p>
                <p className="text-xs text-[var(--admin-muted)]">Mode: {viewModal.data.menu?.mode || "-"}</p>
                <p className="text-xs text-[var(--admin-muted)]">Menu total: {viewModal.data.menu?.total != null ? currencyFormatter.format(Number(viewModal.data.menu.total)) : "-"}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-[var(--admin-muted)]">Decorations</p>
                  {viewModal.data.decorations?.scheme?.id || viewModal.data.decorations?.scheme?.slug ? (
                    <a
                      href={viewModal.data.decorations.scheme.slug ? ROUTES.ADMIN.DECORATION_DETAIL(viewModal.data.decorations.scheme.slug) : ROUTES.ADMIN.DECORATION_DETAIL(viewModal.data.decorations.scheme.id)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[var(--admin-primary)] hover:underline"
                    >
                      Open decoration
                    </a>
                  ) : null}
                </div>
                <p className="font-medium">{viewModal.data.decorations?.scheme?.name || "None"}</p>
                <p className="text-xs text-[var(--admin-muted)]">Decor total: {viewModal.data.decorations?.total != null ? currencyFormatter.format(Number(viewModal.data.decorations.total)) : "-"}</p>
                {viewModal.data.decorations?.addons?.length ? (
                  <p className="text-xs text-[var(--admin-muted)]">Addons: {viewModal.data.decorations.addons.map((a) => a.name || a.key).join(", ")}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <p className="text-[var(--admin-muted)]">Payment</p>
                {viewModal.data.payment?.transactionId ? (
                  <span className="text-[var(--admin-muted)] text-xs">Txn: {viewModal.data.payment.transactionId}</span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <PaymentPill tone={toneForPayment(viewModal.data.payment?.status)}>
                  {(viewModal.data.payment?.status || "initiated").toUpperCase()}
                </PaymentPill>
                <p className="text-xs text-[var(--admin-muted)]">Gateway: {viewModal.data.payment?.gateway || "-"}</p>
                <p className="text-xs text-[var(--admin-muted)]">Amount: {viewModal.data.pricing?.totalAmount != null ? currencyFormatter.format(Number(viewModal.data.pricing.totalAmount)) : "-"}</p>
              </div>
              {Array.isArray(viewModal.data.payments) && viewModal.data.payments.length ? (
                <div className="space-y-1">
                  <p className="text-[var(--admin-muted)] text-xs">Payment history</p>
                  <div className="border border-white/5 rounded-md divide-y divide-white/5">
                    {viewModal.data.payments.map((pmt) => (
                      <div key={`${pmt.status}-${pmt.createdAt}-${pmt.transactionId || "tx"}`} className="px-3 py-2 flex items-center justify-between text-xs">
                        <span className="text-white">{pmt.status}</span>
                        <span className="text-[var(--admin-muted)]">{pmt.gateway}</span>
                        <span className="text-[var(--admin-muted)]">{pmt.amount != null ? currencyFormatter.format(Number(pmt.amount)) : "-"}</span>
                        <span className="text-[var(--admin-muted)]">{pmt.paidAt ? new Date(pmt.paidAt).toLocaleString("en-NP") : new Date(pmt.createdAt).toLocaleString("en-NP")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="md:col-span-2 space-y-1">
              <p className="text-[var(--admin-muted)]">Special Requirements</p>
              <p className="text-sm text-white/90 bg-white/5 rounded px-3 py-2 min-h-[48px]">
                {viewModal.data.specialRequirements || "None"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--admin-muted)]">No data.</p>
        )}
      </div>
    </div>
  );
}
