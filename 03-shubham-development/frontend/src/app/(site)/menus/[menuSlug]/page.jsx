"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Utensils, Users, Banknote, Leaf, Info, CheckCircle2, ChevronDown } from "lucide-react";
import MenuPageSkeletonLoading from "components/menu/page/MenuPageSkeletonLoading";
import { ROUTES } from "config/routes";
import { useQueryMenuBySlug } from "@queries/menu";

export default function Page({ params }) {
  const { menuSlug } = React.use(params);
  const { data: menu, isLoading, isError } = useQueryMenuBySlug(menuSlug);
  const [expandedSections, setExpandedSections] = useState(new Set([0])); // First section open by default
  const [expandedAllDishes, setExpandedAllDishes] = useState(new Set()); // Track which sections show all dishes
  const [imageError, setImageError] = useState(false);

  const imageSrc = menu?.heroImage || null;

  const toggleSection = (idx) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedSections(newExpanded);
  };

  const toggleAllDishes = (idx) => {
    const newExpanded = new Set(expandedAllDishes);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedAllDishes(newExpanded);
  };

  if (isLoading) return <MenuPageSkeletonLoading />;

  if (!menu || isError) {
    return (
      <main className="min-h-screen bg-[#fdfaf6] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[2rem] p-8 text-center border border-[#3a1224]/5 shadow-sm">
          <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
             <Info className="text-red-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[#3a1224] mb-2 uppercase tracking-wider">Menu Not Found</h1>
          <p className="text-[#3a1224]/60 mb-8 font-medium">
            The menu <span className="font-black text-[#3a1224]">"{menuSlug}"</span> doesn't exist or has been moved.
          </p>
          <Link 
            href={ROUTES.HOME} 
            className="block w-full py-3 bg-gradient-to-r from-[#C0A04C] to-[#D4B563] text-[#3a1224] rounded-full font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all"
          >
            Return to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fdfaf6]">
      {/* Header/Navigation */}
      <nav className="sticky top-0 z-30 bg-white/98 backdrop-blur-lg border-b border-[#3a1224]/10 shadow-sm">
        <div className="mx-auto px-4 sm:px-6 lg:px-12">
          <div className="h-16 flex items-center justify-between">
            <Link href={ROUTES.SITE.MENUS} className="flex items-center gap-2 text-[#3a1224]/60 hover:text-[#C0A04C] transition-colors font-bold text-sm uppercase tracking-wider group">
              <ChevronLeft className="size-5 group-hover:scale-110 transition-transform" /> Back to Menus
            </Link>
            <div className="hidden md:flex items-center gap-8">
            <div className="text-right">
                <h2 className="font-display font-black text-[#3a1224]">{menu.name}</h2>
                <p className="text-[#C0A04C] text-sm font-bold mt-1">
                  NPR {typeof menu.pricePerPerson === "number" ? menu.pricePerPerson.toLocaleString() : "Custom"} per person
                </p>
              </div>
            </div>
          </div>
          
          {/* Mobile Menu Name */}
          <div className="md:hidden px-2 py-3 border-t border-[#3a1224]/5">
            <h3 className="font-display font-black text-[#3a1224] mb-2">{menu.name}</h3>
            <div className="flex items-center justify-between text-xs font-semibold text-[#3a1224]/60">
              <span>NPR {typeof menu.pricePerPerson === "number" ? menu.pricePerPerson.toLocaleString() : "Custom"} per person</span>
              <span>•</span>
              <span>{menu.dishCount ?? "—"} dishes</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto px-4 sm:px-6 lg:px-12 pt-10 pb-20 max-w-7xl">
        <div className="bg-white rounded-[3rem] shadow-xl border border-[#3a1224]/5 overflow-hidden">
          {/* Hero Section */}
          <div className="relative h-[300px] sm:h-[400px] lg:h-[550px] w-full bg-gradient-to-br from-[#3a1224] to-[#3a1224]/80 group">
            {imageSrc && !imageError ? (
              <Image 
                src={imageSrc} 
                alt={menu.name} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority 
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#3a1224]/40 to-[#3a1224]">
                <div className="text-center text-white/40">
                  <Utensils className="w-16 h-16 mx-auto mb-3" />
                  <p className="text-sm font-bold">Menu Image</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/90 via-[#3a1224]/40 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-2 bg-[#C0A04C]/20 backdrop-blur-lg rounded-full text-xs font-black uppercase tracking-widest border border-[#C0A04C]/40 inline-block">
                  {menu.isCustomMenu ? "✨ Custom Tier" : "⭐ Standard Tier"}
                </span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black leading-tight mb-2">{menu.name}</h1>
              <p className="text-white/80 text-lg font-medium max-w-2xl">{menu.description || "Carefully selected dishes for your special occasion"}</p>
            </div>
          </div>

          <div className="p-8 sm:p-12 lg:p-16 xl:p-20">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16 pb-16 border-b border-[#3a1224]/10">
              <div className="bg-gradient-to-br from-[#fdfaf6] to-white p-8 rounded-2xl border border-[#3a1224]/5 hover:shadow-lg hover:border-[#C0A04C]/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-[#C0A04C]/20 to-[#C0A04C]/10 p-3 rounded-lg text-[#C0A04C]"><Utensils className="size-5" /></div>
                  <p className="text-xs text-[#3a1224]/50 font-bold uppercase">Dishes</p>
                </div>
                <p className="text-4xl font-display font-black text-[#3a1224]">{menu.dishCount ?? "—"}</p>
              </div>
              
              <div className="bg-gradient-to-br from-[#fdfaf6] to-white p-8 rounded-2xl border border-[#3a1224]/5 hover:shadow-lg hover:border-[#C0A04C]/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-emerald-100/50 to-emerald-50 p-3 rounded-lg text-emerald-600"><Banknote className="size-5" /></div>
                  <p className="text-xs text-[#3a1224]/50 font-bold uppercase">Price Per Person</p>
                </div>
                <p className="text-4xl font-display font-black text-[#3a1224]">
                  {typeof menu.pricePerPerson === "number" ? `NPR ${menu.pricePerPerson.toLocaleString()}` : "Custom"}
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-[#fdfaf6] to-white p-8 rounded-2xl border border-[#3a1224]/5 hover:shadow-lg hover:border-[#C0A04C]/30 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-blue-100/50 to-blue-50 p-3 rounded-lg text-blue-600"><Users className="size-5" /></div>
                  <p className="text-xs text-[#3a1224]/50 font-bold uppercase">Menu Type</p>
                </div>
                <p className="text-4xl font-display font-black text-[#3a1224]">{menu.isCustomMenu ? "Custom" : "Fixed"}</p>
              </div>
            </div>

            {/* Description */}
            {menu.description && (
              <div className="mb-16 pb-12 border-b border-[#3a1224]/5">
                <h3 className="text-sm font-black text-[#3a1224]/50 uppercase tracking-wider mb-4">About This Menu</h3>
                <p className="text-[#3a1224]/70 leading-relaxed text-base font-medium">{menu.description}</p>
              </div>
            )}

            {/* Sections - Collapsible */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl sm:text-4xl font-display font-black text-[#3a1224]">Menu Items</h2>
                <span className="text-xs font-black text-white bg-[#C0A04C] px-3 py-1.5 rounded-full">
                  {Array.isArray(menu.sections) ? menu.sections.length : 0} sections
                </span>
              </div>
              
              <div className="space-y-4">
                {Array.isArray(menu.sections) && menu.sections.length > 0 ? (                  <>                  {menu.sections.map((s, idx) => {
                    const sectionTitle = s.section?.title ?? `Section ${idx + 1}`;
                    const isExpanded = expandedSections.has(idx);
                    const dishCount = Array.isArray(s.dishes) ? s.dishes.length : 0;
                    const previewDishes = s.dishes ? s.dishes.slice(0, 3) : [];
                    const hasMore = dishCount > 3;

                    return (
                      <div key={idx} className="border border-[#3a1224]/8 rounded-2xl overflow-hidden bg-white hover:shadow-lg hover:border-[#C0A04C]/30 transition-all">
                        {/* Section Header - Clickable */}
                        <button
                          onClick={() => toggleSection(idx)}
                          className="w-full px-8 py-6 flex items-center justify-between hover:bg-[#fdfaf6] transition-colors text-left group"
                        >
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-black text-[#3a1224] mb-1 group-hover:text-[#C0A04C] transition-colors">{sectionTitle}</h3>
                            <p className="text-sm text-[#3a1224]/50 font-semibold">{dishCount} dish{dishCount !== 1 ? 'es' : ''}</p>
                          </div>
                          <ChevronDown
                            className={`w-6 h-6 text-[#3a1224]/40 transition-transform flex-shrink-0 group-hover:text-[#C0A04C] ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </button>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="border-t border-[#3a1224]/8 bg-[#fdfaf6] px-8 py-6 space-y-3">
                            {/* Show dishes - either preview or all */}
                            {(expandedAllDishes.has(idx) ? s.dishes : previewDishes).map((d, dishIdx) => (
                              <div
                                key={dishIdx}
                                className="p-4 rounded-xl bg-white border border-[#3a1224]/5 hover:border-[#C0A04C]/40 hover:shadow-md transition-all flex justify-between items-start gap-4"
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-[#3a1224] text-sm">{d.name}</span>
                                    {d.isVegetarian && <Leaf className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                                  </div>
                                  {d.description && (
                                    <p className="text-xs text-[#3a1224]/50 line-clamp-2">{d.description}</p>
                                  )}
                                </div>
                                {d.price > 0 && (
                                  <span className="text-sm font-black text-[#C0A04C] whitespace-nowrap flex-shrink-0">
                                    +NPR {d.price}
                                  </span>
                                )}
                              </div>
                            ))}

                            {/* View More / View Less Button */}
                            {hasMore && (
                              <button
                                onClick={() => toggleAllDishes(idx)}
                                className="w-full mt-4 py-3 text-sm font-black text-[#C0A04C] border border-[#C0A04C]/40 rounded-xl hover:bg-[#C0A04C]/5 transition-all"
                              >
                                {expandedAllDishes.has(idx) 
                                  ? `View Fewer Items` 
                                  : `View All ${dishCount} Items`
                                }
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </>
                ) : (
                <div className="text-center py-16 bg-[#fdfaf6] rounded-2xl border-2 border-dashed border-[#3a1224]/10">
                  <Utensils className="w-8 h-8 text-[#3a1224]/20 mx-auto mb-3" />
                  <p className="text-[#3a1224]/60 font-medium text-sm">No items available</p>
                </div>
              )}
              </div>
            </div>


          </div>
        </div>
      </div>
    </main>
  );
}