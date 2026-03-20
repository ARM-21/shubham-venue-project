"use client";

import React, { useEffect, useState } from 'react';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import DishForm from './DishForm';

export default function DishEditModal({ editingDish, closeDishEdit, onSave, sections }) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: { name: '', description: '', price: '', unitLabel: '', image: '', isVegetarian: true, section: '' },
  });
  const [dishSaving, setDishSaving] = useState(false);
  const [dishImageUploading, setDishImageUploading] = useState(false);
  const [dishImageUploadError, setDishImageUploadError] = useState('');

  useEffect(() => {
    let sectionId = '';
    if (editingDish?.section) {
      if (typeof editingDish.section === 'string') {
        const byTitle = sections.find((s) => String(s.title || '').toLowerCase() === String(editingDish.section || '').toLowerCase());
        const byId = sections.find((s) => (s._id || s.id) === editingDish.section || String(s.id) === editingDish.section);
        sectionId = (byId && (byId._id || byId.id)) || (byTitle && (byTitle._id || byTitle.id)) || editingDish.section;
      } else if (typeof editingDish.section === 'object') {
        sectionId = editingDish.section._id || editingDish.section.id || editingDish.section.title || '';
      }
    }

    reset({
      name: editingDish?.name ?? '',
      description: editingDish?.description ?? '',
      price: editingDish?.price !== undefined && editingDish?.price !== null ? String(editingDish.price) : '',
      unitLabel: editingDish?.unitLabel ?? '',
      image: editingDish?.image ?? '',
      isVegetarian: editingDish?.isVegetarian ?? true,
      section: sectionId || '',
    });
    setDishSaving(false);
    setDishImageUploading(false);
    setDishImageUploadError('');
  }, [editingDish, sections, reset]);

  if (!editingDish) return null;

  const handleDishImageUpload = async (file) => {
    if (!file) return;
    setDishImageUploadError('');
    setDishImageUploading(true);
    try {
      const ext = `.${file.name.split('.')?.pop()}`;
      const { data } = await axiosInstance.post(ROUTES.API.ADMIN.MENU_UPLOAD_URL, {
        fileExtension: ext,
        contentType: file.type,
      });
      const uploadUrl = data?.data?.uploadUrl;
      const publicUrl = data?.data?.publicUrl;
      if (!uploadUrl || !publicUrl) throw new Error('Upload URL not received');

      await axiosInstance.put(uploadUrl, file, { headers: { 'Content-Type': file.type } });
      setValue('image', publicUrl, { shouldDirty: true });
      toast.success('Image uploaded');
    } catch (err) {
      const message = err?.response?.data?.message || err.message || 'Upload failed';
      setDishImageUploadError(message);
      toast.error(message);
    } finally {
      setDishImageUploading(false);
    }
  };

  const onSubmit = async (data) => {
    const id = editingDish?._id || editingDish?.id;
    if (!id) return;

    const price = data.price === '' ? undefined : Number(data.price);
    if (price !== undefined && (!Number.isFinite(price) || price < 0)) {
      toast.error('Enter a valid price');
      return;
    }

    const payload = {
      name: (data.name || '').trim() || editingDish.name,
      description: (data.description || '').trim() || '',
      price: price ?? editingDish.price,
      unitLabel: (data.unitLabel || '').trim() || '',
      image: (data.image || '').trim() || '',
      isVegetarian: !!data.isVegetarian,
      section: data.section || '',
    };

    if (!onSave) {
      toast.error('No save handler');
      return;
    }

    try {
      setDishSaving(true);
      await onSave(id, payload);
      closeDishEdit();
    } catch (err) {
      // parent handles toasts
    } finally {
      setDishSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDishEdit} />
      <div className="relative z-50 w-full max-w-xl bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-2xl p-6 shadow-2xl shadow-black/30">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Edit dish</h3>
            <p className="text-[var(--admin-muted)] text-sm">Update the dish details and pricing.</p>
          </div>
          <button type="button" className="text-[var(--admin-muted)] hover:text-white" onClick={closeDishEdit} aria-label="Close edit dish">✕</button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <DishForm
            register={register}
            watch={watch}
            sections={sections.filter(section => section.title !== 'Uncategorized')}
            showSectionSelect={true}
            dishImageUploading={dishImageUploading}
            dishImageUploadError={dishImageUploadError}
            handleDishImageUpload={handleDishImageUpload}
            isSaving={dishSaving}
            onCancel={closeDishEdit}
            submitLabel="Save changes"
          />
        </form>
      </div>
    </div>
  );
}
