"use client";

import { useEffect, useState } from "react";
import axiosInstance from "lib/axios";
import Image from "next/image";
import Link from "next/link";
import { ROUTES } from "config/routes";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  ChefHat,
  Soup,
  ShieldCheck,
  TrendingUp,
  UtensilsCrossed,
} from "lucide-react";
import {
  SiteCard,
  SiteEmptyState,
  resolveImage,
} from "components/site/SitePrimitives.jsx";

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

  return (
    <div className="relative overflow-hidden">
      {error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>{error}. Please try again in a moment.</p>
        </motion.div>
      ) : null}

      {loading ? (
        <MenuSkeleton />
      ) : menus.length ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {menus.map((menu, index) => (
            <MenuPackageCard
              key={menu?._id || menu?.slug || menu?.name}
              menu={menu}
              index={index}
            />
          ))}
        </div>
      ) : (
        <SiteEmptyState
          icon={Soup}
          title="No menus available"
          description="Curated menu packages will appear here once the kitchen catalogue is ready."
        />
      )}
    </div>
  );
}

function MenuPackageCard({ menu, index }) {
  const menuImage =
    menu?.heroImage || menu?.image || STATIC_MENU_IMAGES[menu?.slug] || FALLBACK_IMAGE;
  const isFeatured = menu?.slug?.includes("gold") || menu?.dishCount > 20;
  const price = formatMenuPrice(menu?.pricePerPerson);
  const dishCount = menu?.dishCount || 18;
  const href = ROUTES.SITE.MENU_DETAILS(menu?.slug);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
    >
      <SiteCard
        as="article"
        className={`group h-full overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
          isFeatured
            ? "border-[var(--color-champagne)] shadow-[0_22px_60px_-44px_rgba(192,160,76,0.9)]"
            : "hover:border-[var(--color-champagne)]"
        }`}
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
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/62 via-[#3a1224]/8 to-transparent" />

            <div className="absolute left-4 top-4 rounded-full border border-white/50 bg-white/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)] shadow-lg backdrop-blur-md">
              {menu?.category || "Menu package"}
            </div>

            {isFeatured ? (
              <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-champagne)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)] shadow-xl">
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                Featured
              </div>
            ) : null}

            <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 px-4 py-2 shadow-xl backdrop-blur-md">
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-stone)]">
                Per person
              </span>
              <span className="text-sm font-black text-[var(--color-wine)]">
                {price}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <h3 className="text-xl font-black leading-tight text-[var(--color-wine)]">
              {menu?.name || "Menu package"}
            </h3>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-stone)]">
              {menu?.description ||
                "A balanced package prepared for polished event service and smooth guest hospitality."}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <MenuChip icon={ChefHat} label="Prepared" />
              <MenuChip icon={UtensilsCrossed} label={`${dishCount}+ dishes`} />
              <div className="col-span-2">
                <MenuChip icon={ShieldCheck} label="Fresh and customizable" />
              </div>
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-[var(--color-sand)] pt-5">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[var(--color-stone)]">
                See dishes
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-wine)] text-white transition-colors group-hover:bg-[var(--color-champagne)] group-hover:text-[var(--color-wine)]">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>
      </SiteCard>
    </motion.div>
  );
}

function MenuChip({ icon: Icon, label }) {
  return (
    <div className="flex min-h-12 items-center gap-2 rounded-xl bg-[var(--color-ivory)] p-3">
      <Icon
        className="h-4 w-4 shrink-0 text-[var(--color-champagne)]"
        aria-hidden="true"
      />
      <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[var(--color-wine)]">
        {label}
      </span>
    </div>
  );
}

function MenuSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-5 md:grid-cols-3"
      aria-label="Loading menu packages"
    >
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-2xl border border-[var(--color-sand)] bg-white shadow-[var(--shadow-soft)]"
        >
          <div className="aspect-[16/10] animate-pulse bg-[var(--color-pearl)]" />
          <div className="space-y-4 p-5">
            <div className="h-6 w-2/3 animate-pulse rounded-full bg-[var(--color-pearl)]" />
            <div className="h-4 w-full animate-pulse rounded-full bg-[var(--color-ivory)]" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 animate-pulse rounded-xl bg-[var(--color-ivory)]" />
              <div className="h-12 animate-pulse rounded-xl bg-[var(--color-ivory)]" />
            </div>
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
