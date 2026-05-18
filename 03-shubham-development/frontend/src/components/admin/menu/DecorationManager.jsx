"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Edit3,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

const emptyScheme = {
  name: "",
  description: "",
  price: "",
  features: "",
  imageUrl: "",
  includedAddons: [],
  isActive: true,
};

const emptyAddon = {
  key: "",
  name: "",
  description: "",
  price: "",
  isActive: true,
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function addonId(addon) {
  return String(addon?._id || addon?.id || "");
}

function normalizeSchemeForm(item = {}) {
  return {
    ...emptyScheme,
    ...item,
    price: item.price ?? "",
    features: Array.isArray(item.features) ? item.features.join("\n") : item.features || "",
    includedAddons: Array.isArray(item.includedAddons)
      ? item.includedAddons.map((addon) => (typeof addon === "string" ? addon : addonId(addon))).filter(Boolean)
      : [],
    isActive: item.isActive !== false,
  };
}

function normalizeAddonForm(item = {}) {
  return {
    ...emptyAddon,
    ...item,
    price: item.price ?? "",
    isActive: item.isActive !== false,
  };
}

export default function DecorationManager() {
  const [schemes, setSchemes] = useState([]);
  const [addons, setAddons] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [schemeForm, setSchemeForm] = useState(null);
  const [addonForm, setAddonForm] = useState(null);

  const loadDecorations = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(ROUTES.API.ADMIN.DECORATIONS);
      setSchemes(res.data?.schemes || []);
      setAddons(res.data?.addons || []);
      setStats(res.data?.stats || {});
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load decorations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecorations();
  }, []);

  const filteredSchemes = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return schemes;
    return schemes.filter((scheme) =>
      [scheme.name, scheme.description, ...(scheme.features || [])]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [schemes, query]);

  const filteredAddons = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return addons;
    return addons.filter((addon) =>
      [addon.name, addon.key, addon.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [addons, query]);

  const saveScheme = async (event) => {
    event.preventDefault();
    if (!schemeForm?.name?.trim()) return toast.error("Theme name is required");

    const price = Number(schemeForm.price);
    if (!Number.isFinite(price) || price < 0) return toast.error("Enter a valid theme price");

    const payload = {
      name: schemeForm.name.trim(),
      description: schemeForm.description?.trim() || "",
      price,
      features: String(schemeForm.features || "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      imageUrl: schemeForm.imageUrl?.trim() || "",
      includedAddons: schemeForm.includedAddons || [],
      isActive: schemeForm.isActive !== false,
    };

    try {
      setSaving(true);
      if (schemeForm._id) {
        await axiosInstance.patch(ROUTES.API.ADMIN.DECORATION_SCHEME(schemeForm._id), payload);
      } else {
        await axiosInstance.post(ROUTES.API.ADMIN.DECORATION_SCHEMES, payload);
      }
      toast.success(schemeForm._id ? "Decoration theme updated" : "Decoration theme created");
      setSchemeForm(null);
      await loadDecorations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Theme save failed");
    } finally {
      setSaving(false);
    }
  };

  const saveAddon = async (event) => {
    event.preventDefault();
    if (!addonForm?.name?.trim()) return toast.error("Add-on name is required");

    const price = Number(addonForm.price);
    if (!Number.isFinite(price) || price < 0) return toast.error("Enter a valid add-on price");

    const payload = {
      key: addonForm.key?.trim() || undefined,
      name: addonForm.name.trim(),
      description: addonForm.description?.trim() || "",
      price,
      isActive: addonForm.isActive !== false,
    };

    try {
      setSaving(true);
      if (addonForm._id) {
        await axiosInstance.patch(ROUTES.API.ADMIN.DECORATION_ADDON(addonForm._id), payload);
      } else {
        await axiosInstance.post(ROUTES.API.ADMIN.DECORATION_ADDONS, payload);
      }
      toast.success(addonForm._id ? "Decoration add-on updated" : "Decoration add-on created");
      setAddonForm(null);
      await loadDecorations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Add-on save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleSchemeStatus = async (scheme) => {
    const next = scheme.isActive === false;
    setSchemes((prev) => prev.map((item) => (item._id === scheme._id ? { ...item, isActive: next } : item)));
    try {
      await axiosInstance.patch(ROUTES.API.ADMIN.DECORATION_SCHEME_STATUS(scheme._id), { isActive: next });
      toast.success(next ? "Theme visible to customers" : "Theme hidden from customers");
      await loadDecorations();
    } catch (err) {
      setSchemes((prev) => prev.map((item) => (item._id === scheme._id ? { ...item, isActive: scheme.isActive } : item)));
      toast.error(err?.response?.data?.message || "Status update failed");
    }
  };

  const toggleAddonStatus = async (addon) => {
    const next = addon.isActive === false;
    setAddons((prev) => prev.map((item) => (item._id === addon._id ? { ...item, isActive: next } : item)));
    try {
      await axiosInstance.patch(ROUTES.API.ADMIN.DECORATION_ADDON_STATUS(addon._id), { isActive: next });
      toast.success(next ? "Add-on visible to customers" : "Add-on hidden from customers");
      await loadDecorations();
    } catch (err) {
      setAddons((prev) => prev.map((item) => (item._id === addon._id ? { ...item, isActive: addon.isActive } : item)));
      toast.error(err?.response?.data?.message || "Status update failed");
    }
  };

  const deleteScheme = async (scheme) => {
    if (!confirm(`Delete "${scheme.name}" permanently?`)) return;
    try {
      await axiosInstance.delete(ROUTES.API.ADMIN.DECORATION_SCHEME(scheme._id));
      toast.success("Decoration theme deleted");
      await loadDecorations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const deleteAddon = async (addon) => {
    if (!confirm(`Delete "${addon.name}" permanently? It will be removed from included theme lists.`)) return;
    try {
      await axiosInstance.delete(ROUTES.API.ADMIN.DECORATION_ADDON(addon._id));
      toast.success("Decoration add-on deleted");
      await loadDecorations();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <section className="space-y-5">
      <div className="border border-[#3a1a1a] bg-[var(--admin-surface)] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#3a1a1a] flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--admin-primary)]">
              Customer booking decorations
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Decoration themes and add-ons</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--admin-muted)]">
              Manage the packages customers select during venue booking. Hidden items stay in admin records but disappear from the customer flow.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => setSchemeForm(normalizeSchemeForm())}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--admin-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--admin-primary-dark)]"
            >
              <Plus className="size-4" />
              New theme
            </button>
            <button
              type="button"
              onClick={() => setAddonForm(normalizeAddonForm())}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
            >
              <Plus className="size-4" />
              New add-on
            </button>
          </div>
        </div>

        <div className="grid gap-px bg-[#3a1a1a] sm:grid-cols-4">
          <SummaryCell label="Active themes" value={stats.activeSchemes ?? 0} />
          <SummaryCell label="Total themes" value={stats.totalSchemes ?? 0} />
          <SummaryCell label="Active add-ons" value={stats.activeAddons ?? 0} />
          <SummaryCell label="Total add-ons" value={stats.totalAddons ?? 0} />
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--admin-muted)]" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search themes and add-ons"
          className="w-full rounded-lg border border-[#3a1a1a] bg-[var(--admin-surface)] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[var(--admin-muted)] outline-none focus:border-[var(--admin-primary)]"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-3 rounded-xl border border-[#3a1a1a] bg-[var(--admin-surface)] p-6 text-[var(--admin-muted)]">
          <Loader2 className="size-5 animate-spin" />
          Loading decoration catalogue...
        </div>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
          <section className="border border-[#3a1a1a] bg-[var(--admin-surface)] rounded-xl overflow-hidden">
            <div className="border-b border-[#3a1a1a] px-5 py-4">
              <h4 className="text-base font-semibold text-white">Decoration themes</h4>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">Base packages shown in the customer booking decoration step.</p>
            </div>

            {filteredSchemes.length ? (
              <div className="divide-y divide-[#3a1a1a]">
                {filteredSchemes.map((scheme) => (
                  <ThemeRow
                    key={scheme._id}
                    scheme={scheme}
                    onEdit={() => setSchemeForm(normalizeSchemeForm(scheme))}
                    onToggle={() => toggleSchemeStatus(scheme)}
                    onDelete={() => deleteScheme(scheme)}
                  />
                ))}
              </div>
            ) : (
              <EmptyPanel title="No decoration themes" text="Create the first theme to make decoration selection useful for customers." />
            )}
          </section>

          <section className="border border-[#3a1a1a] bg-[var(--admin-surface)] rounded-xl overflow-hidden">
            <div className="border-b border-[#3a1a1a] px-5 py-4">
              <h4 className="text-base font-semibold text-white">Optional add-ons</h4>
              <p className="mt-1 text-xs text-[var(--admin-muted)]">Extras customers can add on top of a selected theme.</p>
            </div>

            {filteredAddons.length ? (
              <div className="divide-y divide-[#3a1a1a]">
                {filteredAddons.map((addon) => (
                  <AddonRow
                    key={addon._id}
                    addon={addon}
                    onEdit={() => setAddonForm(normalizeAddonForm(addon))}
                    onToggle={() => toggleAddonStatus(addon)}
                    onDelete={() => deleteAddon(addon)}
                  />
                ))}
              </div>
            ) : (
              <EmptyPanel title="No add-ons" text="Add optional services like photo booths, floral upgrades, or lighting." />
            )}
          </section>
        </div>
      )}

      {schemeForm ? (
        <SchemeModal
          form={schemeForm}
          setForm={setSchemeForm}
          addons={addons}
          saving={saving}
          onSubmit={saveScheme}
          onClose={() => setSchemeForm(null)}
        />
      ) : null}

      {addonForm ? (
        <AddonModal
          form={addonForm}
          setForm={setAddonForm}
          saving={saving}
          onSubmit={saveAddon}
          onClose={() => setAddonForm(null)}
        />
      ) : null}
    </section>
  );
}

