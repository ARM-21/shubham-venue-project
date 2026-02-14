import React from 'react';
import { Layers3 } from 'lucide-react';

export default function Tabs({ tabCategories, selectedCategory, setSelectedCategory }) {
  return (
    <div className="border-b border-[#3a1a1a] overflow-x-auto">
      <div className="flex space-x-6 min-w-max">
        {tabCategories.map((cat) => {
          const active = selectedCategory === cat.key;
          const Icon = cat.icon || Layers3;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              className={`pb-4 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                active
                  ? "border-[var(--admin-primary)] text-white"
                  : "border-transparent text-[var(--admin-muted)] hover:text-white hover:border-[var(--admin-primary)]/60"
              }`}
            >
              <Icon className="size-4" />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
