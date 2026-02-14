"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Crown, Edit, Search, Sparkles, Star, Users, ChevronUp, ChevronDown, Trash2, Settings } from "lucide-react";
import toast from "react-hot-toast";
import SectionEditModal from "@/components/admin/menu/ui/SectionEditModal";
import AddSectionToMenuModal from "@/components/admin/menu/ui/AddSectionToMenuModal";
import DishCreateModal from "@/components/admin/menu/ui/DishCreateModal";
import AdminTopbar from "@/components/admin/dashboard/AdminTopbar";
import axiosInstance from "@/lib/axios";
import { ROUTES } from "@/config/routes";

const normalizeCategory = (val) => String(val || "").trim().toLowerCase();

const currencyFormatter = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
});

export default function AdminMenuDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState(null);
  const [viewCategory, setViewCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(ROUTES.API.ADMIN.MENU_DETAIL(slug));
      setMenu(res?.data?.menu || null);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load menu");
      router.push(ROUTES.ADMIN.MENUS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchMenu();
  }, [slug, router]);
  const price = useMemo(() => (
    typeof menu?.pricePerPerson === "number" ? currencyFormatter.format(menu.pricePerPerson) : "N/A"
  ), [menu?.pricePerPerson]);

  const sections = menu?.sections || [];

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSection, setModalSection] = useState(null);
  const [addSectionModalOpen, setAddSectionModalOpen] = useState(false);
  const [dishCreateOpen, setDishCreateOpen] = useState(false);
  const [dishCreateSectionId, setDishCreateSectionId] = useState(null);
  const [dishCreateExistingIds, setDishCreateExistingIds] = useState([]);

  const totalItems = useMemo(
    () => sections.reduce((sum, s) => sum + (s.dishes?.length || 0), 0),
    [sections],
  );

  const categories = useMemo(() => {
    const mapped = sections.map((s, idx) => {
      const label = s.section?.title || `Section ${idx + 1}`;
      const key = normalizeCategory(label) || `section-${idx}`;
      const count = s.dishes?.length || 0;
      const order = typeof s.section?.order === 'number' ? s.section.order : 0;
      return { key, label, count, order };
    });

    // Sort categories by the underlying section.order (ascending)
    mapped.sort((a, b) => a.order - b.order);

    return [
      { key: "all", label: "All Items", count: totalItems },
      ...mapped,
    ];
  }, [sections, totalItems]);

  const filteredSections = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return sections
      .map((sectionEntry, idx) => {
        const label = sectionEntry.section?.title || `Section ${idx + 1}`;
        const key = normalizeCategory(label) || `section-${idx}`;

        const dishes = (sectionEntry.dishes || []).filter((dish) => {
          if (!query) return true;
          return [dish.name, dish.description].filter(Boolean).some((field) => field.toLowerCase().includes(query));
        });

        const visible = viewCategory === "all" ? true : key === viewCategory;
        return visible ? { ...sectionEntry, sectionKey: key, sectionLabel: label, dishes } : null;
      })
      .filter(Boolean);
  }, [sections, viewCategory, searchTerm]);

  const visibleItems = useMemo(
    () => filteredSections.reduce((sum, s) => sum + (s.dishes?.length || 0), 0),
    [filteredSections],
  );

  if (loading) return (
    <>
      <AdminTopbar heading="Menu Details" />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[var(--admin-muted)]">Loading menu...</p>
      </div>
    </>
  );

  if (!menu) return (
    <>
      <AdminTopbar heading="Menu Details" />
      <div className="flex-1 flex items-center justify-center">
        <p className="text-[var(--admin-muted)]">Menu not found.</p>
      </div>
    </>
  );

  return (
    <>
      <AdminTopbar heading="Menu Details" />

      <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-10 mt-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="relative overflow-hidden rounded-2xl border border-[#3a1a1a] bg-gradient-to-br from-[#2b0f1c] via-[#190b14] to-[#0c0a16] shadow-2xl">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.12),transparent_25%)]" />
            <div className="relative p-6 md:p-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push(ROUTES.ADMIN.MENUS)}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10"
                    aria-label="Back to menus"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/10 text-white border border-white/20">{menu.isCustomMenu ? "Premium Bundle" : "Menu"}</span>
                      <span className="text-[11px] text-white/70">{menu.slug || menu._id}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mt-2">{menu.name}</h1>
                    <p className="text-[var(--admin-muted)] mt-1 max-w-2xl">{menu.description || "No description provided."}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-white">
                      <div className="text-2xl font-bold">{price}<span className="text-sm text-white/70 font-normal"> / head</span></div>
      <SectionEditModal open={modalOpen} onClose={() => setModalOpen(false)} menuSlug={slug} section={modalSection} onSaved={() => fetchMenu()} />
      <AddSectionToMenuModal open={addSectionModalOpen} onClose={() => setAddSectionModalOpen(false)} menuSlug={slug} onSaved={() => fetchMenu()} />
      <DishCreateModal
        open={dishCreateOpen}
        onClose={() => setDishCreateOpen(false)}
        menuSlug={slug}
        sectionId={dishCreateSectionId}
        existingDishIds={dishCreateExistingIds}
        onCreated={() => fetchMenu()}
      />
                      <div className="text-sm text-white/80 flex items-center gap-2">
                        <Sparkles className="size-4 text-[var(--admin-primary)]" />
                        {sections.length} sections • {totalItems} dishes
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${menu.isActive !== false ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/25" : "bg-rose-500/10 text-rose-200 border border-rose-500/20"}`}>{menu.isActive !== false ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => router.push(ROUTES.ADMIN.MENUS)}
                    className="px-4 py-2 rounded-lg border border-white/15 text-white/80 hover:text-white hover:border-white/40"
                  >
                    Back to menus
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-lg bg-[var(--admin-primary)] text-white font-semibold shadow hover:bg-[var(--admin-primary-dark)] flex items-center gap-2"
                  >
                    <Edit className="size-4" /> Edit details
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                  <Crown className="size-8 text-[var(--admin-primary)]" />
                  <div>
                    <p className="text-sm text-white/70">Sections</p>
                    <p className="text-2xl font-bold text-white">{sections.length}</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                  <Users className="size-8 text-[var(--admin-primary)]" />
                  <div>
                    <p className="text-sm text-white/70">Total Items</p>
                    <p className="text-2xl font-bold text-white">{totalItems}</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
                  <Star className="size-8 text-[var(--admin-primary)]" />
                  <div>
                    <p className="text-sm text-white/70">Menu Status</p>
                    <p className={`text-lg font-bold ${menu.isActive !== false ? "text-emerald-200" : "text-rose-200"}`}>{menu.isActive !== false ? "Active" : "Inactive"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 bg-[var(--admin-surface)] border border-[#3a1a1a] rounded-2xl p-5 shadow-lg shadow-black/20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative w-full lg:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--admin-muted)]" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--admin-bg)] border border-[#3a1a1a] rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--admin-primary)] focus:ring-1 focus:ring-[var(--admin-primary)]"
                  placeholder="Search dishes..."
                />
              </div>
              <span className="text-[var(--admin-muted)] text-sm">Showing {filteredSections.length} sections • {visibleItems} items</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto admin-scroll pb-1">
              {categories.map((cat) => {
                const active = viewCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setViewCategory(cat.key)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border transition-colors flex items-center gap-2 ${
                      active
                        ? "bg-[var(--admin-primary)] text-white border-[var(--admin-primary)]"
                        : "text-[var(--admin-muted)] border-[#3a1a1a] hover:text-white hover:border-[var(--admin-primary)]/60"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${active ? "bg-white/15 text-white" : "bg-white/5 text-white/80"}`}>{cat.count}</span>
                  </button>
                );
              })}
              <button type="button" onClick={() => setAddSectionModalOpen(true)} className="whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold border text-[var(--admin-muted)] border-[#3a1a1a] hover:text-white hover:border-[var(--admin-primary)]/60">+ Add Section</button>
            </div>

            <div className="space-y-6">
              {sections.length === 0 ? (
                <div className="bg-[var(--admin-bg)] border border-[#3a1a1a] rounded-2xl p-8 text-center">
                  <h3 className="text-xl font-semibold text-white">No sections attached</h3>
                  <p className="text-[var(--admin-muted)] mt-2">You don't have any sections attached to this menu yet. Create a new section or attach an existing one to get started.</p>
                  <div className="mt-4 flex items-center justify-center gap-3">
                    <button type="button" onClick={() => { setModalSection(null); setModalOpen(true); }} className="px-4 py-2 rounded-lg bg-[var(--admin-primary)] text-white font-semibold">Create section</button>
                    <button type="button" onClick={() => setAddSectionModalOpen(true)} className="px-4 py-2 rounded-lg border border-[#3a1a1a] text-[var(--admin-muted)]">Attach existing</button>
                  </div>
                </div>
              ) : filteredSections.length > 0 ? (
                filteredSections.map((sectionEntry, index) => {
                  const section = sectionEntry.section;
                  const dishes = sectionEntry.dishes || [];
                  return (
                    <section key={section?._id || index} className="bg-[var(--admin-bg)] border border-[#3a1a1a] rounded-2xl overflow-hidden">
                      <div className="p-6 border-b border-[#3a1a1a] flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-1.5 h-6 rounded-full bg-[var(--admin-primary)]" />
                              <h3 className="text-xl font-semibold text-white">{section?.title || `Section ${index + 1}`}</h3>
                            </div>
                            <p className="text-[var(--admin-muted)]">{section?.description || ""}</p>
                          </div>
                        </div>
                          <div className="flex items-center gap-2">
                        <button aria-label="Move section up" className="p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 text-sm flex items-center justify-center" onClick={async () => {
                            const idx = sections.findIndex(s => String(s.section?._id || s.section) === String(section?._id));
                            if (idx <= 0) return;
                            const ids = sections.map(s => String(s.section?._id || s.section));
                            const item = ids.splice(idx,1)[0];
                            ids.splice(idx-1,0,item);
                            const order = ids.map((id, i) => ({ _id: id, order: i }));
                            try { setLoading(true); await axiosInstance.post(`${ROUTES.API.ADMIN.MENU_DETAIL(slug)}/sections/reorder`, { order }); await fetchMenu(); toast.success('Order saved'); } catch (err) { toast.error(err?.response?.data?.message || 'Reorder failed'); } finally { setLoading(false); }
                          }}><ChevronUp className="size-4 text-[var(--admin-muted)]" /></button>
                          <button aria-label="Move section down" className="p-2 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 text-sm flex items-center justify-center" onClick={async () => {
                            const idx = sections.findIndex(s => String(s.section?._id || s.section) === String(section?._id));
                            if (idx === -1 || idx >= sections.length - 1) return;
                            const ids = sections.map(s => String(s.section?._id || s.section));
                            const item = ids.splice(idx,1)[0];
                            ids.splice(idx+1,0,item);
                            const order = ids.map((id, i) => ({ _id: id, order: i }));
                            try { setLoading(true); await axiosInstance.post(`${ROUTES.API.ADMIN.MENU_DETAIL(slug)}/sections/reorder`, { order }); await fetchMenu(); toast.success('Order saved'); } catch (err) { toast.error(err?.response?.data?.message || 'Reorder failed'); } finally { setLoading(false); }
                          }}><ChevronDown className="size-4 text-[var(--admin-muted)]" /></button>
                          <button className="px-3 py-1 border rounded flex items-center gap-2 bg-white/5 hover:bg-white/10" onClick={() => { setModalSection(section); setModalOpen(true); }}><Settings className="size-4" /> <span className="hidden sm:inline">Manage</span></button>
                          <button title="Delete section" className="px-3 py-1 border rounded flex items-center gap-2 text-rose-400 hover:bg-rose-700/5" onClick={async () => {
                            if (!confirm('Delete this section?')) return;
                            try { setLoading(true); await axiosInstance.delete(`${ROUTES.API.ADMIN.MENU_DETAIL(slug)}/sections/${section?._id}`); toast.success('Section deleted'); await fetchMenu(); } catch (err) { toast.error(err?.response?.data?.message || 'Delete failed'); } finally { setLoading(false); }
                          }}><Trash2 className="size-4" /><span className="hidden sm:inline">Delete</span></button>
                          <span className="text-xs text-[var(--admin-muted)] uppercase tracking-wide">{dishes.length} items</span>
                        </div>
                      </div>
                      <div className="p-6">
                        {dishes.length ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {dishes.map((dish) => (
                              <div key={dish._id} className="p-4 rounded-xl border border-[#3a1a1a] bg-[var(--admin-surface)] hover:border-[var(--admin-primary)]/60 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 rounded-lg bg-cover bg-center border border-[#3a1a1a]" style={{ backgroundImage: `url(${dish.image || '/assets/business-images/hero.jpg'})` }} aria-label={dish.name} />
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-white leading-tight">{dish.name}</h4>
                                    <p className="text-xs text-[var(--admin-muted)] line-clamp-2 mt-1">{dish.description || ""}</p>
                                  </div>
                                  <div className="text-right">
                                    {dish.price ? (
                                      <div className="text-sm font-semibold text-[var(--admin-primary)]">{currencyFormatter.format(dish.price)}</div>
                                    ) : (
                                      <div className="text-sm text-[var(--admin-muted)]">N/A</div>
                                    )}
                                    <div className="text-[10px] text-[var(--admin-muted)] mt-1">{dish.unitLabel || ""}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 border border-dashed border-[#2a2a2a] rounded-lg bg-[var(--admin-bg)] text-[var(--admin-muted)]">
                            <p className="mb-3">No dishes in this section yet.</p>
                            <div className="flex items-center justify-start gap-3">
                              <button type="button" onClick={() => {
                                // open dish create modal with this section preselected
                                const sid = section?._id || section;
                                const entry = sections.find(s => String(s.section?._id || s.section) === String(sid));
                                const existing = (entry?.dishes || []).map(d => String(d._id || d));
                                setDishCreateSectionId(sid);
                                setDishCreateExistingIds(existing);
                                setDishCreateOpen(true);
                              }} className="px-4 py-2 rounded-lg bg-[var(--admin-primary)] text-white font-semibold">Add items</button>
                              <button type="button" onClick={() => setAddSectionModalOpen(true)} className="px-4 py-2 rounded-lg border border-[#3a1a1a] text-[var(--admin-muted)]">Attach existing</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </section>
                  );
                })
              ) : (
                (() => {
                  const selectedCat = categories.find(c => c.key === viewCategory);
                  if (viewCategory !== 'all' && selectedCat && selectedCat.count === 0) {
                    return (
                      <div className="bg-[var(--admin-bg)] border border-[#3a1a1a] rounded-2xl p-6 text-center text-[var(--admin-muted)]">
                        <p className="mb-3">This section has no dishes yet.</p>
                        <div className="flex items-center justify-center gap-3">
                          <button type="button" onClick={() => { setModalSection({ title: selectedCat.label }); setModalOpen(true); }} className="px-4 py-2 rounded-lg bg-[var(--admin-primary)] text-white font-semibold">Create section</button>
                          <button type="button" onClick={() => setAddSectionModalOpen(true)} className="px-4 py-2 rounded-lg border border-[#3a1a1a] text-[var(--admin-muted)]">Attach existing</button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-[var(--admin-bg)] border border-[#3a1a1a] rounded-2xl p-6 text-center text-[var(--admin-muted)]">
                      No dishes match your filters.
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}