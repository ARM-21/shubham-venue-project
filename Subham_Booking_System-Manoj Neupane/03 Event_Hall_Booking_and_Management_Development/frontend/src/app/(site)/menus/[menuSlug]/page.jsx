"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import MenuPageSkeletonLoading from "@/components/menu/page/MenuPageSkeletonLoading";
import { Menu } from "lucide-react";

export default function Page({ params }) {
  const { menuSlug } = React.use(params);
  const [isLoading, setIsLoading] = React.useState(true);
  const [menu, setMenu] = React.useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      try {
        const res = await axiosInstance.get(`/api/v1/menus/${menuSlug}`);
        const data = res.data;
        console.debug("Fetched menu data:", data);
        setMenu(data);
      } catch (err) {
        console.error("Failed to load menu:", err);
        setMenu(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (menuSlug) fetchMenu();
  }, [menuSlug]);

  const STATIC_MENU_IMAGES = {
    "gold-menu": "/assets/business-images/menu-images/placeholder.jpg",
    "silver-menu": "/assets/business-images/menu-images/placeholder.jpg",
    "diamond-menu": "/assets/business-images/menu-images/placeholder.jpg",
  };

  const imageSrc = menu ? (STATIC_MENU_IMAGES[menu.slug] ?? "/assets/business-images/menu-images/placeholder.jpg") : "/assets/business-images/menu-images/placeholder.jpg";

  if (isLoading) {
    return (
    <MenuPageSkeletonLoading/>
    );
  }

  if (!menu) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded p-6 text-center">
          <h1 className="text-2xl font-semibold mb-4">Menu not found</h1>
          <p className="text-gray-600 mb-4">
            We couldn't find a menu named <span className="font-medium">{menuSlug}</span>.
          </p>
          <Link href="/" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded">
            Back to menus
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="w-full h-64 relative">
          <Image src={imageSrc} alt={menu.name} fill className="object-cover" />
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{menu.name}</h1>
          <p className="text-gray-600 mb-4">{menu.description ?? ""}</p>

          <div className="flex items-center gap-6 mb-6">
            <div className="text-sm text-gray-500">
              <div className="font-medium text-gray-800">{menu.dishCount ?? "—"}</div>
              <div>dishes</div>
            </div>

            <div className="text-sm text-gray-500">
              <div className="font-medium text-gray-800">
                {typeof menu.pricePerPerson === "number"
                  ? `${menu.pricePerPerson} ${menu.currency ?? "NPR"}`
                  : menu.pricePerPerson ?? "—"}
              </div>
              <div>price / person</div>
            </div>

            <div className="text-sm text-gray-500">
              <div className="font-medium text-gray-800">{menu.isCustomMenu ? "Custom" : "Standard"}</div>
              <div>menu type</div>
            </div>
          </div>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Sections</h2>
            {Array.isArray(menu.sections) && menu.sections.length > 0 ? (
              <div className="space-y-4">
                {menu.sections.map((s, idx) => {
                  const sectionTitle = s.section?.title ?? `Section ${idx + 1}`;
                  const dishCount = Array.isArray(s.dishes) ? s.dishes.length : "—";

                  return (
                    <div key={idx} className="border rounded p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <div className="font-medium">{sectionTitle}</div>
                          <div className="text-sm text-gray-500">Select limit: {s.selectLimit ?? 0}</div>
                        </div>
                        <div className="text-sm text-gray-600">{dishCount} dishes</div>
                      </div>

                      {/* Visible list of dishes */}
                      {Array.isArray(s.dishes) && s.dishes.length > 0 ? (
                        <ul className="divide-y">
                          {s.dishes.map((d, dishIdx) => (
                            <li key={dishIdx} className="py-3 flex justify-between items-start gap-4">
                              <div>
                                <div className="font-medium text-gray-800">
                                  {d.name} {d.isVegetarian ? <span className="text-green-600 ml-2 text-sm">🌿</span> : null}
                                </div>
                                {d.description ? <div className="text-sm text-gray-500">{d.description}</div> : null}
                              </div>
                              <div className="text-sm text-gray-700 whitespace-nowrap">
                                {typeof d.price === "number" ? `${d.price} ${menu.currency ?? "NPR"}` : (d.price ?? "N/A")}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-gray-600">No dishes available in this section.</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600">No sections available for this menu.</p>
            )}
          </section>

          <div className="flex gap-3">
            <Link href="/" className="inline-block px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">
              Back
            </Link>
            <button className="inline-block px-4 py-2 bg-emerald-600 text-white rounded">Select this menu</button>
          </div>
        </div>
      </div>
    </main>
  );
}