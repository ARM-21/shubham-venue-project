export const decorationAddons = [
  {
    key: "led-wall",
    name: "LED Backdrop Wall",
    description: "Animated LED wall for stage or photo area.",
    price: 15000
  },
  {
    key: "photo-booth",
    name: "Photo Booth",
    description: "Instant print photo booth with props and attendant.",
    price: 18000
  },
  {
    key: "fog",
    name: "Low Fog Entrance",
    description: "Dry-ice low fog effect for entrances and first dance.",
    price: 12000
  },
  {
    key: "lounge",
    name: "Lounge Seating",
    description: "Clustered lounge furniture set for cocktail area.",
    price: 14000
  },
  {
    key: "floral-upgrade",
    name: "Floral Upgrade",
    description: "Premium seasonal flowers and larger centerpieces.",
    price: 16000
  }
];

export const decorationSchemes = [
  {
    name: "Classic Elegant",
    description: "Neutral palette with floral centerpieces, soft uplighting, and draped backdrops.",
    price: 45000,
    features: [
      "Stage backdrop with fabric drapes",
      "Table runners and chair sashes",
      "Warm white uplighting",
      "Fresh floral centerpieces"
    ],
    imageUrl: "https://images.unsplash.com/photo-1499955085172-a104c9463ece?auto=format&fit=crop&w=1200&q=80",
    includedAddonKeys: ["floral-upgrade"]
  },
  {
    name: "Modern Minimal",
    description: "Clean lines, monochrome accents, geometric props, and greenery.",
    price: 38000,
    features: [
      "Geometric photo backdrop",
      "LED accent strips",
      "Succulent and greenery centerpieces",
      "Monochrome table settings"
    ],
    imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    includedAddonKeys: ["led-wall"]
  },
  {
    name: "Royal Gold",
    description: "Rich burgundy-gold theme with ornate props, chandeliers, and premium fabrics.",
    price: 62000,
    features: [
      "Chandelier-inspired lighting",
      "Velvet stage backdrop",
      "Gold charger plates",
      "Premium floral arches"
    ],
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
    includedAddonKeys: ["floral-upgrade", "lounge", "photo-booth"]
  }
];
