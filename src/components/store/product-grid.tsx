import { ProductCard } from "./product-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
  exchangeRate: number;
  profitMargin: number;
  whatsappNumber: string;
}

export function ProductGrid({
  products,
  exchangeRate,
  profitMargin,
  whatsappNumber,
}: ProductGridProps) {
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          exchangeRate={exchangeRate}
          profitMargin={profitMargin}
          whatsappNumber={whatsappNumber}
          index={index}
        />
      ))}
    </div>
  );
}
