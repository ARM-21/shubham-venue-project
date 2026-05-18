'use client';

import { useState, useEffect, useMemo } from 'react';
import axiosInstance from 'lib/axios';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  UtensilsCrossed,
  X,
} from 'lucide-react';
import { ROUTES } from 'config/routes';
import { cn } from 'components/site/SitePrimitives';

// ── helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_META = {
  starter: { label: 'Starters', emoji: '🥗' },
  appetizer: { label: 'Starters', emoji: '🥗' },
  appetiser: { label: 'Starters', emoji: '🥗' },
  main: { label: 'Main Courses', emoji: '🍖' },
  entrée: { label: 'Main Courses', emoji: '🍖' },
  entree: { label: 'Main Courses', emoji: '🍖' },
  dessert: { label: 'Desserts', emoji: '🍰' },
  sweet: { label: 'Desserts', emoji: '🍰' },
  drink: { label: 'Beverages', emoji: '🍷' },
  beverage: { label: 'Beverages', emoji: '🍷' },
  wine: { label: 'Beverages', emoji: '🍷' },
};

function resolveCategoryLabel(raw = '') {
  const key = Object.keys(CATEGORY_META).find((k) => raw.toLowerCase().includes(k));
  return key ? `${CATEGORY_META[key].emoji} ${CATEGORY_META[key].label}` : `✨ ${raw || 'Other'}`;
}

// ── main component ────────────────────────────────────────────────────────────

