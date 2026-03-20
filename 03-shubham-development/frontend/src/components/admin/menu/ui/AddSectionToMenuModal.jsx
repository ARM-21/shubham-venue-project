"use client";

import React, { useEffect, useState } from 'react';
import axiosInstance from 'lib/axios';
import { ROUTES } from 'config/routes';
import toast from 'react-hot-toast';

export default function AddSectionToMenuModal({ open = false, onClose = () => {}, menuSlug = null, onSaved = () => {} }) {
  const [loading, setLoading] = useState(false);
  const [globalSections, setGlobalSections] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [initialSelected, setInitialSelected] = useState(new Set());
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        setLoading(true);
        const [allRes, menuRes] = await Promise.all([
          axiosInstance.get(`${ROUTES.API.ADMIN.MENUS}/sections`),
          axiosInstance.get(`${ROUTES.API.ADMIN.MENU_DETAIL(menuSlug)}/sections`),
        ]);
        const all = allRes?.data?.sections || [];
        const menuSections = (menuRes?.data?.sections || []).map((s) => String(s.section?._id || s.section));
        setGlobalSections(all);
        setSelected(new Set(menuSections));
        setInitialSelected(new Set(menuSections));
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load sections');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, menuSlug]);

  const toggle = (id) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const createAndAttach = async () => {
    if (!newTitle.trim()) return toast.error('Title required');
    try {
      setLoading(true);
      const res = await axiosInstance.post(`${ROUTES.API.ADMIN.MENU_DETAIL(menuSlug)}/sections`, { title: newTitle.trim(), description: String(newDesc || '').trim() });
      const created = res?.data?.section;
      if (created && created._id) {
        setSelected((prev) => new Set([...Array.from(prev), String(created._id)]));
        setGlobalSections((prev) => [created, ...prev]);
        setNewTitle(''); setNewDesc('');
        toast.success('Section created and attached');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Create failed');
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!menuSlug) return toast.error('Menu context missing');
    try {
      setLoading(true);
      const before = Array.from(initialSelected);
      const after = Array.from(selected);
      const toAdd = after.filter((id) => !before.includes(id));
      const toRemove = before.filter((id) => !after.includes(id));

      // attach new existing sections
      await Promise.all(toAdd.map(async (id) => {
        await axiosInstance.post(`${ROUTES.API.ADMIN.MENU_DETAIL(menuSlug)}/sections/attach`, { sectionId: id });
      }));

      // detach removed sections (without deleting global)
      await Promise.all(toRemove.map(async (id) => {
        await axiosInstance.delete(`${ROUTES.API.ADMIN.MENU_DETAIL(menuSlug)}/sections/${id}/detach`);
      }));

      toast.success('Sections updated');
      if (typeof onSaved === 'function') onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0b0b0d] to-[var(--admin-bg)] border border-[#2b2b2b] rounded-2xl p-6 z-10 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">Manage Menu Sections</h3>
            <p className="text-sm text-[var(--admin-muted)]">Select existing sections or create a new one for this menu.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-[var(--admin-muted)] hover:text-white px-2 py-1">✕</button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4">
          <div className="max-h-64 overflow-y-auto rounded-lg border border-[#232323] p-3 bg-[linear-gradient(180deg,#0f1113,#0b0b0d)]">
            {loading ? (
              <div className="text-[var(--admin-muted)]">Loading...</div>
            ) : (
              globalSections.length ? (
                globalSections.map((s) => (
                  <label key={s._id} className="flex items-start gap-3 mb-3 p-2 rounded hover:bg-white/2 transition-colors">
                    <input className="mt-1" type="checkbox" checked={selected.has(String(s._id))} onChange={() => toggle(String(s._id))} />
                    <div>
                      <div className="text-white font-semibold">{s.title}</div>
                      <div className="text-[var(--admin-muted)] text-xs">{s.description || ''}</div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-[var(--admin-muted)]">No global sections found.</div>
              )
            )}
          </div>

          <div className="pt-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-white">Create new section</h4>
              <button onClick={() => setShowCreate((s) => !s)} className="text-sm text-[var(--admin-primary)] hover:underline">{showCreate ? 'Hide' : 'Create new'}</button>
            </div>

            {showCreate ? (
              <div className="mt-3 bg-[var(--admin-surface)] border border-[#262626] rounded p-3">
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Section title" className="w-full bg-transparent border-b border-[#3a1a1a] text-white px-2 py-2 mb-2" />
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" className="w-full bg-transparent border border-[#232323] text-white px-2 py-2 rounded h-20" />
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={() => { setShowCreate(false); setNewTitle(''); setNewDesc(''); }} className="px-3 py-2 border rounded">Cancel</button>
                  <button onClick={createAndAttach} className="px-3 py-2 bg-[var(--admin-primary)] text-white rounded">Create & Attach</button>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-sm text-[var(--admin-muted)]">Want a custom section for this menu? Click "Create new" to open the form.</div>
            )}
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
