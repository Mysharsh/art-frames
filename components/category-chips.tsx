"use client"

import { categories, type Category } from "@/lib/products"

interface CategoryChipsProps {
  selected: Category
  onSelect: (category: Category) => void
}

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-4">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${selected === category
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