function SummaryCell({ label, value }) {
  return (
    <div className="bg-[var(--admin-surface)] px-5 py-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--admin-muted)]">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function ThemeRow({ scheme, onEdit, onToggle, onDelete }) {
  const isActive = scheme.isActive !== false;
  const included = Array.isArray(scheme.includedAddons) ? scheme.includedAddons : [];
  return (
    <div className={`grid gap-4 px-5 py-4 lg:grid-cols-[92px_minmax(0,1fr)_auto] ${!isActive ? "opacity-60" : ""}`}>
      <div
        className="h-24 w-full rounded-lg border border-[#3a1a1a] bg-[var(--admin-bg)] bg-cover bg-center lg:w-24"
        style={{ backgroundImage: scheme.imageUrl ? `url(${scheme.imageUrl})` : undefined }}
      >
        {!scheme.imageUrl ? (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="size-6 text-[var(--admin-muted)]" />
          </div>
        ) : null}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h5 className="truncate text-sm font-semibold text-white">{scheme.name}</h5>
          <StatusBadge active={isActive} />
        </div>
        <p className="mt-1 text-sm font-semibold text-[var(--admin-primary)]">{formatCurrency(scheme.price)}</p>
        {scheme.description ? (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--admin-muted)]">{scheme.description}</p>
        ) : null}
        {scheme.features?.length ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {scheme.features.slice(0, 4).map((feature) => (
              <span key={feature} className="rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-white/70">
                {feature}
              </span>
            ))}
          </div>
        ) : null}
        {included.length ? (
          <p className="mt-2 text-[11px] text-[var(--admin-muted)]">
            Includes: {included.map((addon) => addon?.name).filter(Boolean).join(", ")}
          </p>
        ) : null}
      </div>

      <ActionCluster active={isActive} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} />
    </div>
  );
}

