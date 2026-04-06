export const dynamic = "force-dynamic";

import { createAdminClient } from "@/lib/supabase/admin";
import { formatUSD, buildWhatsAppLink } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { Product, Config } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string): Promise<Product | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();
  return data as Product | null;
}

async function getConfig(): Promise<Config | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("config")
    .select("*")
    .eq("id", 1)
    .single();
  return data as Config | null;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  return {
    title: product.name,
    description:
      product.description ||
      `${product.name} — ${formatUSD(product.price_usd)} en Import Store Argentina`,
    openGraph: {
      title: product.name,
      description: `${formatUSD(product.price_usd)} — Disponible en Import Store Argentina`,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default async function ProductoPage({ params }: PageProps) {
  const { id } = await params;
  const [product, config] = await Promise.all([getProduct(id), getConfig()]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold font-heading text-text-primary mb-2">
            Producto no encontrado
          </h1>
          <p className="text-text-secondary mb-4">
            Este producto ya no está disponible.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-brand-teal hover:underline"
          >
            Volver al catálogo
          </Link>
        </div>
      </div>
    );
  }

  const whatsappNumber = config?.whatsapp_number || "";

  return (
    <>
      <header className="sticky top-0 z-30 bg-surface-primary border-b border-brand-ice">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-teal transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al catálogo
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image */}
            <div className="relative aspect-square bg-surface-secondary rounded-2xl overflow-hidden">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-ice/30 to-surface-secondary">
                  <svg className="w-24 h-24 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              )}

              {product.stock <= 3 && product.stock > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge variant="danger">Últimas unidades</Badge>
                </div>
              )}
            </div>

            {/* Details */}
            <div>
              <Badge variant="default" className="mb-3">
                {product.category}
              </Badge>

              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text-primary mb-4">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-text-secondary mb-6">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="bg-surface-secondary rounded-2xl p-5 mb-6">
                <p className="font-heading font-bold text-3xl text-brand-navy">
                  {formatUSD(product.price_usd)}
                </p>
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                <div
                  className={`w-2 h-2 rounded-full ${
                    product.stock > 3
                      ? "bg-brand-teal"
                      : product.stock > 0
                      ? "bg-brand-coral"
                      : "bg-text-muted"
                  }`}
                />
                <span className="text-sm text-text-secondary">
                  {product.stock > 3
                    ? `${product.stock} disponibles`
                    : product.stock > 0
                    ? `Últimas ${product.stock} unidades`
                    : "Sin stock"}
                </span>
              </div>

              {/* WhatsApp CTA */}
              {whatsappNumber && (
                <a
                  href={buildWhatsAppLink(
                    whatsappNumber,
                    product.name,
                    product.price_usd
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-brand-teal text-white text-base font-semibold hover:bg-brand-teal-dark transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Consultar por WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
