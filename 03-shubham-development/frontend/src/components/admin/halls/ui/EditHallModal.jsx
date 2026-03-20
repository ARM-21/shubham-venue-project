import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function EditHallModal({ editModal, actionLoading, onClose, onSave, onImageUpload, onRemoveImage }) {
  
  const { register, handleSubmit, reset, watch } = useForm({ defaultValues: editModal });
  
  useEffect(() => {
    reset(editModal);
  }, [editModal, reset]);
  
  const values = watch();
  if (!editModal.open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4 lg:pl-64">
      <div className="bg-[var(--admin-surface)] border border-white/10 rounded-2xl w-full max-w-4xl p-6 shadow-2xl admin-scroll max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{editModal.isNew ? "Add Hall" : "Edit Hall"}</h3>
            <p className="text-sm text-[var(--admin-muted)]">Update hall details, pricing, images, and status.</p>
          </div>
          <button onClick={onClose} className="text-[var(--admin-muted)] hover:text-white">✕</button>
        </div>

        <form onSubmit={handleSubmit((data) => onSave(data))} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block text-sm text-[var(--admin-muted)]">Name</label>
            <input {...register("name")} className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]" placeholder="Hall name" />
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-[var(--admin-muted)]">Capacity</label>
            <input {...register("capacity")} type="number" min={1} className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]" placeholder="Max guests" />
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="block text-sm text-[var(--admin-muted)]">Description</label>
            <textarea {...register("description")} className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)] min-h-[80px]" placeholder="Describe the hall" />
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-[var(--admin-muted)]">Price per hour</label>
            <input {...register("pricePerHour")} type="number" min={0} className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]" placeholder="0" />
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-[var(--admin-muted)]">Currency</label>
            <input {...register("currency")} className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]" placeholder="NPR" />
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-[var(--admin-muted)]">Address</label>
            <input {...register("location.address")} className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]" placeholder="Street address" />
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-[var(--admin-muted)]">City</label>
            <input {...register("location.city")} className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]" placeholder="City" />
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-[var(--admin-muted)]">State</label>
            <input {...register("location.state")} className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]" placeholder="State" />
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-[var(--admin-muted)]">Country</label>
            <input {...register("location.country")} className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]" placeholder="Country" />
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-[var(--admin-muted)]">Amenities (comma separated)</label>
            <input {...register("amenitiesInput")} className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)]" placeholder="WiFi, Parking, Projector" />
          </div>

          <div className="space-y-3">
            <label className="block text-sm text-[var(--admin-muted)]">Active</label>
            <div className="flex items-center gap-2">
              <input {...register("isActive")} type="checkbox" className="size-4" defaultChecked={editModal.isActive} />
              <span className="text-sm text-white">Mark as active</span>
            </div>
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="block text-sm text-[var(--admin-muted)]">Images</label>
            <div className="flex flex-wrap gap-3">
              {(editModal.images || []).map((img) => (
                <div key={img} className="relative">
                  <div className="w-24 h-16 rounded-md bg-cover bg-center border border-white/10" style={{ backgroundImage: `url(${img})` }} />
                  <button onClick={() => onRemoveImage(img)} className="absolute -top-2 -right-2 bg-black/70 text-white rounded-full size-6 flex items-center justify-center text-xs" title="Remove">✕</button>
                </div>
              ))}
              <label className="w-24 h-16 border border-dashed border-white/20 rounded-md flex items-center justify-center text-xs text-[var(--admin-muted)] cursor-pointer hover:border-white/40">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => onImageUpload(e.target.files?.[0])} disabled={editModal.uploading} />
                {editModal.uploading ? "Uploading..." : "+ Add"}
              </label>
            </div>
            {editModal.uploadError ? <p className="text-xs text-red-300">{editModal.uploadError}</p> : null}
          </div>

          <div className="space-y-3 md:col-span-2">
            <label className="block text-sm text-[var(--admin-muted)]">Internal Notes</label>
            <textarea {...register("notes")} className="w-full bg-[var(--admin-bg)] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[var(--admin-primary)] min-h-[80px]" placeholder="Notes visible to admins only" />
          </div>

          <div className="flex justify-end gap-3 mt-6 md:col-span-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-white/10 text-sm text-[var(--admin-muted)] hover:bg-white/5" disabled={actionLoading}>Cancel</button>
            <button type="submit" disabled={actionLoading} className="px-4 py-2 rounded-lg bg-[var(--admin-primary)] text-white text-sm hover:bg-[var(--admin-primary-dark)] disabled:opacity-50">{actionLoading ? "Saving..." : editModal.isNew ? "Create" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
