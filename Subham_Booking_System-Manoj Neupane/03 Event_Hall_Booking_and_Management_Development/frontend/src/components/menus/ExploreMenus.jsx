import React from "react";
import axiosInstance from "@/lib/axios";
import Image from "next/image";
import Link from "next/link";


export default async function Menus({ limit = 3 }) {
  let menus = [];

  const STATIC_MENU_IMAGES = {
  "gold-menu": "/assets/business-images/menu-images/placeholder.jpg",
  "silver-menu": "/assets/business-images/menu-images/placeholder.jpg",
  "diamond-menu": "/assets/business-images/menu-images/placeholder.jpg",
};

  try {
    const res = await axiosInstance.get("/api/v1/menus");
    if (res.status === 200) {
      menus = res.data; 
      console.debug("Fetched menus:", menus);
    } else {
      console.error("Failed to load menus:", res.status);
    }
  } catch (err) {
    console.error("Error fetching menus:", err);
  }

  if (!Array.isArray(menus) && menus?.menus) menus = menus.menus;

  menus = Array.isArray(menus) ? menus.slice(0, limit) : [];

  return (
    <section style={{ padding: "2rem 1rem", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>Explore Our Menus</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {menus.length === 0 && <div>No menus available</div>}
        {menus.map((m) => (
          <article
            key={m._id}
            style={{
              flex: "1 1 280px",
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 12,
              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              background: "#fff",
            }}
          >
            <div style={{ position: "relative", width: "100%", height: 180, marginBottom: 12 }}>
              <Image
                src={STATIC_MENU_IMAGES[m.slug]}
                alt={m.name || "Menu Image"}
                layout="fill"
                objectFit="cover"
                style={{ borderRadius: 6 }}
              />
            </div>

            <h3 style={{ margin: "0 0 8px 0" }}>{m.name}</h3>
            <p style={{ margin: "0 0 8px 0", color: "#555" }}>
              {m.dishCount ? `${m.dishCount} dishes` : ""}
            </p>
            <p style={{ margin: "0 0 12px 0", fontWeight: 600 }}>
              {typeof m.pricePerPerson === "number" ? `${m.pricePerPerson} ${m.currency ?? "NPR"} / person` : ""}
            </p>
            <Link
              href={`/menus/${m.slug}`}
              className="inline-block px-4 py-2 bg-[#44152a] hover: border-1 hover:border-black hover:bg-white hover:text-black ease-in-out duration-500 transition-colors  text-white rounded"
            >
              View menu
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}