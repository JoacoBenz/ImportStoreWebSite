import Anthropic from "@anthropic-ai/sdk";
import type { ParsedProduct } from "@/types";

const client = new Anthropic();

const SYSTEM_PROMPT = `Sos un asistente que parsea mensajes de stock de una proveedora de tecnología.
Extraé todos los productos del mensaje y devolvé SOLAMENTE un JSON array válido, sin markdown ni explicaciones.
Cada producto debe tener esta estructura:
{
  "name": "nombre del producto (normalizado, sin abreviaciones raras)",
  "category": "una de: auriculares, cargadores, cables, fundas, accesorios, otros",
  "price_usd": número decimal (precio en dólares),
  "stock": número entero (cantidad disponible, si no se especifica poner 1),
  "description": "descripción breve si hay info adicional, sino null"
}

Reglas:
- Normalizá los nombres: "auris bluetooth" -> "Auriculares Bluetooth"
- Si el precio dice "U$S", "USD", "dls" o similar, es dólares
- Si no se especifica cantidad, asumí stock = 1
- Intentá categorizar por el tipo de producto
- Si hay variantes (colores, tamaños), crealas como productos separados
- Devolvé SOLO el JSON array, sin backticks, sin explicación`;

export async function parseStockMessage(
  message: string
): Promise<{ products: ParsedProduct[]; error?: string }> {
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Limpiar posibles backticks o texto extra
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const products: ParsedProduct[] = JSON.parse(cleaned);

    return { products };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error desconocido al parsear";
    return { products: [], error: message };
  }
}
