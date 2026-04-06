"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/types";

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      <button
        onClick={() => onCategoryChange("todos")}
        className={cn(
          "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
          activeCategory === "todos"
            ? "bg-brand-teal text-white shadow-sm"
            : "bg-brand-ice/50 text-brand-teal hover:bg-brand-ice"
        )}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.slug}
          onClick={() => onCategoryChange(cat.slug)}
          className={cn(
            "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            activeCategory === cat.slug
              ? "bg-brand-teal text-white shadow-sm"
              : "bg-brand-ice/50 text-brand-teal hover:bg-brand-ice"
          )}
        >
          {cat.icon && <span className="mr-1">{cat.icon}</span>}
          {cat.name}
        </button>
      ))}
    </div>
  );
}
