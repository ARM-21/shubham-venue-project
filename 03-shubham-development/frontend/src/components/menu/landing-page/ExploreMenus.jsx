"use client";

import { useEffect, useState } from "react";
import axiosInstance from "lib/axios";
import Image from "next/image";

const STATIC_MENU_IMAGES = {
  "gold-menu": "/assets/business-images/menu-images/placeholder.jpg",
  "silver-menu": "/assets/business-images/menu-images/placeholder.jpg",
  "diamond-menu": "/assets/business-images/menu-images/placeholder.jpg",
};

export default function ExploreMenus({ limit = 3 }) {
  const [menus, setMenus] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const loadMenus = async () => {
      try {
        const res = await axiosInstance.get("/api/v1/menus");
        const payload = Array.isArray(res.data) ? res.data : res.data?.menus || [];
        if (!ignore) {
          setMenus(Array.isArray(payload) ? payload.slice(0, limit) : []);
          setError(null);
        }
      } catch (err) {
        if (!ignore) setError("Failed to load menus");
      }
    };

    loadMenus();
    return () => {
      ignore = true;
    };
  }, [limit]);

  return (
    <section style={{ padding: "2rem 1rem", maxWidth: 1000, margin: "0 auto" }}>
      <h2 style={{ marginBottom: "1rem" }}>Explore Our Menus</h2>
      {error ? <div>{error}</div> : null}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {menus.length === 0 && !error && <div>No menus available</div>}
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
                src={STATIC_MENU_IMAGES[m.slug] || "/assets/business-images/menu-images/placeholder.jpg"}
                alt={m.name || "Menu Image"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
          </article>
        ))}
      </div>
    </section>
  );
}