function AddonRow({ addon, onEdit, onToggle, onDelete }) {
  const isActive = addon.isActive !== false;
  return (
    <div className={`px-5 py-4 ${!isActive ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h5 className="truncate text-sm font-semibold text-white">{addon.name}</h5>
            <StatusBadge active={isActive} />
          </div>
          <p className="mt-1 text-sm font-semibold text-[var(--admin-primary)]">{formatCurrency(addon.price)}</p>
          {addon.description ? (
            <p className="mt-1 text-xs leading-5 text-[var(--admin-muted)]">{addon.description}</p>
          ) : null}
          {addon.key ? <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[var(--admin-muted)]">{addon.key}</p> : null}
        </div>
        <ActionCluster active={isActive} onEdit={onEdit} onToggle={onToggle} onDelete={onDelete} compact />
      </div>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${active ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200" : "border-amber-400/30 bg-amber-400/10 text-amber-100"}`}>
      {active ? "Customer visible" : "Hidden"}
    </span>
  );
}

function ActionCluster({ active, onEdit, onToggle, onDelete, compact = false }) {
  return (
    <div className={`flex shrink-0 ${compact ? "gap-1" : "gap-2 lg:self-center"}`}>
      <IconButton label="Edit" onClick={onEdit}>
        <Edit3 className="size-4" />
      </IconButton>
      <IconButton label={active ? "Hide" : "Show"} onClick={onToggle}>
        {active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </IconButton>
      <IconButton label="Delete" onClick={onDelete} danger>
        <Trash2 className="size-4" />
      </IconButton>
    </div>
  );
}

function IconButton({ label, onClick, children, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`rounded-lg border p-2 transition-colors ${danger ? "border-red-500/20 text-red-200 hover:bg-red-500/10" : "border-white/10 text-[var(--admin-muted)] hover:bg-white/5 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function EmptyPanel({ title, text }) {
  return (
    <div className="px-5 py-10 text-center">
      <Sparkles className="mx-auto size-8 text-[var(--admin-muted)]" />
      <p className="mt-3 text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm text-[var(--admin-muted)]">{text}</p>
    </div>
  );
}

function ModalShell({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/65" onClick={onClose} />
      <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#3a1a1a] bg-[var(--admin-surface)] p-6 shadow-2xl shadow-black/40">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-[var(--admin-muted)]">{subtitle}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-[var(--admin-muted)] hover:bg-white/5 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SchemeModal({ form, setForm, addons, saving, onSubmit, onClose }) {
  const selectedAddons = form.includedAddons || [];
  const toggleIncludedAddon = (id) => {
    setForm((prev) => ({
      ...prev,
      includedAddons: selectedAddons.includes(id)
        ? selectedAddons.filter((item) => item !== id)
        : [...selectedAddons, id],
    }));
  };

  return (
    <ModalShell
      title={form._id ? "Edit decoration theme" : "Create decoration theme"}
      subtitle="This is the main decoration package customers choose during booking."
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <TextField label="Theme name" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} required />
        <TextArea label="Description" value={form.description} onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} rows={3} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Price" type="number" value={form.price} onChange={(value) => setForm((prev) => ({ ...prev, price: value }))} required />
          <TextField label="Image URL" value={form.imageUrl} onChange={(value) => setForm((prev) => ({ ...prev, imageUrl: value }))} />
        </div>
        <TextArea
          label="Included features"
          value={form.features}
          onChange={(value) => setForm((prev) => ({ ...prev, features: value }))}
          rows={5}
          help="One feature per line. Example: Stage backdrop, table runners, warm uplighting."
        />
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--admin-muted)]">Included add-ons</p>
          {addons.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {addons.map((addon) => {
                const id = addonId(addon);
                const checked = selectedAddons.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleIncludedAddon(id)}
                    className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-left ${checked ? "border-[var(--admin-primary)] bg-[var(--admin-primary)]/10" : "border-white/10 hover:bg-white/5"}`}
                  >
                    <span className={`mt-0.5 flex size-4 items-center justify-center rounded border ${checked ? "border-[var(--admin-primary)] bg-[var(--admin-primary)]" : "border-white/20"}`}>
                      {checked ? <Check className="size-3 text-white" /> : null}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{addon.name}</span>
                      <span className="block text-xs text-[var(--admin-muted)]">{formatCurrency(addon.price)}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="rounded-lg border border-white/10 px-3 py-3 text-sm text-[var(--admin-muted)]">Create add-ons first if this theme includes extras.</p>
          )}
        </div>
        <ToggleField label="Visible to customers" checked={form.isActive !== false} onChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))} />
        <FormActions saving={saving} onClose={onClose} submitLabel={form._id ? "Save theme" : "Create theme"} />
      </form>
    </ModalShell>
  );
}

