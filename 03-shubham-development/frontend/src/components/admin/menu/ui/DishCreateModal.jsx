"use client";

import React, { useEffect, useState } from 'react';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import DishForm from './DishForm';

export default function DishCreateModal({ open = false, onClose = () => {}, origin = 'menu-detail', menuSlug = null, sectionId = null, sections = [], existingDishIds = [], onCreated = () => {} }) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: { name: '', description: '', price: '', unitLabel: '', image: '', isVegetarian: true, section: sectionId || '' },
  });
  const [dishSaving, setDishSaving] = useState(false);
  const [dishImageUploading, setDishImageUploading] = useState(false);
  const [dishImageUploadError, setDishImageUploadError] = useState('');

  useEffect(() => {
    if (!open) return;
    reset({ name: '', description: '', price: '', unitLabel: '', image: '', isVegetarian: true, section: sectionId || (sections && sections[0] ? (sections[0]._id || sections[0].id) : '') });
    setDishSaving(false);
    setDishImageUploading(false);
    setDishImageUploadError('');
  }, [open, reset]);

  if (!open) return null;

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

      // Use axiosInstance to upload to presigned URL so interceptors / config apply
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
    const chosenSection = data.section || sectionId;
    const price = data.price === '' ? undefined : Number(data.price);
    if (price !== undefined && (!Number.isFinite(price) || price < 0)) {
      toast.error('Enter a valid price');
      return;
    }

    if (!chosenSection) {
      toast.error('Please select a category/section');
      return;
    }

    const payload = {
      name: (data.name || '').trim(),
      description: (data.description || '').trim() || '',
      price: price,
      unitLabel: (data.unitLabel || '').trim() || '',
      image: (data.image || '').trim() || '',
      isVegetarian: !!data.isVegetarian,
      section: chosenSection,
    };

    try {
      setDishSaving(true);
      const res = await axiosInstance.post(ROUTES.API.ADMIN.DISHES, payload);
      const dish = res?.data?.dish;
      if (!dish) throw new Error('Dish creation failed');

      // If opened from a menu detail, attach dish to the menu section
      if (origin === 'menu-detail' && menuSlug && sectionId) {
        const updatedDishIds = Array.from(new Set([...(existingDishIds || []), String(dish._id)]));
        await axiosInstance.patch(`${ROUTES.API.ADMIN.MENU_DETAIL(menuSlug)}/sections/${sectionId}`, { dishes: updatedDishIds });
      }

      toast.success('Dish created');
      onCreated(dish);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Create failed');
    } finally {
      setDishSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-xl bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-2xl p-6 shadow-2xl shadow-black/30">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white">Create dish</h3>
            <p className="text-[var(--admin-muted)] text-sm">Add a new dish and attach it to this section.</p>
          </div>
          <button type="button" className="text-[var(--admin-muted)] hover:text-white" onClick={onClose} aria-label="Close create dish">✕</button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <DishForm
            register={register}
            watch={watch}
            sections={sections}
            showSectionSelect={!(origin === 'menu-detail' && sectionId)}
            dishImageUploading={dishImageUploading}
            dishImageUploadError={dishImageUploadError}
            handleDishImageUpload={handleDishImageUpload}
            isSaving={dishSaving}
            onCancel={onClose}
            submitLabel="Create dish"
          />
        </form>
      </div>
    </div>
  );
}
