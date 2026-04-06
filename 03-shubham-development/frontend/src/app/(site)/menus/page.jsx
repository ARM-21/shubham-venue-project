"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-4"></div>
                    <div className="h-6 w-96 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <FilterSkeleton />
                <MenuSkeleton />
            </main>
        );
    }

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Menu Packages</h1>
                <p className="text-gray-600">
                    Choose from our curated selection of menu packages for your special occasion.
                    {menus.length > 0 && (
                        <span className="font-medium ml-1">{menus.length} packages available</span>
                    )}
                </p>
            </div>

            <SearchFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} sortBy={sortBy} setSortBy={setSortBy} categories={categories} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
            {/* Results Info */}
            <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                    Showing <span className="font-semibold">{filteredMenus.length}</span> menu package(s)
                </p>
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="text-sm text-[#3a1224] hover:text-[#ce3907] cursor-pointer font-medium"
                    >
                        Clear search
                    </button>
                )}
            </div>

            {/* Menus Grid */}
            {filteredMenus.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                    <Image src="/assets/utils-icons/sad.svg" alt="No menus found" width={64} height={64} className="mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No menus found</h3>
                    <p className="text-gray-600 mb-4">
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
                            className="px-4 py-2 bg-[#3a1224] text-white rounded-lg hover:bg-white hover:text-black hover:border-black border-1 transition-colors cursor-pointer "
                        >
                            View all menus
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMenus.map((menu) => (
                        <div
                            key={menu.id || menu.slug}
                            className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            {/* Menu Image */}
                            <div className="relative h-48 w-full bg-gradient-to-br from-[#3a1224] to-[#5c3d4a]">
                                <Image
                                    src={menu.image || menu.imageUrl || STATIC_MENU_IMAGES[menu.slug] || "/assets/business-images/menu-images/placeholder.jpg"}
                                    alt={menu.name || "Menu"}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={false}
                                />
                                {menu.category && (
                                    <div className="absolute top-3 left-3">
                                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-full">
                                            {menu.category}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Menu Info */}
                            <div className="p-5">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                                        {menu.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                                        {menu.description || "No description available"}
                                    </p>

                                    {/* Price and Dish Count */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-lg font-bold text-[#4e3842]">
                                            {typeof menu.pricePerPerson === "number"
                                                ? `${menu.pricePerPerson} ${menu.currency || "NPR"}`
                                                : "Price on request"}
                                            <span className="text-sm font-normal text-gray-500 block">
                                                per person
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-gray-900">
                                                {menu.dishCount || 0}
                                            </div>
                                            <div className="text-xs text-gray-500">dishes</div>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {menu.isCustomMenu && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                                                Customizable
                                            </span>
                                        )}
                                        {menu.sections && Array.isArray(menu.sections) && (
                                            <span className="px-2 py-1 bg-blue-100 text-black-800 text-xs font-medium rounded">
                                                {menu.sections.length} sections
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-3">
                                    <Link
                                        href={ROUTES.SITE.MENU_DETAILS(menu.slug)}
                                        className="flex-1 text-center px-4 py-2 bg-white border-1 border-gray-200  text-black rounded-lg hover:border-black transition-colors font-medium"
                                    >
                                        View Details
                                    </Link>
                                    {/* <button className="px-4 py-2 border border-[#421c2d] text-[#421c2d] rounded-lg hover:bg-[#421c2d] hover:text-white transition-colors">
                                        Select
                                    </button> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Stats */}
            {/* <MenuStats menus={filteredMenus} /> */}

        </main>
    );
}