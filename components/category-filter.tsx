"use client"

import { categories, type Category } from "@/lib/products"

interface CategoryFilterProps {
  selected: Category
  onSelect: (category: Category) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="hide-scrollbar flex gap-2 overflow-x-auto px-4 py-3">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-all ${selected === category
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
        >
          {category === "All" ? "All Metal" : `Metal ${category}`}
        </button>
      ))}
    </div>
  )
}