function AddonModal({ form, setForm, saving, onSubmit, onClose }) {
  return (
    <ModalShell
      title={form._id ? "Edit decoration add-on" : "Create decoration add-on"}
      subtitle="Add-ons appear as optional extras after a customer chooses a decoration theme."
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <TextField label="Add-on name" value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Internal key" value={form.key} onChange={(value) => setForm((prev) => ({ ...prev, key: value }))} help="Optional. Auto-generated from the name when blank." />
          <TextField label="Price" type="number" value={form.price} onChange={(value) => setForm((prev) => ({ ...prev, price: value }))} required />
        </div>
        <TextArea label="Description" value={form.description} onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} rows={4} />
        <ToggleField label="Visible to customers" checked={form.isActive !== false} onChange={(checked) => setForm((prev) => ({ ...prev, isActive: checked }))} />
        <FormActions saving={saving} onClose={onClose} submitLabel={form._id ? "Save add-on" : "Create add-on"} />
      </form>
    </ModalShell>
  );
}

function TextField({ label, value, onChange, type = "text", required = false, help = "" }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--admin-muted)]">{label}</span>
      <input
        type={type}
        value={value || ""}
        required={required}
        min={type === "number" ? "0" : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-lg border border-[#3a1a1a] bg-[var(--admin-bg)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--admin-primary)]"
      />
      {help ? <span className="mt-1 block text-xs text-[var(--admin-muted)]">{help}</span> : null}
    </label>
  );
}

function TextArea({ label, value, onChange, rows = 4, help = "" }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--admin-muted)]">{label}</span>
      <textarea
        value={value || ""}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full resize-none rounded-lg border border-[#3a1a1a] bg-[var(--admin-bg)] px-3 py-2.5 text-sm leading-6 text-white outline-none focus:border-[var(--admin-primary)]"
      />
      {help ? <span className="mt-1 block text-xs text-[var(--admin-muted)]">{help}</span> : null}
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-[#3a1a1a] bg-[var(--admin-bg)] px-3 py-3">
      <span className="text-sm font-semibold text-white">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-5 accent-[var(--admin-primary)]" />
    </label>
  );
}

function FormActions({ saving, onClose, submitLabel }) {
  return (
    <div className="flex justify-end gap-2 border-t border-[#3a1a1a] pt-4">
      <button type="button" onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5">
        Cancel
      </button>
      <button type="submit" disabled={saving} className="rounded-lg bg-[var(--admin-primary)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--admin-primary-dark)] disabled:opacity-60">
        {saving ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}
