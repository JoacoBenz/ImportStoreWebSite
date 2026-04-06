import type { Metadata } from "next";
import { Outfit, DM_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Import Store Argentina — Tecnología Importada",
    template: "%s | Import Store Argentina",
  },
  description:
    "Tu tienda de tecnología importada en Argentina. Auriculares, cargadores, cables, fundas y más. Precios en USD y ARS actualizados al día.",
  openGraph: {
    title: "Import Store Argentina",
    description: "Tecnología importada al mejor precio. Catálogo actualizado diariamente.",
    type: "website",
    locale: "es_AR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable} ${dmSans.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
