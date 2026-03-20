"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { useQueryMenus } from "@queries/menus";
import { menuStatusMutator } from "@api/menu/menu-status-mutator";
import { menuDeleteMutator } from "@api/menu/menu-delete-mutator";
import {
  BookOpenCheck,
  Crown,
  Layers3,
  Plus,
  Sparkles,
  UtensilsCrossed,
  Wrench,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import AdminTopbar from "components/admin/dashboard/AdminTopbar";
import axiosInstance from "lib/axios";
import { ROUTES } from "config/routes";

// Sub-components
import StatCards from 'components/admin/menu/StatCards';
import Tabs from 'components/admin/menu/Tabs';
import FeaturedBundles from 'components/admin/menu/FeaturedBundles';
import InventorySection from 'components/admin/menu/InventorySection';
import MenuEditModal from 'components/admin/menu/ui/MenuEditModal';
import MenuViewModal from 'components/admin/menu/ui/MenuViewModal';
import DishViewModal from 'components/admin/menu/ui/DishViewModal'; // Fixed path check
import DishEditModal from 'components/admin/menu/ui/DishEditModal';

const normalizeCategory = (val) => String(val || "").trim().toLowerCase();

const DEFAULT_CATEGORIES = [
  { key: "all", label: "All Items", icon: Layers3 },
  { key: "decor", label: "Decorations", icon: Sparkles },
  { key: "services", label: "Other Services", icon: Wrench },
];

export default function AdminMenusPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // --- State ---
  const [menus, setMenus] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [sections, setSections] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Modal States
  const [editingMenu, setEditingMenu] = useState(null);
  const [viewingMenu, setViewingMenu] = useState(null);
  const [editingDish, setEditingDish] = useState(null);
  const [viewingDish, setViewingDish] = useState(null);

  // --- Data Fetching ---
  const { 
    data: menusData, 
    isLoading: loading, 
    isError: listError, 
    error: listErrorObj, 
    refetch 
  } = useQueryMenus();

  useEffect(() => {
    if (menusData) {
      setMenus(menusData.menus || []);
      setDishes(menusData.dishes || []);
      setSections(menusData.sections || []);
      setStats(menusData.stats || {});
    }
  }, [menusData]);

  if (listError) toast.error(listErrorObj?.message || "Failed to load menus");

  // --- Category Logic ---
  const categories = useMemo(() => {
    const map = new Map();
    // Extract dynamic categories from existing sections or dishes
    const source = sections.length ? sections : dishes.map(d => d.section).filter(Boolean);
    
    source.forEach((s) => {
      const title = String(s.title || "").trim();
      const key = normalizeCategory(title);
      if (title && key && !["decor", "services", "all"].includes(key)) {
        map.set(key, { key, label: title, icon: UtensilsCrossed });
      }
    });

    return [DEFAULT_CATEGORIES[0], ...Array.from(map.values())];
  }, [sections, dishes]);

  // --- Stats Configuration ---
  const statCards = useMemo(() => [
    {
      id: "packages",
      title: "Total Menus",
      value: String(stats.totalMenus ?? 0),
      badge: stats.inactiveMenus ? `${stats.inactiveMenus} inactive` : "All Active",
      badgeTone: stats.inactiveMenus ? "warning" : "positive",
      icon: Crown,
    },
    {
      id: "services",
      title: "Active Items",
      value: String(stats.activeDishes ?? 0),
      subtitle: `${stats.totalDishes ?? 0} total items`,
      icon: Layers3,
    },
    {
      id: "pending",
      title: "Inactive Items",
      value: String((stats.totalDishes ?? 0) - (stats.activeDishes ?? 0)),
      badge: stats.inactiveMenus > 0 ? `${stats.inactiveMenus} menus hidden` : "",
      badgeTone: "warning",
      icon: BookOpenCheck,
    },
  ], [stats]);

  // --- Mutations ---
  const statusMutation = useMutation({
    mutationFn: ({ id, payload }) => menuStatusMutator(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-menus"]);
      toast.success("Status updated");
    },
    onError: (err) => toast.error(err?.message || "Update failed")
  });

  const deleteMenuMutation = useMutation({
    mutationFn: (id) => menuDeleteMutator(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-menus"]);
      toast.success("Menu deleted successfully");
    }
  });

  // --- Handlers ---
  const handleMenuSave = async (id, payload) => {
    try {
      const res = id 
        ? await axiosInstance.patch(ROUTES.API.ADMIN.MENU_UPDATE(id), payload)
        : await axiosInstance.post(ROUTES.API.ADMIN.MENUS, payload);
      
      const updated = res?.data?.menu || res?.data?.data || payload;
      await refetch();
      toast.success(id ? 'Menu updated' : 'Menu created');
      return updated;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Save failed');
      throw err;
    }
  };

  const handleDishSave = async (id, payload) => {
    try {
      await axiosInstance.patch(ROUTES.API.ADMIN.DISH_UPDATE(id), payload);
      await refetch();
      toast.success('Item updated');
      setEditingDish(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    }
  };

  const toggleDishStatus = async (dishId, current) => {
    const next = !current;
    // Optimistic Update
    setDishes(prev => prev.map(d => d._id === dishId ? { ...d, isActive: next } : d));
    try {
      await axiosInstance.patch(ROUTES.API.ADMIN.DISH_STATUS(dishId), { isActive: next });
      toast.success(next ? "Enabled" : "Disabled");
    } catch (err) {
      setDishes(prev => prev.map(d => d._id === dishId ? { ...d, isActive: current } : d));
      toast.error("Failed to update item");
    }
  };

  const handleDeleteDish = async (id) => {
    if (!confirm("Delete this item permanently?")) return;
    try {
      await axiosInstance.delete(ROUTES.API.ADMIN.DISH_DELETE(id));
      await refetch();
      toast.success("Item removed");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden bg-[var(--admin-bg)]">
        <AdminTopbar heading="Menu & Services" />

        <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
          <div className="max-w-7xl mx-auto space-y-10 pb-12">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Menu & Services</h1>
                <p className="text-[var(--admin-muted)] max-w-2xl text-sm font-medium">
                  Curate catering bundles, decoration packages, and additional services for Shubham Venue.
                </p>
              </div>
              <button
                className="px-6 py-3 bg-[var(--admin-primary)] text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--admin-primary)]/20 hover:brightness-110 transition-all flex items-center gap-2 active:scale-95"
                onClick={() => setEditingMenu({})} // Empty object triggers "Create" mode
              >
                <Plus className="size-5" /> Add New Menu
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-[var(--admin-primary)] size-12" />
                <p className="text-[var(--admin-muted)] animate-pulse">Synchronizing inventory...</p>
              </div>
            ) : (
              <>
                <StatCards cards={statCards} />

                <Tabs 
                  tabCategories={DEFAULT_CATEGORIES} 
                  selectedCategory={selectedCategory} 
                  setSelectedCategory={setSelectedCategory} 
                />

                <FeaturedBundles 
                  menus={menus} 
                  loading={loading} 
                  onEdit={setEditingMenu} 
                  onToggleStatus={(id, current) => statusMutation.mutate({ id, payload: { isActive: !current } })} 
                  onView={setViewingMenu} 
                  onDelete={(id) => confirm("Delete this menu?") && deleteMenuMutation.mutate(id)} 
                  onAddBundle={() => setEditingMenu({})} 
                />

                <InventorySection
                  loading={loading}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  categories={categories}
                  sections={sections}
                  dishes={dishes}
                  toggleDishStatus={toggleDishStatus}
                  openDishView={setViewingDish}
                  openDishEdit={setEditingDish}
                  handleDeleteDish={handleDeleteDish}
                  onCreatedDish={() => refetch()}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <MenuEditModal 
        editingMenu={editingMenu} 
        closeEditMenu={() => setEditingMenu(null)} 
        onSave={handleMenuSave} 
      />

      <MenuViewModal 
        viewingMenu={viewingMenu} 
        closeViewModal={() => setViewingMenu(null)} 
        openFullMenuPage={(m) => router.push(ROUTES.ADMIN.MENU_DETAIL(m?.slug || m?._id))} 
      />

      <DishViewModal 
        viewingDish={viewingDish} 
        closeDishView={() => setViewingDish(null)} 
        openDishEdit={setEditingDish} 
      />

      <DishEditModal 
        editingDish={editingDish} 
        closeDishEdit={() => setEditingDish(null)} 
        onSave={handleDishSave} 
        sections={sections} 
      />
    </>
  );
}