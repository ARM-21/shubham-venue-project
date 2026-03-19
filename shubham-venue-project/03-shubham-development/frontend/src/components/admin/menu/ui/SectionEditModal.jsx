"use client";

import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '@/lib/axios';
import { ROUTES } from '@/config/routes';
import toast from 'react-hot-toast';

export default function SectionEditModal({ open = false, onClose = () => {}, menuSlug = null, section = null, onSaved = () => {} }) {
  const [loading, setLoading] = useState(false);
  const [dishes, setDishes] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle(section?.title || '');
    setDescription(section?.description || '');
    const load = async () => {
      try {
        setLoading(true);

        // fetch menu's section entries and global section dishes in parallel
        const [menuSectionsRes, dishesRes] = await Promise.all([
          axiosInstance.get(`${ROUTES.API.ADMIN.MENU_DETAIL(menuSlug)}/sections`),
          // when creating a new section (no section provided) fetch all dishes; otherwise fetch dishes for this section
          axiosInstance.get(section ? `${ROUTES.API.ADMIN.DISHES}?section=${String(section?._id || section)}` : `${ROUTES.API.ADMIN.DISHES}`),
        ]);

        const menuSections = menuSectionsRes?.data?.sections || [];
        const entry = menuSections.find((s) => String(s.section?._id || s.section) === String(section?._id || section));
        const entryDishIds = new Set((entry?.dishes || []).map((d) => String(d._id || d)));

        const sectionDishes = dishesRes?.data?.data || dishesRes?.data || [];

        // Ensure included dishes appear even if not returned by section query
        const idSet = new Set(sectionDishes.map((d) => String(d._id)));
        const all = [...sectionDishes];
        (entry?.dishes || []).forEach((d) => {
          const id = String(d._id || d);
          if (!idSet.has(id)) {
            all.push({ _id: id, name: d.name || '', description: d.description || '' });
            idSet.add(id);
          }
        });

        console.log(all)

        setDishes(all);
        setSelected(new Set(Array.from(entryDishIds)));
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load dishes');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, section]);

  const toggle = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const save = async () => {
    if (!menuSlug) return toast.error('Menu context missing');
    try {
      setLoading(true);
      // use the current selection as the full list of dishes for this section
      const payload = { title: title.trim(), description: description.trim(), dishes: Array.from(selected) };
      if (section && section._id) {
        const res = await axiosInstance.patch(`${ROUTES.API.ADMIN.MENU_DETAIL(menuSlug)}/sections/${section._id}`, payload);
        toast.success('Section updated');
        onSaved(res.data);
      } else {
        const res = await axiosInstance.post(`${ROUTES.API.ADMIN.MENU_DETAIL(menuSlug)}/sections`, payload);
        toast.success('Section created');
        onSaved(res.data);
      }
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const filtered = dishes.filter((d) => {
    if (!filter.trim()) return true;
    const q = filter.trim().toLowerCase();
    return (d.name || '').toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-gradient-to-b from-[#07070a] to-[var(--admin-bg)] border border-[#222] rounded-2xl p-6 z-10 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white">{section?.title ? 'Edit Section' : 'Create Section'}</h3>
            <p className="text-sm text-[var(--admin-muted)] mt-1">Manage title, description and included dishes for this menu section.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-[var(--admin-muted)] hover:text-white">✕</button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Section title" className="w-full text-lg font-semibold bg-transparent border-b border-[#2b2b2b] text-white px-2 py-2" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full mt-3 bg-[var(--admin-surface)] border border-[#232323] text-white px-3 py-2 rounded h-24" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-white">Dishes</h4>
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search dishes..." className="text-sm bg-[var(--admin-bg)] border border-[#2b2b2b] text-white px-2 py-1 rounded" />
            </div>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-[#232323] p-3 bg-[linear-gradient(180deg,#0f1113,#0b0b0d)]">
              {loading ? (
                <div className="text-[var(--admin-muted)]">Loading dishes...</div>
              ) : (
                filtered.length ? (
                  filtered.map((d) => (
                    <label key={d._id} className="flex items-start gap-3 mb-3 p-2 rounded hover:bg-white/2 transition-colors">
                      <input className="mt-1" type="checkbox" checked={selected.has(String(d._id))} onChange={() => toggle(String(d._id))} />
                      <div>
                        <div className="text-white font-medium">{d.name}</div>
                        <div className="text-[var(--admin-muted)] text-xs">{d.description ? `— ${d.description}` : ''}</div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-[var(--admin-muted)]">No dishes found for this section.</div>
                )
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-3 py-2 border rounded" onClick={onClose}>Cancel</button>
          <button className="px-3 py-2 bg-[var(--admin-primary)] text-white rounded" onClick={save} disabled={loading}>Save</button>
        </div>
      </div>
    </div>
  );
}
