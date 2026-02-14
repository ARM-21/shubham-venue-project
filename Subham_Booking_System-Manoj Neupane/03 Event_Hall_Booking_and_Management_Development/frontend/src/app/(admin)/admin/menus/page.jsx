"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  Crown,
  Filter,
  Layers3,
  Plus,
  Sparkles,
  UtensilsCrossed,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import AdminTopbar from "@/components/admin/dashboard/AdminTopbar";
import axiosInstance from "@/lib/axios";
import { ROUTES } from "@/config/routes";
import StatCards from '@/components/admin/menu/StatCards';
import Tabs from '@/components/admin/menu/Tabs';
import FeaturedBundles from '@/components/admin/menu/FeaturedBundles';
import InventorySection from '@/components/admin/menu/InventorySection';
import MenuEditModal from '@/components/admin/menu/ui/MenuEditModal';
import MenuViewModal from '@/components/admin/menu/ui/MenuViewModal';
import DishViewModal from '@/components/admin/menu/ui/DishViewModal';
import DishEditModal from '@/components/admin/menu/ui/DishEditModal';

const currencyFormatter = new Intl.NumberFormat("en-NP", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
});

const normalizeCategory = (val) => String(val || "").trim().toLowerCase();

const DEFAULT_CATEGORIES = [
  { key: "all", label: "All", icon: Layers3 },
  { key: "decor", label: "Decorations", icon: Sparkles },
  { key: "services", label: "Other Services", icon: Wrench },
];

