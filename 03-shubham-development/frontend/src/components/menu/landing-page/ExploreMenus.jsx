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
  UtensilsCrossed, 
  Soup, 
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { SiteCard, SiteEmptyState, resolveImage } from "components/site/SitePrimitives.jsx";

const STATIC_MENU_IMAGES = {
  "gold-menu": "/assets/business-images/menu-images/placeholder1.jpg",
  "silver-menu": "/assets/business-images/menu-images/placeholder1.jpg",
  "diamond-menu": "/assets/business-images/menu-images/placeholder1.jpg",
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
          className="mb-8 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700"
        >
          <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          {error}. Please try again in a moment.
        </motion.div>
      ) : null}

      {loading ? (
        <MenuSkeleton />
      ) : menus.length ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {menus.map((m, idx) => {
            const menuImage = m.heroImage || m.image || STATIC_MENU_IMAGES[m.slug] || "/assets/business-images/menu-images/placeholder1.jpg";
            const isFeatured = m.slug?.includes('gold') || m.dishCount > 20;
            const price = typeof m.pricePerPerson === "number" ? `NPR ${m.pricePerPerson.toLocaleString()}` : "Contact";

            return (
              <motion.div
                key={m._id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
              >
                <SiteCard
                  as="article"
                  className={`group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 ${isFeatured ? 'border-[var(--color-champagne)]' : 'hover:border-[var(--color-champagne)]'}`}
                >
                  <Link href={ROUTES.SITE.MENU_DETAILS(m.slug)} className="flex h-full flex-col focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-champagne)]">
                    <div className="relative aspect-[16/11] overflow-hidden bg-[var(--color-pearl)]">
                      <Image
                        src={resolveImage(menuImage, "/assets/business-images/menu-images/placeholder1.jpg")}
                        alt={m.name || "Menu Image"}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/70 via-transparent to-transparent" />
                      <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)] backdrop-blur-md">
                        {m.category || 'Menu package'}
                      </div>
                      {isFeatured ? (
                        <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-champagne)] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-[var(--color-wine)] shadow-xl">
                          <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                          Featured
                        </div>
                      ) : null}
                      <div className="absolute bottom-4 left-4 rounded-2xl bg-white/95 px-4 py-2 shadow-xl backdrop-blur-md">
                        <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-stone)]">Per person</span>
                        <span className="text-sm font-black text-[var(--color-wine)]">{price}</span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-2xl font-black leading-tight text-[var(--color-wine)]">{m.name}</h3>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--color-stone)]">
                        {m.description || 'A balanced package prepared for polished event service and smooth guest hospitality.'}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-ivory)] p-3">
                          <ChefHat className="h-4 w-4 shrink-0 text-[var(--color-champagne)]" aria-hidden="true" />
                          <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[var(--color-wine)]">Prepared</span>
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl bg-[var(--color-ivory)] p-3">
                          <UtensilsCrossed className="h-4 w-4 shrink-0 text-[var(--color-champagne)]" aria-hidden="true" />
                          <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[var(--color-wine)]">{m.dishCount || 18}+ Dishes</span>
                        </div>
                        <div className="col-span-2 flex items-center gap-2 rounded-2xl bg-[var(--color-ivory)] p-3">
                          <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--color-champagne)]" aria-hidden="true" />
                          <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[var(--color-wine)]">Fresh, safe, and customizable</span>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-[var(--color-sand)] pt-5">
                        <span className="text-xs font-black uppercase tracking-[0.16em] text-[var(--color-stone)]">See dishes</span>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-wine)] text-white transition-colors group-hover:bg-[var(--color-champagne)] group-hover:text-[var(--color-wine)]">
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </SiteCard>
              </motion.div>
            );
          })}
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

function MenuSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3" aria-label="Loading menu packages">
      {[1, 2, 3].map((item) => (
        <div key={item} className="overflow-hidden rounded-2xl border border-[var(--color-sand)] bg-white shadow-[var(--shadow-soft)]">
          <div className="aspect-[16/11] animate-pulse bg-[var(--color-pearl)]" />
          <div className="space-y-4 p-6">
            <div className="h-6 w-2/3 animate-pulse rounded-full bg-[var(--color-pearl)]" />
            <div className="h-4 w-full animate-pulse rounded-full bg-[var(--color-ivory)]" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 animate-pulse rounded-2xl bg-[var(--color-ivory)]" />
              <div className="h-12 animate-pulse rounded-2xl bg-[var(--color-ivory)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
