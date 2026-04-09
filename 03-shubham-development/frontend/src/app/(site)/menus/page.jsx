"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Info } from "lucide-react";
import MenuSkeleton from "components/menu/menus-page/MenuSkeleton";
import FilterSkeleton from "components/menu/menus-page/FilterSkeleton";
import SearchFilter from "components/menu/menus-page/SearchFilter";
import MenuStats from "components/menu/menus-page/MenuStats";
import { ROUTES } from "config/routes";
import { useQueryMenusPublic } from '@queries/customer/menus-public';


const STATIC_MENU_IMAGES = {
    "gold-menu": "/assets/business-images/menu-images/placeholder.jpg",
    "silver-menu": "/assets/business-images/menu-images/placeholder.jpg",
    "diamond-menu": "/assets/business-images/menu-images/placeholder.jpg",
    "platinum-menu": "/assets/business-images/menu-images/placeholder.jpg",
};

export default function MenuListPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("name");

    const { data: menusData = [], isLoading } = useQueryMenusPublic();
    const menus = Array.isArray(menusData) ? menusData : [];

    // Extract unique categories
    const categories = useMemo(() => {
        return ["all", ...new Set(menus.map(menu => menu.category).filter(Boolean))];
    }, [menus]);

    // Filter and sort menus
    const filteredMenus = useMemo(() => {
        let result = [...menus];

        // Apply search filter
        if (searchTerm.trim() !== "") {
            const term = searchTerm.toLowerCase();
            result = result.filter(menu =>
                menu.name?.toLowerCase().includes(term) ||
                menu.description?.toLowerCase().includes(term)
            );
        }

        // Apply sorting
        result.sort((a, b) => {
            switch (sortBy) {
                case "price_asc":
                    return (a.pricePerPerson) - (b.pricePerPerson);
                case "price_desc":
                    return (b.pricePerPerson) - (a.pricePerPerson);
                case "name":
                    return (a.name).localeCompare(b.name);
                case "dishes":
                    return (b.dishCount) - (a.dishCount);
                default:
                    return 0;
            }
        });

        return result;
    }, [menus, searchTerm, sortBy]);



    // const getImageSrc = (menu) => {
    //     return STATIC_MENU_IMAGES[menu.slug] || "/assets/business-images/menu-images/placeholder.jpg";
    // };

    if (isLoading) {
        return (
            <main className="min-h-screen bg-[#fdfaf6]">
                <div className="bg-gradient-to-br from-[#3a1224] to-[#3a1224]/90 text-white py-12 sm:py-16 lg:py-20">
                    <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
                        <div className="h-16 w-96 bg-white/10 rounded-lg animate-pulse mb-4"></div>
                        <div className="h-8 w-64 bg-white/10 rounded-lg animate-pulse"></div>
                    </div>
                </div>
                <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl py-8">
                    <FilterSkeleton />
                    <MenuSkeleton />
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#fdfaf6]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[#3a1224] to-[#3a1224]/90 text-white py-12 sm:py-16 lg:py-20">
                <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-black mb-4 leading-tight">Our Menu Packages</h1>
                    <p className="text-white/80 text-lg font-medium max-w-2xl">
                        Choose from our curated selection of premium menu packages for your special occasion.
                        {menus.length > 0 && (
                            <span className="block mt-2 text-[#C0A04C] font-black text-xl">{menus.length} packages available</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Filters & Content */}
            <div className="mx-auto px-4 sm:px-6 lg:px-12 max-w-7xl py-8">
                <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} sortBy={sortBy} setSortBy={setSortBy} categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
                
                {/* Results Info */}
                <div className="flex justify-between items-center mb-8 mt-6 pb-6 border-b border-[#3a1224]/10">
                    <p className="text-[#3a1224]/70 font-semibold">
                        Showing <span className="font-black text-[#3a1224]">{filteredMenus.length}</span> menu package(s)
                    </p>
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="text-sm text-[#C0A04C] hover:text-[#3a1224] cursor-pointer font-black uppercase tracking-wider transition-colors"
                        >
                            Clear search
                        </button>
                    )}
                </div>

                {/* Menus Grid */}
                {filteredMenus.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-[#3a1224]/10 shadow-lg p-12 sm:p-16 text-center">
                    <div className="inline-block p-4 bg-red-50 rounded-2xl mb-6">
                        <Info className="w-12 h-12 text-red-500" />
                    </div>
                    <h3 className="text-2xl font-black text-[#3a1224] mb-3">No Menus Found</h3>
                    <p className="text-[#3a1224]/60 font-medium mb-8 max-w-xl mx-auto">
                        {searchTerm
                            ? `No menus match "${searchTerm}". Try a different search.`
                            : "No menus available in this category."}
                    </p>
                    {(searchTerm || selectedCategory !== "all") && (
                        <button
                            onClick={() => {
                                setSearchTerm("");
                                setSelectedCategory("all");
                            }}
                            className="px-8 py-3 bg-gradient-to-r from-[#C0A04C] to-[#D4B563] text-[#3a1224] rounded-full font-black uppercase tracking-widest hover:shadow-lg transition-all"
                        >
                            View All Menus
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredMenus.map((menu) => (
                        <Link
                            key={menu.id || menu.slug}
                            href={ROUTES.SITE.MENU_DETAILS(menu.slug)}
                            className="group bg-white rounded-[2rem] border border-[#3a1224]/5 overflow-hidden hover:shadow-2xl hover:shadow-[#3a1224]/10 transition-all duration-300 transform hover:scale-105"
                        >
                            {/* Menu Image */}
                            <div className="relative h-48 sm:h-56 w-full bg-gradient-to-br from-[#3a1224] to-[#3a1224]/80 overflow-hidden">
                                <Image
                                    src={menu.heroImage || menu.image || menu.imageUrl || "/assets/business-images/menu-images/placeholder.jpg"}
                                    alt={menu.name || "Menu"}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#3a1224]/80 via-[#3a1224]/20 to-transparent" />
                                
                                {/* Tags - Absolute positioned */}
                                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                    {menu.isCustomMenu && (
                                        <span className="px-3 py-1 bg-blue-500/90 backdrop-blur-sm text-white text-xs font-black uppercase tracking-wider rounded-full border border-blue-400/50">
                                            Customizable
                                        </span>
                                    )}
                                    {menu.sections && Array.isArray(menu.sections) && (
                                        <span className="px-3 py-1 bg-[#C0A04C]/90 backdrop-blur-sm text-[#3a1224] text-xs font-black uppercase tracking-wider rounded-full border border-[#C0A04C]/50">
                                            {menu.sections.length} sections
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Menu Info */}
                            <div className="p-6 sm:p-8">
                                <h3 className="text-xl sm:text-2xl font-display font-black text-[#3a1224] mb-2 group-hover:text-[#C0A04C] transition-colors line-clamp-1">
                                    {menu.name}
                                </h3>
                                <p className="text-[#3a1224]/60 text-sm font-medium line-clamp-2 mb-6 min-h-10">
                                    {menu.description || "Premium menu thoughtfully curated for your special event."}
                                </p>

                                {/* Price and Dish Count */}
                                <div className="flex items-end justify-between mb-6 pb-6 border-b border-[#3a1224]/10">
                                    <div>
                                        <p className="text-xs font-black text-[#3a1224]/40 uppercase tracking-widest mb-1">Price per person</p>
                                        <p className="text-2xl sm:text-3xl font-display font-black text-[#3a1224]">
                                            {typeof menu.pricePerPerson === "number"
                                                ? `NPR ${menu.pricePerPerson.toLocaleString()}`
                                                : "Custom"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg sm:text-2xl font-black text-[#C0A04C]">{menu.dishCount || 0}</p>
                                        <p className="text-xs font-bold text-[#3a1224]/50 uppercase tracking-wider">Dishes</p>
                                    </div>
                                </div>

                                {/* View Details Button */}
                                <button className="w-full px-6 py-3 bg-gradient-to-r from-[#C0A04C] to-[#D4B563] text-[#3a1224] rounded-full font-black text-sm uppercase tracking-widest hover:shadow-lg transition-all group-hover:shadow-[#C0A04C]/30">
                                    View Full Menu →
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            </div>
        </main>
    );
}