export default function AdminMenusPage() {
  const [loading, setLoading] = useState(true);
  const [menus, setMenus] = useState([]);
  const [dishes, setDishes] = useState([]);
  const [sections, setSections] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [addingBundle, setAddingBundle] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [viewingMenu, setViewingMenu] = useState(null);
  const [editingDish, setEditingDish] = useState(null);
  const [viewingDish, setViewingDish] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(ROUTES.API.ADMIN.MENUS);
        const data = res?.data || {};
        setMenus(data.menus || []);
        setDishes(data.dishes || []);
        setSections(data.sections || []);
        setStats(data.stats || {});
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load menus");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const tabCategories = useMemo(() => DEFAULT_CATEGORIES, []);

  const categories = useMemo(() => {
    const map = new Map();

    (sections || []).forEach((section) => {
      const title = String(section.title || "").trim();
      const key = normalizeCategory(title);
      if (title && key && !map.has(key)) {
        map.set(key, title);
      }
    });

    if (!map.size && (dishes || []).length) {
      (dishes || []).forEach((dish) => {
        const title = String(dish.section?.title || "").trim();
        const key = normalizeCategory(title);
        if (title && key && !map.has(key)) {
          map.set(key, title);
        }
      });
    }

    const excluded = new Set(["decor", "services", "all"]);

    const dynamicCategories = Array.from(map.entries())
      .filter(([key]) => !excluded.has(key))
      .map(([key, title]) => ({
        key,
        label: title,
        icon: UtensilsCrossed,
      }));

    const base = DEFAULT_CATEGORIES.find((c) => c.key === "all");

    return [base, ...dynamicCategories];
  }, [sections, dishes]);

  const statCards = useMemo(() => [
    {
      id: "packages",
      title: "Total Menus",
      value: String(stats.totalMenus ?? 0),
      badge: stats.inactiveMenus ? `${stats.inactiveMenus} inactive` : "",
      badgeTone: stats.inactiveMenus ? "warning" : "positive",
      icon: Crown,
    },
    {
      id: "services",
      title: "Active Services",
      value: String(stats.activeDishes ?? stats.activeMenus ?? 0),
      subtitle: `${stats.totalDishes ?? 0} items tracked`,
      icon: Layers3,
    },
    {
      id: "pending",
      title: "Inactive Items",
      value: String((stats.totalDishes ?? 0) - (stats.activeDishes ?? 0)),
      badge: (stats.inactiveMenus || 0) > 0 ? `${stats.inactiveMenus} menus` : "",
      badgeTone: "warning",
      icon: BookOpenCheck,
    },
  ], [stats]);



  const toggleMenuStatus = async (menuId, current) => {
    const next = !current;
    setMenus((prev) => prev.map((m) => (m._id === menuId ? { ...m, isActive: next } : m)));
    try {
      await axiosInstance.patch(ROUTES.API.ADMIN.MENU_STATUS(menuId), { isActive: next });
      toast.success(next ? "Menu activated" : "Menu deactivated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update menu");
      setMenus((prev) => prev.map((m) => (m._id === menuId ? { ...m, isActive: current } : m)));
    }
  };

  const toggleDishStatus = async (dishId, current) => {
    const next = !current;
    setDishes((prev) => prev.map((d) => (d._id === dishId ? { ...d, isActive: next } : d)));
    try {
      await axiosInstance.patch(ROUTES.API.ADMIN.DISH_STATUS(dishId), { isActive: next });
      toast.success(next ? "Item enabled" : "Item disabled");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update item");
      setDishes((prev) => prev.map((d) => (d._id === dishId ? { ...d, isActive: current } : d)));
    }
  };

  // Category filters apply only to the dishes inventory; menus stay unfiltered.
  const menuCards = menus;

  const openEditMenu = (menu) => setEditingMenu(menu || null);
  const closeEditMenu = () => setEditingMenu(null);

  const handleMenuSave = async (id, payload) => {
    try {
      if (!id) {
        // create new menu
        const res = await axiosInstance.post(ROUTES.API.ADMIN.MENUS, payload);
        const created = res?.data?.menu || res?.data?.data || payload;
        setMenus((prev) => [created, ...(prev || [])]);
        setStats((prev) => ({ ...prev, totalMenus: (prev.totalMenus || 0) + 1 }));
        toast.success('Menu created');
        return created;
      }

      const res = await axiosInstance.patch(ROUTES.API.ADMIN.MENU_UPDATE(id), payload);
      const updated = res?.data?.menu || payload;
      setMenus((prev) => prev.map((m) => {
        const matchId = m._id || m.id;
        return matchId === id ? { ...m, ...updated } : m;
      }));
      toast.success('Menu updated');
      return updated;
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save menu');
      throw err;
    }
  };

  const handleView = (menu) => {
    setViewingMenu(menu || null);
  };

  const closeViewModal = () => {
    setViewingMenu(null);
  };

  const openFullMenuPage = (menu) => {
    const slugOrId = menu?.slug || menu?._id || menu?.id;
    if (!slugOrId) return;
    closeViewModal();
    router.push(ROUTES.ADMIN.MENU_DETAIL(slugOrId));
  };

  const handleDeleteMenu = async (id) => {
    if (!confirm("Delete this menu? This cannot be undone.")) return;
    try {
      await axiosInstance.delete(ROUTES.API.ADMIN.MENU_DELETE(id));
      setMenus((prev) => prev.filter((m) => (m._id || m.id) !== id));
      toast.success("Menu deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete menu");
    }
  };
  const openDishView = (dish) => {
    setViewingDish(dish || null);
  };

  const closeDishView = () => setViewingDish(null);

  const handleDeleteDish = async (id) => {

    const targetDish = dishes.find((d) => (d._id || d.id) === id);
    const wasActive = targetDish?.isActive !== false;
    if (!confirm("Delete this item? This cannot be undone.")) return;
    try {
      await axiosInstance.delete(ROUTES.API.ADMIN.DISH_DELETE(id));
      setDishes((prev) => prev.filter((d) => (d._id || d.id) !== id));
      setMenus((prev) => prev.map((m) => {
        const updatedSections = (m.sections || []).map((s) => {
          const filteredDishes = (s.dishes || []).filter((d) => (d._id || d.id) !== id);
          return { ...s, dishes: filteredDishes };
        });
        const dishRemoved = (m.sections || []).some((s) => (s.dishes || []).some((d) => (d._id || d.id) === id));
        return dishRemoved ? { ...m, sections: updatedSections, dishCount: typeof m.dishCount === "number" ? Math.max(0, m.dishCount - 1) : m.dishCount } : m;
      }));
      setStats((prev) => ({
        ...prev,
        totalDishes: Math.max(0, (prev.totalDishes ?? dishes.length) - 1),
        activeDishes: Math.max(0, (prev.activeDishes ?? dishes.filter((d) => d.isActive !== false).length) - (wasActive ? 1 : 0)),
      }));
      toast.success("Item deleted");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete item");
    }
  };

  const handleAddBundle = async () => {
    // Open the menu edit modal in "create" mode by passing an empty object
    setEditingMenu({});
  };

  const openDishEdit = (dish) => {
    setEditingDish(dish || null);
  };

  const closeDishEdit = () => {
    setEditingDish(null);
  };
  const handleDishSave = async (id, payload) => {
    try {
      const res = await axiosInstance.patch(ROUTES.API.ADMIN.DISH_UPDATE(id), payload);
      const updated = res?.data?.dish || payload;
      setDishes((prev) => prev.map((d) => (d._id === id ? { ...d, ...updated } : d)));
      setMenus((prev) => prev.map((m) => ({
        ...m,
        sections: (m.sections || []).map((s) => ({
          ...s,
          dishes: (s.dishes || []).map((d) => (d._id === id ? { ...d, ...updated } : d)),
        })),
      })));
      toast.success('Dish updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update dish');
      throw err;
    }
  };



  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopbar heading="Menu & Services" />

        <div className="flex-1 overflow-y-auto admin-scroll p-6 lg:p-8 mt-10">
          <div className="max-w-7xl mx-auto space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Menu & Services</h1>
                <p className="text-[var(--admin-muted)] max-w-2xl text-sm">
                  Curate catering bundles, decoration options, and extra services available for bookings.
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <button
                  className="px-5 py-2 bg-[var(--admin-primary)] text-white rounded-lg text-sm font-semibold shadow-lg shadow-[var(--admin-primary)]/25 hover:bg-[var(--admin-primary-dark)] transition-all flex items-center gap-2"
                  type="button"
                  onClick={handleAddBundle}
                >
                  <Plus className="size-4" />
                  Add New Item
                </button>
              </div>
            </div>

            <StatCards cards={statCards} />

            <Tabs tabCategories={tabCategories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />

            {/* Sections manager moved to per-menu page (menu detail) */}

            <FeaturedBundles menus={menuCards} loading={loading} onEdit={openEditMenu} onToggleStatus={toggleMenuStatus} onView={handleView} onDelete={handleDeleteMenu} onDuplicate={(id) => { toast('Not implemented'); }} onAddBundle={handleAddBundle} />

            <InventorySection
              loading={loading}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              categories={categories}
              sections={sections}
              dishes={dishes}
              toggleDishStatus={toggleDishStatus}
              openDishView={openDishView}
              openDishEdit={openDishEdit}
              handleDeleteDish={handleDeleteDish}
              onCreatedDish={(dish) => setDishes((prev) => [dish, ...(prev || [])])}
            />
          </div>
        </div>
      </div>

      <MenuEditModal editingMenu={editingMenu} closeEditMenu={closeEditMenu} onSave={handleMenuSave} />

      <MenuViewModal viewingMenu={viewingMenu} closeViewModal={closeViewModal} openFullMenuPage={openFullMenuPage} />

      <DishViewModal viewingDish={viewingDish} closeDishView={closeDishView} openDishEdit={openDishEdit} />

      <DishEditModal editingDish={editingDish} closeDishEdit={closeDishEdit} onSave={handleDishSave} sections={sections} />
    </>
  );
}
