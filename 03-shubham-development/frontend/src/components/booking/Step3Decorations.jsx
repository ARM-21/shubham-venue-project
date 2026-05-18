'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import { Check, Flower2, Sparkles, X } from 'lucide-react';
import { ROUTES } from 'config/routes';
import { cn } from 'components/site/SitePrimitives';

export default function Step3Decorations({ data, onUpdate, onNext, onPrev }) {
  const [schemes, setSchemes] = useState([]);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(true);

  const [noDecoration, setNoDecoration] = useState(data.noDecoration ?? false);
  const [selectedScheme, setSelectedScheme] = useState(data.decorationScheme || null);
  const [selectedAddons, setSelectedAddons] = useState(data.addons || []);
  const [colorNote, setColorNote] = useState(data.colorPreference || '');
  const [themeNote, setThemeNote] = useState(data.themeNotes || '');

  // ── data fetch ────────────────────────────────────────────────────────────

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        const [sRes, aRes] = await Promise.all([
          axiosInstance.get(ROUTES.API.DECORATIONS.SCHEMES),
          axiosInstance.get(ROUTES.API.DECORATIONS.ADDONS),
        ]);
        if (!ignore) {
          setSchemes(sRes.data?.schemes || []);
          setAddons(aRes.data?.addons || []);
        }
      } catch {
        toast.error('Failed to load decoration options');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  // ── totals ────────────────────────────────────────────────────────────────

  const schemeTotal = noDecoration || !selectedScheme ? 0 : (selectedScheme.price || 0);
  const addonsTotal = selectedAddons.reduce((s, a) => s + (a.price || 0), 0);
  const decorationTotal = schemeTotal + addonsTotal;

  // ── addon ops ─────────────────────────────────────────────────────────────

  const isAddonSelected = (addonId) => selectedAddons.some((a) => a.addonId === addonId);

  const toggleAddon = (addon) => {
    if (isAddonSelected(addon._id)) {
      setSelectedAddons((prev) => prev.filter((a) => a.addonId !== addon._id));
    } else {
      setSelectedAddons((prev) => [
        ...prev,
        { addonId: addon._id, name: addon.name, description: addon.description, price: addon.price },
      ]);
    }
  };

  // ── submit ────────────────────────────────────────────────────────────────

  const handleContinue = () => {
    if (!noDecoration && !selectedScheme) {
      toast.error('Please pick a decoration theme or choose "Skip decorations"');
      return;
    }
    onUpdate({
      noDecoration,
      decorationScheme: noDecoration ? null : selectedScheme,
      addons: noDecoration ? [] : selectedAddons,
      decorationTotal: noDecoration ? 0 : decorationTotal,
      colorPreference: colorNote,
      themeNotes: themeNote,
    });
    onNext();
  };

  // ── loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#eadcc6] border-t-[#C0A04C]" />
        <p className="text-sm text-[#3a1224]/50">Loading decoration options…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Skip option ── */}
      <button
        type="button"
        onClick={() => { setNoDecoration(true); setSelectedScheme(null); setSelectedAddons([]); }}
        className={cn(
          'flex w-full items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all',
          noDecoration
            ? 'border-[#C0A04C] bg-[#C0A04C]/8 shadow-[0_0_0_2px_rgba(192,160,76,0.2)]'
            : 'border-[#e8dcc8] bg-white hover:border-[#C0A04C]/50'
        )}
      >
        <div className="flex items-center gap-3">
          <span className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
            noDecoration ? 'border-[#C0A04C] bg-[#C0A04C]' : 'border-[#e8dcc8]'
          )}>
            {noDecoration && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
          </span>
          <div>
            <p className="font-black text-[#3a1224]">Skip decorations</p>
            <p className="text-xs text-[#3a1224]/50">I'll arrange my own decorations</p>
          </div>
        </div>
        <span className="text-sm font-black text-[#3a1224]/40">NPR 0</span>
      </button>

      {/* ── Scheme grid ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">
            Decoration themes
          </p>
          {noDecoration && (
            <button
              type="button"
              onClick={() => setNoDecoration(false)}
              className="text-[10px] font-black uppercase tracking-[0.18em] text-[#3a1224]/40 underline-offset-2 hover:text-[#3a1224] hover:underline"
            >
              Choose a theme instead
            </button>
          )}
        </div>

        {schemes.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#e8dcc8] py-10 text-center">
            <Flower2 className="h-8 w-8 text-[#3a1224]/20" />
            <p className="font-black text-[#3a1224]/40">No decoration themes available</p>
            <p className="text-sm text-[#3a1224]/30">Contact the venue for custom arrangements</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schemes.map((scheme) => {
              const isSelected = !noDecoration && selectedScheme?._id === scheme._id;
              return (
                <button
                  key={scheme._id}
                  type="button"
                  onClick={() => { setSelectedScheme(scheme); setNoDecoration(false); }}
                  className={cn(
                    'group relative overflow-hidden rounded-2xl border text-left transition-all',
                    isSelected
                      ? 'border-[#C0A04C] shadow-[0_0_0_2px_rgba(192,160,76,0.22)]'
                      : 'border-[#e8dcc8] hover:border-[#C0A04C]/50'
                  )}
                >
                  {/* Image */}
                  <div className="relative h-40 w-full overflow-hidden bg-[#f0e8d8]">
                    {scheme.imageUrl ? (
                      <Image
                        src={scheme.imageUrl}
                        alt={scheme.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Flower2 className="h-10 w-10 text-[#C0A04C]/30" />
                      </div>
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/60 via-transparent to-transparent" />
                    {/* Selected badge */}
                    {isSelected && (
                      <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#C0A04C] shadow-md">
                        <Check className="h-4 w-4 text-[#3a1224]" strokeWidth={3} />
                      </div>
                    )}
                    {/* Price overlay */}
                    <div className="absolute bottom-3 left-3">
                      <p className="text-xs font-black text-[#C0A04C]">
                        NPR {(scheme.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-white p-4">
                    <p className="font-black text-[#3a1224]">{scheme.name}</p>
                    {scheme.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-[#3a1224]/50">
                        {scheme.description}
                      </p>
                    )}

                    {/* Features list */}
                    {scheme.features?.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {scheme.features.slice(0, 4).map((feat, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs text-[#3a1224]/60">
                            <Check className="mt-0.5 h-3 w-3 shrink-0 text-[#C0A04C]" strokeWidth={3} />
                            {feat}
                          </li>
                        ))}
                        {scheme.features.length > 4 && (
                          <li className="text-[10px] text-[#3a1224]/35">
                            +{scheme.features.length - 4} more included
                          </li>
                        )}
                      </ul>
                    )}

                    {/* Included addons chips */}
                    {scheme.includedAddons?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#f0e8d8] pt-3">
                        {scheme.includedAddons.map((ia) => (
                          <span
                            key={ia._id}
                            className="rounded-full border border-[#e8dcc8] bg-[#f8f4ed] px-2 py-0.5 text-[10px] font-bold text-[#3a1224]/55"
                          >
                            {ia.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add-ons ── */}
      {!noDecoration && addons.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">
            Optional add-ons
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {addons.map((addon) => {
              const sel = isAddonSelected(addon._id);
              return (
                <button
                  key={addon._id}
                  type="button"
                  onClick={() => toggleAddon(addon)}
                  className={cn(
                    'flex items-start gap-3 rounded-2xl border p-4 text-left transition-all',
                    sel
                      ? 'border-[#C0A04C] bg-[#C0A04C]/8 shadow-[0_0_0_1px_rgba(192,160,76,0.2)]'
                      : 'border-[#e8dcc8] bg-white hover:border-[#C0A04C]/50'
                  )}
                >
                  {/* Check circle */}
                  <span className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                    sel ? 'border-[#C0A04C] bg-[#C0A04C]' : 'border-[#e8dcc8]'
                  )}>
                    {sel && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-black text-[#3a1224]">{addon.name}</p>
                      <p className="shrink-0 text-sm font-black text-[#C0A04C]">
                        + NPR {(addon.price || 0).toLocaleString()}
                      </p>
                    </div>
                    {addon.description && (
                      <p className="mt-0.5 text-xs leading-5 text-[#3a1224]/50">{addon.description}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected addons summary strip */}
          {selectedAddons.length > 0 && (
            <div className="mt-3 rounded-2xl border border-[#e8dcc8] bg-[#faf6ef] p-4">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/50">
                Selected add-ons
              </p>
              <div className="space-y-1.5">
                {selectedAddons.map((a) => (
                  <div key={a.addonId} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#C0A04C]" />
                      <p className="truncate text-sm font-bold text-[#3a1224]">{a.name}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-sm font-black text-[#3a1224]">NPR {(a.price || 0).toLocaleString()}</p>
                      <button
                        type="button"
                        onClick={() => toggleAddon({ _id: a.addonId })}
                        className="rounded-lg p-1 text-[#3a1224]/25 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Customisation notes ── */}
      {!noDecoration && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/50">
              Colour preference
            </label>
            <input
              type="text"
              placeholder="e.g. Gold and white, dusty rose…"
              value={colorNote}
              onChange={(e) => setColorNote(e.target.value)}
              className="w-full rounded-2xl border border-[#e8dcc8] bg-white px-4 py-3 text-sm text-[#3a1224] placeholder-[#3a1224]/30 outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/50">
              Theme notes
            </label>
            <input
              type="text"
              placeholder="Specific requests or inspiration…"
              value={themeNote}
              onChange={(e) => setThemeNote(e.target.value)}
              className="w-full rounded-2xl border border-[#e8dcc8] bg-white px-4 py-3 text-sm text-[#3a1224] placeholder-[#3a1224]/30 outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15"
            />
          </div>
        </div>
      )}

      {/* ── Total bar ── */}
      <div className="flex items-center justify-between rounded-2xl bg-[#3a1224] px-5 py-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#C0A04C]/70">
            Decoration total
          </p>
          <p className="mt-0.5 text-sm text-white/55">
            {noDecoration
              ? 'Skipped — self-arranged'
              : selectedScheme
              ? `${selectedScheme.name}${selectedAddons.length ? ` + ${selectedAddons.length} add-on${selectedAddons.length > 1 ? 's' : ''}` : ''}`
              : 'No theme selected'}
          </p>
        </div>
        <p className="text-2xl font-black text-[#C0A04C]">
          NPR {(noDecoration ? 0 : decorationTotal).toLocaleString()}
        </p>
      </div>

      {/* ── Navigation ── */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onPrev}
          className="flex h-11 flex-1 items-center justify-center rounded-2xl border border-[#e8dcc8] bg-white text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224] transition hover:bg-[#f8f4ed]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleContinue}
          className="flex h-11 flex-1 items-center justify-center rounded-2xl bg-[#3a1224] text-[11px] font-black uppercase tracking-[0.18em] text-[#C0A04C] transition hover:bg-[#4a172d]"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
