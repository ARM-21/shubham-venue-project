// frontend/src/app/menus/[menuSlug]/page.jsx
import React from "react";
import Image from "next/image";
import Link from "next/link";

export default async function Page({ params }) {
  const { menuSlug } = params;

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "http://localhost:4000";

  // Fetch menus (server-side). Use cache: 'no-store' if you want always fresh
  let menus = [];
  try {
    const res = await fetch(`${API_BASE}/api/v1/menus`, { cache: "no-store" });
    const data = await res.json();
    // Handle both shapes: array or { menus: [...] } or wrapper
    menus = Array.isArray(data) ? data : data?.menus ?? (Array.isArray(data?.data) ? data.data : []);
  } catch (err) {
    console.error("Failed to load menus:", err);
  }

  const menu = menus.find((m) => (m.slug || m._id || "").toString() === menuSlug.toString());

   const STATIC_MENU_IMAGES = {
  "gold-menu": "/assets/business-images/menu-images/placeholder.jpg",
  "silver-menu": "/assets/business-images/menu-images/placeholder.jpg",
  "diamond-menu": "/assets/business-images/menu-images/placeholder.jpg",
};
  const imageSrc = (menu && STATIC_MENU_IMAGES[menu.slug]) || "/assets/business-images/menu-images/placeholder.jpg";

  if (!menu) {
    return (
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded p-6 text-center">
          <h1 className="text-2xl font-semibold mb-4">Menu not found</h1>
          <p className="text-gray-600 mb-4">We couldn't find a menu named <span className="font-medium">{menuSlug}</span>.</p>
          <Link href="/menus" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded">Back to menus</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded shadow overflow-hidden">
        <div className="w-full h-64 relative">
          <Image
            src={imageSrc}
            alt={menu.name}
            fill
  
          />
        </div>

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-2">{menu.name}</h1>
          <p className="text-gray-600 mb-4">{menu.description ?? menu.short ?? ""}</p>

          <div className="flex items-center gap-6 mb-6">
            <div className="text-sm text-gray-500">
              <div className="font-medium text-gray-800">{menu.dishCount ?? "—"}</div>
              <div> dishes</div>
            </div>

            <div className="text-sm text-gray-500">
              <div className="font-medium text-gray-800">
                {typeof menu.pricePerPerson === "number" ? `${menu.pricePerPerson} ${menu.currency ?? "NPR"}` : (menu.pricePerPerson ?? "—")}
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
                  // s.section may be populated object or an id string; handle both
                  const sectionTitle = s.section?.title ?? s.section ?? `Section ${idx + 1}`;
                  const dishCount = Array.isArray(s.dishes) ? s.dishes.length : "—";

                  return (
                    <div key={idx} className="border rounded p-4 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{sectionTitle}</div>
                        <div className="text-sm text-gray-500">Select limit: {s.selectLimit ?? 0}</div>
                      </div>
                      <div className="text-sm text-gray-600">{dishCount} dishes</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600">No sections available for this menu.</p>
            )}
          </section>

          <div className="flex gap-3">
            <Link href="/menus" className="inline-block px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Back</Link>
            <button className="inline-block px-4 py-2 bg-emerald-600 text-white rounded">Select this menu</button>
          </div>
        </div>
      </div>
    </main>
  );
}