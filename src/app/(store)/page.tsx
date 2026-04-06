"use client";

import { useState, useEffect, useCallback } from "react";
import { StoreHeader } from "@/components/store/store-header";
import { CategoryFilter } from "@/components/store/category-filter";
import { ProductGrid } from "@/components/store/product-grid";
import { ProductCardSkeleton } from "@/components/ui/skeleton";
import { formatARS } from "@/lib/utils";
import type { Product, Category, Config } from "@/types";

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/config").then((r) => r.json()),
    ]).then(([productsData, categoriesData, configData]) => {
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setConfig(configData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fetchProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeCategory !== "todos") params.set("category", activeCategory);
    if (searchQuery) params.set("q", searchQuery);

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      // silently fail
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (!loading) {
      fetchProducts();
    }
  }, [activeCategory, searchQuery, fetchProducts, loading]);

  const exchangeRate = config?.exchange_rate || 1200;
  const profitMargin = config?.profit_margin || 1;
  const whatsappNumber = config?.whatsapp_number || "";
  const storeName = config?.store_name || "Import Store Argentina";

  return (
    <>
      <StoreHeader storeName={storeName} onSearch={setSearchQuery} />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-brand-teal to-brand-navy py-12 sm:py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="font-heading font-bold text-3xl sm:text-4xl text-white tracking-wide mb-3">
              Tecnología Importada
            </h1>
            <p className="text-brand-ice text-sm sm:text-base max-w-md mx-auto">
              Auriculares, cargadores, cables, fundas y más. Precios
              actualizados al día.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-brand-gold text-sm font-medium">
                Cotización: USD 1 = {formatARS(exchangeRate)}
              </span>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Categories */}
          <div className="mb-6">
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>

          {/* Gold separator */}
          <div className="h-px bg-brand-gold/20 mb-6" />

          {/* Products */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <ProductGrid
              products={products}
              exchangeRate={exchangeRate}
              profitMargin={profitMargin}
              whatsappNumber={whatsappNumber}
            />
          )}
        </section>
      </main>
    </>
  );
}
