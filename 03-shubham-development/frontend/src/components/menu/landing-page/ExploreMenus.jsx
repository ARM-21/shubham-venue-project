"use client";

import { useEffect, useState } from "react";
import axiosInstance from "lib/axios";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ROUTES } from "config/routes";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  ChefHat, 
  UtensilsCrossed, 
  Star, 
  Sparkles, 
  Soup, 
  Coffee, 
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

const STATIC_MENU_IMAGES = {
  "gold-menu": "/assets/business-images/menu-images/placeholder1.jpg",
  "silver-menu": "/assets/business-images/menu-images/placeholder1.jpg",
  "diamond-menu": "/assets/business-images/menu-images/placeholder1.jpg",
};

export default function ExploreMenus({ limit = 3 }) {
  const router = useRouter();
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
      } catch (err) {
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

  const currencyFormatter = (val) => new Intl.NumberFormat("en-NP", { 
    style: "currency", 
    currency: "NPR", 
    maximumFractionDigits: 0 
  }).format(val);

  return (
    <div className="px-6 py-24 relative overflow-hidden">
      {/* Premium Textures */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#3a1224]/3 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#C0A04C]/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 -z-10" />

      <div className="max-w-[1800px] mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between items-center text-center md:text-left mb-24 gap-8">
          <div className="max-w-xl">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3a1224]/5 border border-[#3a1224]/10 text-[#3a1224] text-[10px] font-bold uppercase tracking-[0.3em] mb-6"
            >
              <ChefHat className="w-3.5 h-3.5" /> Culinary Excellence
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-bold text-[#3a1224] tracking-tight leading-none mb-8"
            >
              Signature <span className="text-[#C0A04C] italic font-serif">Menus</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-[#3a1224]/60 text-lg md:text-xl font-light leading-relaxed"
            >
              Enjoy a grand feast with our carefully picked menus. We have food for every taste.
            </motion.p>
          </div>

          <motion.button 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onClick={() => router.push(ROUTES.SITE.MENUS)}
            className="group flex items-center justify-center py-4 px-10 rounded-full bg-[#3a1224] text-white text-xs font-bold uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            See all food options
            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] text-red-600 text-center mb-12"
          >
            <p className="font-display font-bold text-xl mb-1">Culinary Access Limited</p>
            <p className="text-sm opacity-80">{error}</p>
          </motion.div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-[#fdfaf6] rounded-[3rem] p-6 h-[500px] border border-[#3a1224]/5">
                <div className="w-full h-72 bg-[#3a1224]/5 rounded-[2.5rem] mb-8" />
                <div className="h-8 bg-[#3a1224]/5 rounded-full w-2/3 mb-4" />
                <div className="h-4 bg-[#3a1224]/5 rounded-full w-1/2 mb-12" />
                <div className="h-12 bg-[#3a1224]/10 rounded-2xl w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {menus.length === 0 && !error && (
              <div className="col-span-full py-32 text-center rounded-[4rem] border-2 border-dashed border-[#3a1224]/10">
                <Soup className="w-12 h-12 text-[#3a1224]/20 mx-auto mb-6" />
                <p className="text-[#3a1224]/40 font-display text-xl uppercase tracking-widest px-8">No professional menus curated yet.</p>
              </div>
            )}
            {menus.map((m, idx) => {
              const menuImage = m.heroImage || m.image || STATIC_MENU_IMAGES[m.slug] || "/assets/business-images/menu-images/placeholder1.jpg";
              const resolvedImage = menuImage.startsWith('http') ? menuImage : (menuImage.startsWith('/assets') ? menuImage : `${process.env.NEXT_PUBLIC_API_BASE_URL}${menuImage}`);
              
              const isPremium = m.slug?.includes('gold') || m.dishCount > 20;

              return (
                <motion.article
                  key={m._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15, duration: 0.8 }}
                  className="group relative h-full flex flex-col"
                  onClick={() => router.push(ROUTES.SITE.MENU_DETAILS(m.slug))}
                >
                  {/* Luxury Card Container */}
                  <div className={`relative flex-1 bg-white rounded-[3.5rem] p-6 transition-all duration-700 hover:-translate-y-3 cursor-pointer border ${isPremium ? 'border-[#C0A04C]/30 shadow-[0_30px_60px_-12px_rgba(58,18,36,0.12)]' : 'border-[#3a1224]/5 shadow-sm hover:shadow-2xl'}`}>
                    
                    {/* Badge */}
                    {isPremium && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-[#C0A04C] text-[#3a1224] text-[10px] font-black px-6 py-2.5 rounded-full shadow-xl tracking-[0.25em] uppercase whitespace-nowrap flex items-center gap-2 border border-white/20">
                          <TrendingUp className="w-3.5 h-3.5" /> High Demand
                        </div>
                      </div>
                    )}

                    {/* Image Box */}
                    <div className="relative w-full h-[320px] mb-8 rounded-[3rem] overflow-hidden shadow-2xl group-hover:shadow-[#3a1224]/10 transition-shadow duration-700">
                      <Image
                        src={resolvedImage}
                        alt={m.name || "Menu Image"}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out grayscale-[10%] group-hover:grayscale-0"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      
                      {/* Category Pill */}
                      <div className="absolute top-6 left-6 z-10">
                        <span className="bg-white/10 backdrop-blur-2xl border border-white/20 text-[10px] font-bold uppercase tracking-[0.2em] text-white px-4 py-2 rounded-full shadow-lg">
                          {m.category || 'Luxury Selection'}
                        </span>
                      </div>

                      {/* Floating Price */}
                      <div className="absolute bottom-6 left-6 right-6 z-10 flex items-center justify-between">
                        <div className="bg-white/95 backdrop-blur-xl px-5 py-2.5 rounded-[1.5rem] shadow-2xl border border-white/50">
                          <span className="text-[10px] font-bold text-[#3a1224]/40 uppercase tracking-[0.1em] block mb-0.5 leading-none">Investment</span>
                          <span className="text-lg font-display font-bold text-[#3a1224]">
                            {typeof m.pricePerPerson === "number" ? currencyFormatter(m.pricePerPerson) : "Contact us"}
                          </span>
                          <span className="text-[9px] text-[#3a1224]/40 font-bold ml-1 uppercase">/ Guest</span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-[1px] bg-[#C0A04C]" />
                        <span className="text-[10px] font-bold text-[#C0A04C] uppercase tracking-[0.3em]">Signature Collection</span>
                      </div>
                      
                      <h3 className="text-3xl font-display font-bold text-[#3a1224] transition-colors mb-4 leading-tight">{m.name}</h3>
                      
                      {/* Features Grid */}
                      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-8">
                        <div className="flex items-center gap-2.5 py-2 px-3 bg-[#fdfaf6] rounded-xl border border-[#3a1224]/5">
                          <ChefHat className="w-3.5 h-3.5 text-[#C0A04C]" />
                          <span className="text-[10px] font-bold text-[#3a1224] uppercase tracking-tighter">Chef Curated</span>
                        </div>
                        <div className="flex items-center gap-2.5 py-2 px-3 bg-[#fdfaf6] rounded-xl border border-[#3a1224]/5">
                          <UtensilsCrossed className="w-3.5 h-3.5 text-[#C0A04C]" />
                          <span className="text-[10px] font-bold text-[#3a1224] uppercase tracking-tighter">{m.dishCount || 18}+ Dishes</span>
                        </div>
                        <div className="flex items-center gap-2.5 py-2 px-3 bg-[#fdfaf6] rounded-xl border border-[#3a1224]/5">
                          <Coffee className="w-3.5 h-3.5 text-[#C0A04C]" />
                          <span className="text-[10px] font-bold text-[#3a1224] uppercase tracking-tighter">Live Stations</span>
                        </div>
                        <div className="flex items-center gap-2.5 py-2 px-3 bg-[#fdfaf6] rounded-xl border border-[#3a1224]/5">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#C0A04C]" />
                          <span className="text-[10px] font-bold text-[#3a1224] uppercase tracking-tighter">Hygienic</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="pt-6 border-t border-[#3a1224]/10 flex items-center justify-between group-hover:pt-8 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#3a1224] flex items-center justify-center text-[#C0A04C] shadow-lg shadow-[#3a1224]/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                             <Sparkles className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-[#3a1224]/40 uppercase tracking-widest leading-none mb-1">Tailor-made for you</p>
                            <p className="text-xs font-bold text-[#3a1224]">View Details</p>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-full border border-[#3a1224]/10 flex items-center justify-center group-hover:bg-[#3a1224] group-hover:border-[#3a1224] group-hover:text-[#C0A04C] transition-all duration-500">
                          <ChevronRight className="w-6 h-6 translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}