export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return `USD ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculateARS(
  priceUSD: number,
  exchangeRate: number,
  profitMargin: number
): number {
  return priceUSD * exchangeRate * profitMargin;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function buildWhatsAppLink(
  phoneNumber: string,
  productName?: string,
  priceUSD?: number
): string {
  const cleanNumber = phoneNumber.replace(/[^0-9]/g, "");
  const text = productName
    ? `Hola! Me interesa ${productName}${priceUSD ? ` (USD ${priceUSD})` : ""}`
    : "Hola! Me interesa consultar por productos";
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
}
