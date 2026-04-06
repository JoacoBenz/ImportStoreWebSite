"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "./product-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Product } from "@/types";

const PAGE_SIZE = 8;

interface ProductGridProps {
  products: Product[];
  whatsappNumber: string;
}

export function ProductGrid({
  products,
  whatsappNumber,
}: ProductGridProps) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [products]);

  if (products.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
        title="No hay productos"
        description="No se encontraron productos con los filtros seleccionados."
      />
    );
  }

  const shown = products.slice(0, visible);
  const hasMore = visible < products.length;

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {shown.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            whatsappNumber={whatsappNumber}
            index={index}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-6 py-3 rounded-xl border border-brand-teal text-brand-teal font-medium text-sm hover:bg-brand-teal hover:text-white transition-colors"
          >
            Cargar más productos ({products.length - visible} restantes)
          </button>
        </div>
      )}
    </div>
  );
}
