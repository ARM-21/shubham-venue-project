"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Info, Search, UtensilsCrossed } from "lucide-react";
import { ROUTES } from "config/routes";
import { useQueryMenusPublic } from "@queries/customer/menus-public";
import { SitePageHeader, SiteCard, SiteEmptyState, SiteFilterBar, resolveImage } from "components/site/SitePrimitives.jsx";

const FALLBACK_IMAGE = "/assets/business-images/menu-images/placeholder.jpg";
const STATIC_MENU_IMAGES = {
  "gold-menu": FALLBACK_IMAGE,
  "silver-menu": FALLBACK_IMAGE,
  "diamond-menu": FALLBACK_IMAGE,
  "platinum-menu": FALLBACK_IMAGE,
};

export default function MenuListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");

  const { data: menusData = [], isLoading } = useQueryMenusPublic();
  const menus = Array.isArray(menusData) ? menusData : [];

  const filteredMenus = useMemo(() => {
    let result = [...menus];

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (menu) =>
          menu.name?.toLowerCase().includes(term) ||
          menu.description?.toLowerCase().includes(term)
      );
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.pricePerPerson - b.pricePerPerson;
        case "price_desc":
          return b.pricePerPerson - a.pricePerPerson;
        case "name":
          return a.name.localeCompare(b.name);
        case "dishes":
          return b.dishCount - a.dishCount;
        default:
          return 0;
      }
    });

    return result;
  }, [menus, searchTerm, sortBy]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[var(--color-ivory)]">
        <SitePageHeader title="Our Menu Packages" />
        <div className="site-container py-8">
          <div className="mb-8 h-16 animate-pulse rounded-xl border border-[var(--color-sand)] bg-white" />
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-2xl border border-[var(--color-sand)] bg-white" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-ivory)]">
      <SitePageHeader
        eyebrow="Catering Options"
        title="Our Menu Packages"
        description="Choose from our curated selection of premium menu packages for your special occasion."
      />

      <div className="site-container py-8 lg:py-12">
        {/* Filters */}
        <SiteFilterBar className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-stone)]" />
            <input
              type="text"
              placeholder="Search menus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-[var(--color-sand)] bg-[var(--color-ivory)] py-2 pl-9 pr-4 text-sm font-semibold text-[var(--color-wine)] placeholder:font-medium placeholder:text-[var(--color-stone)] focus:border-[var(--color-champagne)] focus:outline-none focus:ring-1 focus:ring-[var(--color-champagne)]"
            />
          </div>
          <div className="flex-1 sm:max-w-xs">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-md border border-[var(--color-sand)] bg-[var(--color-ivory)] px-4 py-2 text-sm font-bold text-[var(--color-wine)] focus:border-[var(--color-champagne)] focus:outline-none focus:ring-1 focus:ring-[var(--color-champagne)]"
            >
              <option value="name">Sort by Name</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="dishes">Most Dishes</option>
            </select>
          </div>
        </SiteFilterBar>

        {/* Results Info */}
        <div className="mb-8 flex items-center justify-between border-b border-[var(--color-sand)] pb-4">
          <p className="text-sm font-semibold text-[var(--color-stone)]">
            Showing <span className="font-black text-[var(--color-wine)]">{filteredMenus.length}</span> package(s)
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-champagne)] transition-colors hover:text-[var(--color-wine)]"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Grid */}
        {filteredMenus.length === 0 ? (
          <SiteEmptyState
            icon={Info}
            title="No Menus Found"
            description={
              searchTerm
                ? `No menus match "${searchTerm}". Try a different search.`
                : "No menus available at this time."
            }
            action={
              searchTerm ? (
                <button
                  onClick={() => setSearchTerm("")}
                  className="rounded-full bg-[var(--color-wine)] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[var(--color-wine-hover)]"
                >
                  Clear Search
                </button>
              ) : null
            }
          />
        ) : (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredMenus.map((menu) => (
              <MenuCard key={menu.id || menu.slug} menu={menu} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function MenuCard({ menu }) {
  const isCustomizable = menu.isCustomMenu;
  const sectionCount = Array.isArray(menu.sections) ? menu.sections.length : 0;
  const imageSrc = resolveImage(menu.heroImage || menu.image || menu.imageUrl || STATIC_MENU_IMAGES[menu.slug], FALLBACK_IMAGE);

  return (
    <SiteCard
      as={Link}
      href={ROUTES.SITE.MENU_DETAILS(menu.slug)}
      className="group flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-champagne)] hover:shadow-[var(--shadow-card)]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[var(--color-pearl)]">
        <Image
          src={imageSrc}
          alt={menu.name || "Menu"}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/55 via-[#3a1224]/5 to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {isCustomizable && (
            <span className="rounded bg-white/95 px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)] shadow-sm backdrop-blur-md">
              Customizable
            </span>
          )}
          {sectionCount > 0 && (
            <span className="rounded bg-[var(--color-champagne)] px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)] shadow-sm">
              {sectionCount} sections
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-black text-[var(--color-wine)] transition-colors group-hover:text-[var(--color-champagne)]">
          {menu.name}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-stone)]">
          {menu.description || "Premium menu thoughtfully curated for your special event."}
        </p>

        <div className="mt-auto pt-6">
          <div className="flex items-end justify-between border-y border-[var(--color-sand)] py-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-stone)]">Per person</p>
              <p className="mt-1 text-lg font-black text-[var(--color-wine)]">
                {typeof menu.pricePerPerson === "number" ? `NPR ${menu.pricePerPerson.toLocaleString()}` : "Custom"}
              </p>
            </div>
            <div className="text-right">
              <p className="flex items-center justify-end gap-1 text-lg font-black text-[var(--color-wine)]">
                <UtensilsCrossed className="h-3.5 w-3.5 text-[var(--color-champagne)]" />
                {menu.dishCount || 0}
              </p>
              <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[var(--color-stone)]">Dishes</p>
            </div>
          </div>

          <div className="mt-5 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-wine)] transition-colors group-hover:text-[var(--color-champagne)]">
              View Details →
            </span>
          </div>
        </div>
      </div>
    </SiteCard>
  );
}