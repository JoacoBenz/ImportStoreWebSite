import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatUSD, buildWhatsAppLink } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  whatsappNumber: string;
  index: number;
}

export function ProductCard({
  product,
  whatsappNumber,
  index,
}: ProductCardProps) {
  return (
    <div
      className="group bg-surface-primary rounded-2xl border border-brand-ice overflow-hidden hover:shadow-[0_4px_24px_rgba(0,100,124,0.1)] hover:scale-[1.02] transition-all duration-300"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Image */}
      <Link href={`/producto/${product.id}`}>
        <div className="relative aspect-square bg-surface-secondary overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-ice/30 to-surface-secondary">
              <svg
                className="w-12 h-12 text-text-muted/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.stock <= 3 && product.stock > 0 && (
              <Badge variant="danger" className="text-[10px]">
                Últimas unidades
              </Badge>
            )}
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="default" className="text-[10px]">
              {product.category}
            </Badge>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={`/producto/${product.id}`}>
          <h3 className="font-heading font-semibold text-text-primary text-sm leading-snug mb-2 line-clamp-2 group-hover:text-brand-teal transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mb-3">
          <p className="font-heading font-bold text-brand-navy text-lg">
            {formatUSD(product.price_usd)}
          </p>
        </div>

        {/* Stock indicator */}
        <div className="flex items-center gap-1.5 mb-3">
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              product.stock > 3
                ? "bg-brand-teal"
                : product.stock > 0
                ? "bg-brand-coral"
                : "bg-text-muted"
            }`}
          />
          <span className="text-xs text-text-muted">
            {product.stock > 3
              ? "En stock"
              : product.stock > 0
              ? `Quedan ${product.stock}`
              : "Sin stock"}
          </span>
        </div>

        {/* WhatsApp button */}
        <a
          href={buildWhatsAppLink(
            whatsappNumber,
            product.name,
            product.price_usd
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-brand-teal text-white text-sm font-medium hover:bg-brand-teal-dark transition-colors"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Consultar por WhatsApp
        </a>
      </div>
    </div>
  );
}
