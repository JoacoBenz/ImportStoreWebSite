import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function StoreLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 bg-surface-primary border-b border-brand-ice">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Skeleton className="w-32 h-8" />
            <Skeleton className="w-64 h-9 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-brand-teal to-brand-navy py-12 sm:py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Skeleton className="w-64 h-10 mx-auto mb-3 opacity-20" />
          <Skeleton className="w-80 h-5 mx-auto opacity-20" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Category pills */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="w-24 h-9" rounded="full" />
          ))}
        </div>

        <div className="h-px bg-brand-gold/20 mb-6" />

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
