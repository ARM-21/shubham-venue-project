"use client";

import { useEffect, useState } from "react";
import axiosInstance from "lib/axios";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "config/routes";
import { AlertCircle, ArrowRight, Soup, UtensilsCrossed } from "lucide-react";
import { SiteCard, SiteEmptyState, SiteSectionHeader, SiteButton, resolveImage } from "components/site/SitePrimitives.jsx";

const FALLBACK_IMAGE = "/assets/business-images/menu-images/placeholder1.jpg";
const STATIC_MENU_IMAGES = {
  "gold-menu": FALLBACK_IMAGE,
  "silver-menu": FALLBACK_IMAGE,
  "diamond-menu": FALLBACK_IMAGE,
};

export default function ExploreMenus({ limit = 3 }) {
  const [menus, setMenus] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    const loadMenus = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/api/v1/menus");
        const payload = Array.isArray(res.data) ? res.data : res.data?.menus || [];
        if (!ignore) {
          setMenus(Array.isArray(payload) ? payload.slice(0, limit) : []);
          setError(null);
        }
      } catch {
        if (!ignore) setError("Failed to load menus");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    loadMenus();
    return () => {
      ignore = true;
    };
  }, [limit]);

  if (loading) return <MenuSkeleton />;
  if (error) return <MenuError message={error} />;
  if (!menus.length) return <MenuEmptyState />;

  return (
    <div>
      <SiteSectionHeader
        eyebrow="Menu Packages"
        title="Curated Menus"
        description="Choose dependable food packages designed for celebration service, from intimate gatherings to full banquet experiences."
        action={<SiteButton href={ROUTES.SITE.MENUS} variant="secondary" icon={null}>Explore menus</SiteButton>}
      />
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        {menus.map((menu) => (
          <MenuPackageCard key={menu?._id || menu?.slug || menu?.name} menu={menu} />
        ))}
      </div>
    </div>
  );
}

function MenuPackageCard({ menu }) {
  const menuImage = menu?.heroImage || menu?.image || STATIC_MENU_IMAGES[menu?.slug] || FALLBACK_IMAGE;
  const isFeatured = menu?.slug?.includes("gold") || menu?.dishCount > 20;
  const price = formatMenuPrice(menu?.pricePerPerson);
  const dishCount = menu?.dishCount || 18;
  const href = ROUTES.SITE.MENU_DETAILS(menu?.slug);

  return (
    <SiteCard
      as="article"
      className="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-champagne)] hover:shadow-[0_22px_60px_-44px_rgba(58,18,36,0.5)]"
    >
      <Link
        href={href}
        className="flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-champagne)]"
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--color-pearl)]">
          <Image
            src={resolveImage(menuImage, FALLBACK_IMAGE)}
            alt={menu?.name || "Menu package"}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/55 via-transparent to-transparent" />

          {isFeatured && (
            <div className="absolute right-4 top-4 rounded bg-white px-2 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)] shadow-sm">
              Featured
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-champagne)]">
              {menu?.category || "Package"}
            </span>
            <span className="text-sm font-black text-[var(--color-wine)]">
              {price}
            </span>
          </div>

          <h3 className="text-xl font-black leading-tight text-[var(--color-wine)]">
            {menu?.name || "Menu package"}
          </h3>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-stone)]">
            {menu?.description || "A balanced package prepared for polished event service and smooth guest hospitality."}
          </p>

          <div className="mt-auto pt-6">
            <div className="mb-5 flex items-center gap-4 border-y border-[var(--color-sand)] py-3 text-xs font-semibold text-[var(--color-wine)]">
              <span className="flex items-center gap-2">
                <UtensilsCrossed className="h-3.5 w-3.5 text-[var(--color-champagne)]" aria-hidden="true" />
                {dishCount} dishes
              </span>
              <span className="h-3 w-px bg-[var(--color-sand)]" aria-hidden="true" />
              <span>Full service</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-wine)] transition-colors group-hover:text-[var(--color-champagne)]">
                See dishes
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-wine)] text-white transition-colors group-hover:bg-[var(--color-champagne)] group-hover:text-[var(--color-wine)]">
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </SiteCard>
  );
}

function MenuError({ message }) {
  return (
    <div className="flex items-start gap-3 border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p>{message}. Please try again in a moment.</p>
    </div>
  );
}

function MenuEmptyState() {
  return (
    <SiteEmptyState
      icon={Soup}
      title="No menus available"
      description="Curated menu packages will appear here once the kitchen catalogue is ready."
    />
  );
}

function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-2xl border border-[var(--color-sand)] bg-white">
          <div className="aspect-[16/10] animate-pulse bg-[var(--color-pearl)]" />
          <div className="p-6">
            <div className="mb-4 flex justify-between">
              <div className="h-3 w-20 animate-pulse bg-[var(--color-ivory)]" />
              <div className="h-4 w-16 animate-pulse bg-[var(--color-ivory)]" />
            </div>
            <div className="h-6 w-2/3 animate-pulse bg-[var(--color-pearl)]" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full animate-pulse bg-[var(--color-ivory)]" />
              <div className="h-4 w-4/5 animate-pulse bg-[var(--color-ivory)]" />
            </div>
            <div className="mt-6 h-10 animate-pulse bg-[var(--color-ivory)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatMenuPrice(price) {
  if (typeof price !== "number" || Number.isNaN(price) || price <= 0) {
    return "Contact";
  }
  return `NPR ${price.toLocaleString()}`;
}
