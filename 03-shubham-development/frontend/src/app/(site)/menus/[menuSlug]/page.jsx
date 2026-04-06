"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Utensils, Users, Banknote, Leaf, Info, CheckCircle2 } from "lucide-react";
import MenuPageSkeletonLoading from "components/menu/page/MenuPageSkeletonLoading";
import { ROUTES } from "config/routes";
import { useQueryMenuBySlug } from "@queries/menu";

export default function Page({ params }) {
  const { menuSlug } = params;
  const { data: menu, isLoading, isError } = useQueryMenuBySlug(menuSlug);

  const STATIC_MENU_IMAGES = {
    "gold-menu": "/assets/business-images/menu-images/gold.jpg",
    "silver-menu": "/assets/business-images/menu-images/silver.jpg",
    "diamond-menu": "/assets/business-images/menu-images/diamond.jpg",
  };

  const imageSrc = menu?.image || menu?.imageUrl || (menu?.slug ? (STATIC_MENU_IMAGES[menu.slug] ?? "/assets/business-images/menu-images/placeholder.jpg") : "/assets/business-images/menu-images/placeholder.jpg");

  if (isLoading) return <MenuPageSkeletonLoading />;

  if (!menu || isError) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center border border-gray-100">
          <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
             <Info className="text-red-500 size-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu Not Found</h1>
          <p className="text-gray-500 mb-8">
            The menu <span className="font-semibold text-gray-800">"{menuSlug}"</span> doesn't exist or has been moved.
          </p>
          <Link 
            href={ROUTES.HOME} 
            className="block w-full py-3 bg-[#250815] text-white rounded-xl font-semibold hover:brightness-125 transition-all"
          >
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      {/* Sticky Top Navigation */}
      <nav className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href={ROUTES.HOME} className="flex items-center gap-2 text-gray-600 hover:text-[#250815] transition-colors font-medium">
            <ChevronLeft className="size-5" /> Back to Menus
          </Link>
          <div className="hidden md:block font-bold text-[#250815]">{menu.name}</div>
          <button className="bg-[#250815] text-white px-5 py-2 rounded-lg text-sm font-bold hover:brightness-125 transition-all">
            Select Menu
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 mt-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Hero Section */}
          <div className="relative h-[350px] w-full">
            <Image src={imageSrc} alt={menu.name} fill className="object-cover" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 text-white">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-3 inline-block border border-white/30">
                {menu.isCustomMenu ? "Custom Tier" : "Standard Tier"}
              </span>
              <h1 className="text-5xl font-black">{menu.name}</h1>
            </div>
          </div>

          <div className="p-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4 border border-gray-100">
                <div className="bg-[#250815]/5 p-3 rounded-xl text-[#250815]"><Utensils className="size-6" /></div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Total Dishes</p>
                  <p className="text-lg font-bold text-gray-900">{menu.dishCount ?? "—"}</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4 border border-gray-100">
                <div className="bg-emerald-50 p-3 rounded-xl text-emerald-600"><Banknote className="size-6" /></div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Price Per Guest</p>
                  <p className="text-lg font-bold text-gray-900">
                    {typeof menu.pricePerPerson === "number" ? `Rs. ${menu.pricePerPerson.toLocaleString()}` : "Price on Request"}
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4 border border-gray-100">
                <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Users className="size-6" /></div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase">Type</p>
                  <p className="text-lg font-bold text-gray-900">{menu.isCustomMenu ? "Tailored" : "Fixed"}</p>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Description</h2>
              <p className="text-gray-600 leading-relaxed text-lg">{menu.description || "No description provided for this menu tier."}</p>
            </div>

            {/* Sections */}
            <div className="space-y-12">
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                Menu Composition <div className="h-1 flex-1 bg-gray-100" />
              </h2>

              {Array.isArray(menu.sections) && menu.sections.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                  {menu.sections.map((s, idx) => {
                    const sectionTitle = s.section?.title ?? `Section ${idx + 1}`;
                    return (
                      <div key={idx} className="group">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#250815] transition-colors">{sectionTitle}</h3>
                          <span className="text-xs font-bold bg-gray-100 text-gray-500 px-3 py-1 rounded-full uppercase">
                            Choose up to {s.selectLimit ?? 0}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array.isArray(s.dishes) && s.dishes.map((d, dishIdx) => (
                            <div key={dishIdx} className="p-4 rounded-2xl border border-gray-100 bg-white hover:border-[#250815]/20 hover:shadow-md transition-all flex justify-between items-start gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-gray-900">{d.name}</span>
                                  {d.isVegetarian && <Leaf className="size-4 text-emerald-500" />}
                                </div>
                                {d.description && <p className="text-xs text-gray-500 line-clamp-2 leading-snug">{d.description}</p>}
                              </div>
                              {d.price > 0 && (
                                <span className="text-xs font-black text-[#250815] whitespace-nowrap">
                                  + Rs. {d.price}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-300">
                  <p className="text-gray-500">Items for this menu are currently being curated.</p>
                </div>
              )}
            </div>

            {/* Bottom Call to Action */}
            <div className="mt-16 p-8 rounded-3xl bg-[#250815] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-[#250815]/20">
              <div>
                <h3 className="text-2xl font-bold mb-1">Ready to lock this in?</h3>
                <p className="text-white/60 text-sm">You can further customize these selections in the next step.</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <Link href={ROUTES.HOME} className="flex-1 md:flex-none text-center px-8 py-4 border border-white/20 rounded-xl font-bold hover:bg-white/10 transition-all">
                  Browse Others
                </Link>
                <button className="flex-1 md:flex-none px-8 py-4 bg-white text-[#250815] rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                  <CheckCircle2 className="size-5" /> Select This Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}