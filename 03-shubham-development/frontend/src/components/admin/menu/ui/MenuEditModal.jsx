"use client";

import React, { useEffect, useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';
import { ROUTES } from '@/config/routes';
import toast from 'react-hot-toast';

export default function MenuEditModal({ editingMenu, closeEditMenu, onSave }) {
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: { name: '', description: '', pricePerPerson: '', heroImage: '' },
  });
  const [savingMenu, setSavingMenu] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroUploadError, setHeroUploadError] = useState('');

  useEffect(() => {
    setHeroUploadError('');
    setHeroUploading(false);
    reset({
      name: editingMenu?.name || '',
      description: editingMenu?.description || '',
      pricePerPerson: editingMenu?.pricePerPerson !== undefined && editingMenu?.pricePerPerson !== null ? String(editingMenu.pricePerPerson) : '',
      heroImage: editingMenu?.heroImage || '',
    });
  }, [editingMenu, reset]);

  if (!editingMenu) return null;

  const id = editingMenu?._id || editingMenu?.id;

  const handleHeroImageUpload = async (file) => {
    if (!file) return;
    setHeroUploadError('');
    setHeroUploading(true);
    try {
      const ext = `.${file.name.split('.')?.pop()}`;
      const { data } = await axiosInstance.post(ROUTES.API.ADMIN.MENU_UPLOAD_URL, {
        fileExtension: ext,
        contentType: file.type,
      });
      const uploadUrl = data?.data?.uploadUrl;
      const publicUrl = data?.data?.publicUrl;
      if (!uploadUrl || !publicUrl) throw new Error('Upload URL not received');

      await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      setValue('heroImage', publicUrl, { shouldDirty: true });
      toast.success('Hero image uploaded');
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Upload failed';
      setHeroUploadError(message);
      toast.error(message);
    } finally {
      setHeroUploading(false);
    }
  };

  const onSubmit = async (data) => {
    const id = editingMenu?._id || editingMenu?.id;

    const price = data.pricePerPerson === '' ? undefined : Number(data.pricePerPerson);
    if (price !== undefined && (!Number.isFinite(price) || price < 0)) {
      toast.error('Enter a valid price per person');
      return;
    }

    const payload = {
      name: data.name?.trim() || editingMenu.name,
      description: data.description?.trim() || '',
      pricePerPerson: price ?? editingMenu.pricePerPerson,
      heroImage: (data.heroImage || '').trim() || editingMenu.heroImage || '',
    };

    if (!onSave) {
      toast.error('No save handler');
      return;
    }

    try {
      setSavingMenu(true);
      await onSave(id || null, payload);
      closeEditMenu();
    } catch (err) {
      // parent handler toasts
    } finally {
      setSavingMenu(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeEditMenu} />
      <div className="relative z-50 w-full max-w-xl bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-2xl p-6 shadow-2xl shadow-black/30">
          <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{id ? 'Edit menu' : 'Create menu'}</h3>
            <p className="text-[var(--admin-muted)] text-sm">{id ? 'Update the menu name, price per person, and description.' : 'Create a new menu bundle to offer to customers.'}</p>
          </div>
          <button type="button" className="text-[var(--admin-muted)] hover:text-white" onClick={closeEditMenu} aria-label="Close edit menu">
            <MoreHorizontal className="rotate-90" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label className="text-sm text-[var(--admin-muted)] flex items-center justify-between">Hero image{heroUploadError ? <span className="text-amber-300 text-xs">{heroUploadError}</span> : null}</label>
            <div className="flex items-center gap-3">
              <div className="w-28 h-20 rounded-lg border border-[#3a1a1a] bg-cover bg-center" style={{ backgroundImage: `url(${(editingMenu?.heroImage) || "/assets/business-images/hero.jpg"})` }} aria-label="Hero preview" />
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleHeroImageUpload(file); }} disabled={heroUploading} className="text-sm text-white file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-[var(--admin-primary)] file:text-white hover:file:bg-[var(--admin-primary-dark)] cursor-pointer" />
                <input type="url" {...register('heroImage')} placeholder="or paste image URL" className="flex-1 bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)]" />
              </div>
            </div>
            {heroUploading ? <p className="text-xs text-[var(--admin-muted)]">Uploading...</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--admin-muted)]">Menu name</label>
            <input type="text" {...register('name')} className="w-full bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)]" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--admin-muted)]">Price per person</label>
            <input type="number" min="0" step="0.01" {...register('pricePerPerson')} className="w-full bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)]" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--admin-muted)]">Description</label>
            <textarea {...register('description')} className="w-full bg-[var(--admin-bg)] border border-[#3a1a1a] text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)] min-h-[90px]" placeholder="Optional description" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="px-4 py-2 rounded-lg border border-[#3a1a1a] text-[var(--admin-muted)] hover:text-white hover:border-[var(--admin-primary)]" onClick={closeEditMenu} disabled={savingMenu}>Cancel</button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-[var(--admin-primary)] text-white font-semibold shadow-lg shadow-[var(--admin-primary)]/30 hover:bg-[var(--admin-primary-dark)] disabled:opacity-60" disabled={savingMenu}>{savingMenu ? "Saving..." : "Save changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