export default function Step2MenuSelection({ data, onUpdate, onNext, onPrev }) {
  const [menuPackages, setMenuPackages] = useState([]);
  const [allDishes, setAllDishes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [menuMode, setMenuMode] = useState(data.menuMode || 'package');
  const [selectedPackage, setSelectedPackage] = useState(data.selectedPackage || null);
  const [selectedItems, setSelectedItems] = useState(data.selectedMenu || []); // [{itemId, name, category, pricePerUnit, quantity}]
  const [dietaryNote, setDietaryNote] = useState(data.dietaryRestrictions || '');

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedPackage, setExpandedPackage] = useState(null);

  // ── data fetch ──────────────────────────────────────────────────────────────

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        setLoading(true);
        const res = await axiosInstance.get(ROUTES.API.MENUS.ROOT);
        const menus = res.data?.menus || res.data?.data || (Array.isArray(res.data) ? res.data : []);

        const seen = new Set();
        const dishes = [];
        menus.forEach((menu) => {
          (menu.sections || []).forEach((sec) => {
            const catLabel = sec.section?.title || sec.section || 'Other';
            (sec.dishes || []).forEach((dish) => {
              if (!seen.has(dish._id)) {
                seen.add(dish._id);
                dishes.push({ ...dish, category: catLabel, menuName: menu.name });
              }
            });
          });
        });

        if (!ignore) {
          setMenuPackages(menus);
          setAllDishes(dishes);
        }
      } catch {
        toast.error('Failed to load menu options');
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  // ── derived values ──────────────────────────────────────────────────────────

  const categories = useMemo(
    () => ['all', ...new Set(allDishes.map((d) => d.category))],
    [allDishes]
  );

  const visibleDishes = useMemo(() => {
    let list = allDishes;
    if (activeCategory !== 'all') list = list.filter((d) => d.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.category?.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allDishes, activeCategory, search]);

  const groupedDishes = useMemo(() => {
    const map = {};
    visibleDishes.forEach((d) => {
      if (!map[d.category]) map[d.category] = [];
      map[d.category].push(d);
    });
    return map;
  }, [visibleDishes]);

  const packageTotal = selectedPackage
    ? (selectedPackage.pricePerPerson || 0) * (data.guests || 1)
    : 0;

  const customTotal = selectedItems.reduce((s, i) => s + (i.pricePerUnit || 0) * (i.quantity || 0), 0);

  const menuTotal = menuMode === 'package' ? packageTotal : customTotal;

  // ── item cart ops ───────────────────────────────────────────────────────────

  const getSelectedItem = (dishId) => selectedItems.find((i) => i.itemId === dishId);

  const addItem = (dish) => {
    setSelectedItems((prev) => [
      ...prev,
      {
        itemId: dish._id,
        name: dish.name,
        category: dish.category,
        pricePerUnit: dish.price || 0,
        quantity: data.guests || 1,
      },
    ]);
  };

  const removeItem = (dishId) =>
    setSelectedItems((prev) => prev.filter((i) => i.itemId !== dishId));

  const changeQty = (dishId, delta) => {
    setSelectedItems((prev) =>
      prev.map((i) =>
        i.itemId === dishId
          ? { ...i, quantity: Math.max(1, (i.quantity || 1) + delta) }
          : i
      )
    );
  };

  // ── submit ──────────────────────────────────────────────────────────────────

  const handleContinue = () => {
    if (menuMode === 'package' && !selectedPackage) {
      toast.error('Please select a menu package');
      return;
    }
    if (menuMode === 'custom' && selectedItems.length === 0) {
      toast.error('Please add at least one dish to your custom menu');
      return;
    }
    onUpdate({
      menuMode,
      selectedPackage: menuMode === 'package' ? selectedPackage : null,
      selectedMenu: menuMode === 'custom' ? selectedItems : [],
      menuTotal,
      dietaryRestrictions: dietaryNote,
    });
    onNext();
  };

  // ── loading state ───────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#eadcc6] border-t-[#C0A04C]" />
        <p className="text-sm text-[#3a1224]/50">Loading menu options…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Mode toggle ── */}
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[#e8dcc8] bg-[#f8f4ed] p-1.5">
        {[
          { value: 'package', label: 'Set Packages', sub: 'Chef-curated bundles' },
          { value: 'custom', label: 'Build Your Own', sub: 'Pick dish by dish' },
        ].map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMenuMode(m.value)}
            className={cn(
              'flex flex-col items-center rounded-xl px-4 py-3 text-center transition-all',
              menuMode === m.value
                ? 'bg-[#3a1224] text-white shadow-md'
                : 'text-[#3a1224]/60 hover:text-[#3a1224]'
            )}
          >
            <span className="text-sm font-black">{m.label}</span>
            <span className={cn('mt-0.5 text-[10px]', menuMode === m.value ? 'text-white/60' : 'text-[#3a1224]/40')}>
              {m.sub}
            </span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          PACKAGE MODE
      ══════════════════════════════════════════════════════════════════════ */}
      {menuMode === 'package' && (
        <div className="space-y-4">
          {menuPackages.length === 0 ? (
            <EmptyState icon={UtensilsCrossed} title="No packages available" sub="Please contact the venue directly." />
          ) : (
            menuPackages.map((pkg) => {
              const isSelected = selectedPackage?._id === pkg._id;
              const isExpanded = expandedPackage === pkg._id;
              const pkgTotal = (pkg.pricePerPerson || 0) * (data.guests || 1);

              return (
                <div
                  key={pkg._id}
                  className={cn(
                    'overflow-hidden rounded-2xl border transition-all',
                    isSelected
                      ? 'border-[#C0A04C] shadow-[0_0_0_2px_rgba(192,160,76,0.25)]'
                      : 'border-[#e8dcc8] hover:border-[#C0A04C]/50'
                  )}
                >
                  {/* Card header — click to select */}
                  <button
                    type="button"
                    onClick={() => setSelectedPackage(pkg)}
                    className="flex w-full items-start gap-4 bg-white p-5 text-left"
                  >
                    {/* Radio indicator */}
                    <span className={cn(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                      isSelected ? 'border-[#C0A04C] bg-[#C0A04C]' : 'border-[#e8dcc8]'
                    )}>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-black text-[#3a1224]">{pkg.name}</p>
                          {pkg.description && (
                            <p className="mt-0.5 text-sm text-[#3a1224]/55">{pkg.description}</p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-lg font-black text-[#C0A04C]">
                            NPR {(pkg.pricePerPerson || 0).toLocaleString()}
                            <span className="ml-1 text-xs font-bold text-[#3a1224]/40">/ person</span>
                          </p>
                          <p className="mt-0.5 text-xs text-[#3a1224]/50">
                            NPR {pkgTotal.toLocaleString()} for {data.guests} guests
                          </p>
                        </div>
                      </div>

                      {/* Section chips */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(pkg.sections || []).map((sec, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-[#e8dcc8] bg-[#f8f4ed] px-2.5 py-1 text-[10px] font-black text-[#3a1224]/60"
                          >
                            {resolveCategoryLabel(sec.section?.title || sec.section || '')}
                            {sec.dishes?.length ? ` · ${sec.dishes.length}` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>

                  {/* Expand/collapse toggle */}
                  <button
                    type="button"
                    onClick={() => setExpandedPackage(isExpanded ? null : pkg._id)}
                    className="flex w-full items-center justify-center gap-1.5 border-t border-[#f0e8d8] bg-[#faf6ef] py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#3a1224]/50 transition hover:bg-[#f0e8d8] hover:text-[#3a1224]"
                  >
                    {isExpanded ? (
                      <>Hide dishes <ChevronUp className="h-3.5 w-3.5" /></>
                    ) : (
                      <>View all dishes <ChevronDown className="h-3.5 w-3.5" /></>
                    )}
                  </button>

                  {/* Expanded dish listing */}
                  {isExpanded && (
                    <div className="border-t border-[#f0e8d8] bg-white px-5 pb-5 pt-4">
                      {(pkg.sections || []).map((sec, si) => (
                        <div key={si} className="mb-5 last:mb-0">
                          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#C0A04C]">
                            {resolveCategoryLabel(sec.section?.title || sec.section || '')}
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {(sec.dishes || []).map((dish) => (
                              <div
                                key={dish._id}
                                className="rounded-xl border border-[#f0e8d8] bg-[#faf6ef] px-3.5 py-3"
                              >
                                <p className="text-sm font-black text-[#3a1224]">{dish.name}</p>
                                {dish.description && (
                                  <p className="mt-0.5 line-clamp-2 text-xs text-[#3a1224]/50">
                                    {dish.description}
                                  </p>
                                )}
                                <p className="mt-1.5 text-xs font-bold text-[#C0A04C]">
                                  NPR {(dish.price || 0).toLocaleString()} / person
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CUSTOM MODE
      ══════════════════════════════════════════════════════════════════════ */}
      {menuMode === 'custom' && (
        <div className="space-y-5">

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3a1224]/35" />
            <input
              type="text"
              placeholder="Search dishes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-[#e8dcc8] bg-white py-3 pl-10 pr-10 text-sm font-medium text-[#3a1224] placeholder-[#3a1224]/35 outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#3a1224]/40 hover:text-[#3a1224]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'rounded-full border px-3.5 py-1.5 text-xs font-black transition-all',
                  activeCategory === cat
                    ? 'border-[#3a1224] bg-[#3a1224] text-[#C0A04C]'
                    : 'border-[#e8dcc8] bg-white text-[#3a1224]/60 hover:border-[#3a1224]/30 hover:text-[#3a1224]'
                )}
              >
                {cat === 'all' ? '✦ All dishes' : resolveCategoryLabel(cat)}
              </button>
            ))}
          </div>

          {/* Dish grid grouped by category */}
          {visibleDishes.length === 0 ? (
            <EmptyState icon={Search} title="No dishes found" sub="Try a different search term or category." />
          ) : (
            Object.entries(groupedDishes).map(([category, dishes]) => (
              <div key={category}>
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#C0A04C]">
                  {resolveCategoryLabel(category)}
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {dishes.map((dish) => {
                    const sel = getSelectedItem(dish._id);
                    return (
                      <DishCard
                        key={dish._id}
                        dish={dish}
                        selected={sel}
                        onAdd={() => addItem(dish)}
                        onRemove={() => removeItem(dish._id)}
                        onIncrement={() => changeQty(dish._id, 1)}
                        onDecrement={() => changeQty(dish._id, -1)}
                      />
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Selected items cart */}
          {selectedItems.length > 0 && (
            <div className="rounded-2xl border border-[#e8dcc8] bg-[#faf6ef] p-4">
              <div className="mb-3 flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#C0A04C]" />
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#3a1224]/60">
                  Your menu · {selectedItems.length} {selectedItems.length === 1 ? 'dish' : 'dishes'}
                </p>
              </div>
              <div className="space-y-2">
                {selectedItems.map((item) => (
                  <div key={item.itemId} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[#3a1224]">{item.name}</p>
                      <p className="text-[10px] text-[#3a1224]/45">
                        NPR {(item.pricePerUnit || 0).toLocaleString()} × {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-black text-[#3a1224]">
                      NPR {((item.pricePerUnit || 0) * (item.quantity || 0)).toLocaleString()}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.itemId)}
                      className="shrink-0 rounded-lg p-1 text-[#3a1224]/30 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Dietary note ── */}
      <div>
        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.22em] text-[#3a1224]/50">
          Dietary restrictions or notes
        </label>
        <textarea
          rows={2}
          placeholder="e.g. Two guests are vegetarian, one is gluten-free…"
          value={dietaryNote}
          onChange={(e) => setDietaryNote(e.target.value)}
          className="w-full resize-none rounded-2xl border border-[#e8dcc8] bg-white px-4 py-3 text-sm text-[#3a1224] placeholder-[#3a1224]/30 outline-none transition focus:border-[#C0A04C] focus:ring-2 focus:ring-[#C0A04C]/15"
        />
      </div>

      {/* ── Total bar ── */}
      <div className="flex items-center justify-between rounded-2xl bg-[#3a1224] px-5 py-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#C0A04C]/70">Menu total</p>
          <p className="mt-0.5 text-sm text-white/60">
            {menuMode === 'package'
              ? selectedPackage
                ? `${selectedPackage.name} · ${data.guests} guests`
                : 'No package selected'
              : selectedItems.length > 0
              ? `${selectedItems.length} dishes selected`
              : 'No dishes selected yet'}
          </p>
        </div>
        <p className="text-2xl font-black text-[#C0A04C]">NPR {menuTotal.toLocaleString()}</p>
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
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#3a1224] text-[11px] font-black uppercase tracking-[0.18em] text-[#C0A04C] transition hover:bg-[#4a172d] disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Continue
        </button>
      </div>
    </div>
  );
}

// ── Dish card ─────────────────────────────────────────────────────────────────

function DishCard({ dish, selected, onAdd, onRemove, onIncrement, onDecrement }) {
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 transition-all',
        selected
          ? 'border-[#C0A04C] bg-white shadow-[0_0_0_2px_rgba(192,160,76,0.18)]'
          : 'border-[#e8dcc8] bg-white hover:border-[#C0A04C]/50'
      )}
    >
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-black text-[#3a1224]">{dish.name}</p>
          <p className="shrink-0 text-xs font-black text-[#C0A04C]">
            NPR {(dish.price || 0).toLocaleString()}
            <span className="ml-0.5 font-bold text-[#3a1224]/35">/pp</span>
          </p>
        </div>
        {dish.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#3a1224]/50">{dish.description}</p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {!selected ? (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-full border border-[#e8dcc8] bg-[#f8f4ed] px-3 py-1.5 text-xs font-black text-[#3a1224] transition hover:border-[#C0A04C] hover:bg-[#C0A04C]/10 hover:text-[#3a1224]"
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 overflow-hidden rounded-xl border border-[#e8dcc8] bg-[#f8f4ed]">
              <button
                type="button"
                onClick={onDecrement}
                className="flex h-7 w-7 items-center justify-center transition hover:bg-[#e8dcc8]"
              >
                <Minus className="h-3.5 w-3.5 text-[#3a1224]" />
              </button>
              <span className="min-w-[2rem] text-center text-sm font-black text-[#3a1224]">
                {selected.quantity}
              </span>
              <button
                type="button"
                onClick={onIncrement}
                className="flex h-7 w-7 items-center justify-center transition hover:bg-[#e8dcc8]"
              >
                <Plus className="h-3.5 w-3.5 text-[#3a1224]" />
              </button>
            </div>
            <span className="text-xs font-bold text-[#3a1224]/50">
              = NPR {((selected.pricePerUnit || 0) * (selected.quantity || 0)).toLocaleString()}
            </span>
          </div>
        )}

        {selected && (
          <button
            type="button"
            onClick={onRemove}
            className="rounded-lg p-1.5 text-[#3a1224]/25 transition hover:bg-red-50 hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#e8dcc8] py-12 text-center">
      <Icon className="h-8 w-8 text-[#3a1224]/20" />
      <p className="font-black text-[#3a1224]/50">{title}</p>
      <p className="text-sm text-[#3a1224]/35">{sub}</p>
    </div>
  );
}
