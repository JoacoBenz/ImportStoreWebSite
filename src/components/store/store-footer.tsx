import Image from "next/image";
import { buildWhatsAppLink } from "@/lib/utils";

interface StoreFooterProps {
  storeName: string;
  whatsappNumber: string | null;
}

export function StoreFooter({
  storeName,
  whatsappNumber,
}: StoreFooterProps) {
  return (
    <footer className="bg-brand-navy mt-auto">
      {/* Gold separator line */}
      <div className="h-0.5 bg-brand-gold/40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Image
                src="/logo.jpeg"
                alt={storeName}
                width={36}
                height={36}
                className="rounded-lg brightness-0 invert"
              />
              <span className="font-heading font-bold text-text-inverse tracking-wider text-sm uppercase">
                {storeName}
              </span>
            </div>
            <p className="text-sm text-white/60">
              Tecnología importada al mejor precio. Catálogo actualizado
              diariamente.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-heading font-semibold text-brand-gold text-sm mb-3 uppercase tracking-wide">
              Contacto
            </h3>
            <ul className="space-y-2">
              {whatsappNumber && (
                <li>
                  <a
                    href={buildWhatsAppLink(whatsappNumber)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/60 hover:text-brand-gold transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              <li>
                <a
                  href="#"
                  className="text-sm text-white/60 hover:text-brand-gold transition-colors"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
          <p className="text-xs text-white/40">
            {new Date().getFullYear()} {storeName}. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
