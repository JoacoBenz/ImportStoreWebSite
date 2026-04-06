import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ParsedProduct, StockSource } from "@/types";

interface ApplyRequest {
  products: ParsedProduct[];
  raw_message: string;
  source: StockSource;
}

/**
 * Normaliza un nombre de producto para comparación fuzzy.
 * Remueve acentos, espacios extra, y caracteres especiales.
 */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/[^a-z0-9]/g, " ") // solo alfanuméricos
    .replace(/\s+/g, " ") // colapsar espacios
    .trim();
}

/**
 * Genera variantes de búsqueda con % para match flexible.
 * "Auriculares Bluetooth i12" → "%auriculares%bluetooth%i12%"
 */
function toFuzzyPattern(name: string): string {
  const words = normalize(name).split(" ").filter(Boolean);
  return `%${words.join("%")}%`;
}

/**
 * Calcula qué tan similar son dos strings normalizados (0-1).
 * Usa las palabras en común vs total de palabras.
 */
function similarityScore(a: string, b: string): number {
  const wordsA = new Set(normalize(a).split(" ").filter(Boolean));
  const wordsB = new Set(normalize(b).split(" ").filter(Boolean));

  let matches = 0;
  for (const word of wordsA) {
    for (const wordB of wordsB) {
      // Match exacto o uno contiene al otro (para abreviaciones)
      if (word === wordB || word.includes(wordB) || wordB.includes(word)) {
        matches++;
        break;
      }
    }
  }

  const total = Math.max(wordsA.size, wordsB.size);
  return total === 0 ? 0 : matches / total;
}

async function findBestMatch(
  admin: ReturnType<typeof createAdminClient>,
  productName: string
) {
  // 1. Intento exacto (case-insensitive)
  const { data: exact } = await admin
    .from("products")
    .select("*")
    .ilike("name", productName)
    .limit(1)
    .single();

  if (exact) return exact;

  // 2. Búsqueda fuzzy con patrón %palabra%palabra%
  const fuzzyPattern = toFuzzyPattern(productName);
  const { data: fuzzyResults } = await admin
    .from("products")
    .select("*")
    .ilike("name", fuzzyPattern);

  if (fuzzyResults && fuzzyResults.length > 0) {
    // Si hay varios resultados, elegir el más similar
    let bestMatch = fuzzyResults[0];
    let bestScore = similarityScore(productName, bestMatch.name);

    for (let i = 1; i < fuzzyResults.length; i++) {
      const score = similarityScore(productName, fuzzyResults[i].name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = fuzzyResults[i];
      }
    }

    // Solo aceptar si la similitud es >= 60%
    if (bestScore >= 0.6) return bestMatch;
  }

  // 3. Búsqueda por palabras clave principales (las más largas, más específicas)
  const words = normalize(productName)
    .split(" ")
    .filter((w) => w.length >= 3)
    .sort((a, b) => b.length - a.length)
    .slice(0, 3);

  if (words.length >= 2) {
    // Buscar con las 2 palabras más significativas
    const keywordPattern = `%${words[0]}%${words[1]}%`;
    const { data: keywordResults } = await admin
      .from("products")
      .select("*")
      .ilike("name", keywordPattern);

    if (keywordResults && keywordResults.length > 0) {
      let bestMatch = keywordResults[0];
      let bestScore = similarityScore(productName, bestMatch.name);

      for (let i = 1; i < keywordResults.length; i++) {
        const score = similarityScore(productName, keywordResults[i].name);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = keywordResults[i];
        }
      }

      if (bestScore >= 0.6) return bestMatch;
    }
  }

  return null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body: ApplyRequest = await request.json();
    const { products, raw_message, source } = body;

    if (!products?.length || !raw_message) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    let productsCreated = 0;
    let productsUpdated = 0;

    for (const product of products) {
      const existing = await findBestMatch(admin, product.name);

      if (existing) {
        await admin
          .from("products")
          .update({
            price_usd: product.price_usd,
            category: product.category,
            stock: existing.stock + product.stock,
            is_active: true,
            description: product.description || existing.description,
          })
          .eq("id", existing.id);
        productsUpdated++;
      } else {
        await admin.from("products").insert({
          name: product.name,
          description: product.description,
          category: product.category,
          price_usd: product.price_usd,
          stock: product.stock,
          is_active: true,
        });
        productsCreated++;
      }
    }

    // Guardar en historial
    await admin.from("stock_history").insert({
      raw_message,
      parsed_products: products,
      action: "add",
      products_created: productsCreated,
      products_updated: productsUpdated,
      products_deactivated: 0,
      source,
    });

    return NextResponse.json({
      success: true,
      products_created: productsCreated,
      products_updated: productsUpdated,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al aplicar stock";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
