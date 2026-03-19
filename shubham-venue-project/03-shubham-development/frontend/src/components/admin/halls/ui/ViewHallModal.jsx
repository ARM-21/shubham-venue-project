import React from "react";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import StatusBadge from "../StatusBadge";

export default function ViewHallModal({ viewModal, currencyFormatter, closeViewModal, prevImage, nextImage, setViewModal, handleEditClick }) {
  if (!viewModal.open || !viewModal.hall) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[55] flex items-center justify-center p-4 lg:pl-64">
      <div className="bg-[var(--admin-surface)] border border-white/10 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden">
        <div className="relative h-80 bg-black">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${viewModal.hall.images?.[viewModal.activeIndex] || "https://via.placeholder.com/1200x600?text=Hall"})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <button
            onClick={closeViewModal}
            className="absolute top-3 right-3 bg-black/60 text-white size-9 rounded-full flex items-center justify-center border border-white/10 hover:bg-black/80"
          >
            ✕
          </button>
          <button
            onClick={prevImage}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 text-white size-9 rounded-full flex items-center justify-center border border-white/10 hover:bg-black/80"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 text-white size-9 rounded-full flex items-center justify-center border border-white/10 hover:bg-black/80"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2 overflow-x-auto admin-scroll">
            {(viewModal.hall.images || ["https://via.placeholder.com/1200x600?text=Hall"]).map((img, idx) => (
              <button
                key={img}
                onClick={() => setViewModal((prev) => ({ ...prev, activeIndex: idx }))}
                className={`h-14 w-20 rounded-md border ${viewModal.activeIndex === idx ? "border-[var(--admin-primary)]" : "border-white/10"} overflow-hidden flex-shrink-0`}
              >
                <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--admin-muted)] uppercase font-semibold">Hall Overview</p>
                <h3 className="text-2xl font-bold text-white">{viewModal.hall.name}</h3>
              </div>
              <StatusBadge tone={viewModal.hall.isActive === false ? "warning" : "positive"}>
                {viewModal.hall.isActive === false ? "Inactive" : "Active"}
              </StatusBadge>
            </div>
            <p className="text-sm text-[var(--admin-muted)] leading-relaxed">{viewModal.hall.description || "No description provided."}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <p className="text-xs text-[var(--admin-muted)] uppercase">Capacity</p>
                <p className="text-lg text-white font-semibold">{viewModal.hall.capacity || "—"} guests</p>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <p className="text-xs text-[var(--admin-muted)] uppercase">Price</p>
                <p className="text-lg text-white font-semibold">
                  {currencyFormatter.format(Number(viewModal.hall.pricePerHour || 0))}
                  <span className="text-xs text-[var(--admin-muted)] font-normal"> / hr</span>
                </p>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                <p className="text-xs text-[var(--admin-muted)] uppercase">Currency</p>
                <p className="text-lg text-white font-semibold">{viewModal.hall.currency || "NPR"}</p>
              </div>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5 col-span-2 md:col-span-3 flex items-center gap-2">
                <MapPin className="size-4 text-[var(--admin-primary)]" />
                <div>
                  <p className="text-xs text-[var(--admin-muted)] uppercase">Location</p>
                  <p className="text-sm text-white">
                    {[viewModal.hall.location?.address, viewModal.hall.location?.city, viewModal.hall.location?.state, viewModal.hall.location?.country]
                      .filter(Boolean)
                      .join(", ") || "No address provided"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--admin-muted)] uppercase font-semibold mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(viewModal.hall.amenities) && viewModal.hall.amenities.length ? (
                  viewModal.hall.amenities.map((a) => (
                    <span key={a} className="px-3 py-1 rounded-full bg-[var(--admin-bg)] border border-white/10 text-xs text-white">
                      {a}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-[var(--admin-muted)]">No amenities listed.</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs text-[var(--admin-muted)] uppercase font-semibold mb-2">Internal Notes</p>
              <div className="p-3 rounded-lg border border-white/10 bg-white/5 text-sm text-white min-h-[60px]">
                {viewModal.hall.notes || "No notes for this hall."}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-white/10 bg-white/5">
              <p className="text-xs text-[var(--admin-muted)] uppercase font-semibold mb-2">Gallery</p>
              <div className="grid grid-cols-3 gap-2">
                {(viewModal.hall.images && viewModal.hall.images.length ? viewModal.hall.images : ["https://via.placeholder.com/300?text=Hall"])
                  .slice(0, 6)
                  .map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      onClick={() => setViewModal((prev) => ({ ...prev, activeIndex: idx }))}
                      className={`h-20 w-full rounded-md overflow-hidden border ${viewModal.activeIndex === idx ? "border-[var(--admin-primary)]" : "border-white/10"}`}
                    >
                      <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
                    </button>
                  ))}
              </div>
            </div>

            <div className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-2">
              <p className="text-xs text-[var(--admin-muted)] uppercase font-semibold">Quick Details</p>
              <div className="flex items-center justify-between text-sm text-white">
                <span>Last Updated</span>
                <span>{viewModal.hall.updatedAt ? new Date(viewModal.hall.updatedAt).toLocaleString() : "—"}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white">
                <span>Created</span>
                <span>{viewModal.hall.createdAt ? new Date(viewModal.hall.createdAt).toLocaleString() : "—"}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEditClick(viewModal.hall._id || viewModal.hall.id || viewModal.hall.slug)}
                className="flex-1 bg-[var(--admin-primary)] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[var(--admin-primary-dark)] border border-[var(--admin-primary)]"
              >
                Edit Hall
              </button>
              <button onClick={closeViewModal} className="px-4 py-2 rounded-lg border border-white/10 text-sm text-[var(--admin-muted)] hover:bg-white/5">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
