"use client";

import React from 'react';

export default function DishForm({
  register,
  watch,
  sections = [],
  showSectionSelect = true,
  dishImageUploading = false,
  dishImageUploadError = '',
  handleDishImageUpload = () => {},
  isSaving = false,
  onCancel = () => {},
  submitLabel = 'Save',
}) {
  return (
    <>
      <div className="space-y-2">
        <label className="text-sm text-[var(--admin-muted)]">Dish name</label>
        <input type="text" {...register('name')} className="w-full bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg px-3 py-2" required />
      </div>

      {showSectionSelect ? (
        <div className="space-y-2">
          <label className="text-sm text-[var(--admin-muted)]">Category</label>
            <select {...register('section')} className="w-full bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg px-3 py-2">
              <option value="" disabled>Select category</option>
            {(sections || []).map((s) => (
              <option key={s._id || s.id} value={s._id || s.id}>{s.title || s.label || s.name}</option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-2">
        <label className="text-sm text-[var(--admin-muted)]">Price</label>
        <input type="number" min="0" step="0.01" {...register('price')} className="w-full bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg px-3 py-2" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[var(--admin-muted)]">Unit label</label>
        <input type="text" {...register('unitLabel')} className="w-full bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg px-3 py-2" placeholder="e.g., /plate" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[var(--admin-muted)]">Description</label>
        <textarea {...register('description')} className="w-full bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg px-3 py-2 min-h-[90px]" placeholder="Optional description" />
      </div>

      <div className="space-y-2">
        <label className="text-sm text-[var(--admin-muted)]">Image</label>
        <div className="flex items-center gap-3">
          <div className="w-20 h-16 rounded-lg border border-[#3a1a1a] bg-cover bg-center" style={{ backgroundImage: `url(${watch('image') || "/assets/business-images/hero.jpg"})` }} aria-label="Dish preview" />
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleDishImageUpload(file); }} disabled={dishImageUploading} className="text-sm text-white file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-[var(--admin-primary)] file:text-white hover:file:bg-[var(--admin-primary-dark)] cursor-pointer" />
            <input type="url" {...register('image')} placeholder="or paste image URL" className="flex-1 bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg px-3 py-2" />
          </div>
        </div>
        {dishImageUploading ? <p className="text-xs text-[var(--admin-muted)]">Uploading...</p> : null}
        {dishImageUploadError ? <p className="text-xs text-amber-300">{dishImageUploadError}</p> : null}
      </div>

      <div className="flex items-center gap-2">
        <input id="dish-veg-toggle-create" type="checkbox" {...register('isVegetarian')} className="w-4 h-4" />
        <label htmlFor="dish-veg-toggle-create" className="text-sm text-white">Vegetarian</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" className="px-4 py-2 rounded-lg border border-[#3a1a1a] text-[var(--admin-muted)] hover:text-white hover:border-[var(--admin-primary)]" onClick={onCancel} disabled={isSaving}>Cancel</button>
        <button type="submit" className="px-5 py-2 rounded-lg bg-[var(--admin-primary)] text-white font-semibold shadow-lg shadow-[var(--admin-primary)]/30 hover:bg-[var(--admin-primary-dark)] disabled:opacity-60" disabled={isSaving}>{isSaving ? 'Saving...' : submitLabel}</button>
      </div>
    </>
  );
}
