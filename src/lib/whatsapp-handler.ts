import { createAdminClient } from "@/lib/supabase/admin";
import { parseStockMessage } from "@/lib/claude";
import { sendWhatsAppMessage, sendWhatsAppInteractive } from "@/lib/whatsapp";
import type { ConversationState, ParsedProduct } from "@/types";

async function getState(phone: string): Promise<ConversationState> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("conversation_state")
    .select("state")
    .eq("phone_number", phone)
    .single();

  if (data?.state) return data.state as ConversationState;
  return { step: "idle", updated_at: new Date().toISOString() };
}

async function setState(
  phone: string,
  state: ConversationState
): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("conversation_state").upsert({
    phone_number: phone,
    state,
    updated_at: new Date().toISOString(),
  });
}

async function applyStock(
  action: "replace" | "add",
  products: ParsedProduct[],
  rawMessage: string
): Promise<{ created: number; updated: number; deactivated: number }> {
  const supabase = createAdminClient();
  let created = 0;
  let updated = 0;
  let deactivated = 0;

  if (action === "replace") {
    const { data: activeProducts } = await supabase
      .from("products")
      .select("id")
      .eq("is_active", true);
    deactivated = activeProducts?.length || 0;

    await supabase
      .from("products")
      .update({ is_active: false })
      .eq("is_active", true);
  }

  for (const product of products) {
    const { data: existing } = await supabase
      .from("products")
      .select("*")
      .ilike("name", product.name)
      .limit(1)
      .single();

    if (existing) {
      const updates: Record<string, unknown> = {
        price_usd: product.price_usd,
        category: product.category,
        is_active: true,
        description: product.description || existing.description,
        stock: action === "add" ? existing.stock + product.stock : product.stock,
      };
      await supabase.from("products").update(updates).eq("id", existing.id);
      updated++;
      if (action === "replace") deactivated = Math.max(0, deactivated - 1);
    } else {
      await supabase.from("products").insert({
        name: product.name,
        description: product.description,
        category: product.category,
        price_usd: product.price_usd,
        stock: product.stock,
        is_active: true,
      });
      created++;
    }
  }

  await supabase.from("stock_history").insert({
    raw_message: rawMessage,
    parsed_products: products,
    action,
    products_created: created,
    products_updated: updated,
    products_deactivated: deactivated,
    source: "whatsapp",
  });

  return { created, updated, deactivated };
}

export async function handleWhatsAppMessage(
  from: string,
  message: string,
  buttonId?: string
): Promise<void> {
  const state = await getState(from);
  const msgLower = message.toLowerCase().trim();

  try {
    // Handle button responses
    if (buttonId) {
      if (
        state.step === "awaiting_stock_action" &&
        state.parsed_products &&
        state.raw_message
      ) {
        const action =
          buttonId === "replace_stock" ? "replace" : "add";

        const result = await applyStock(
          action as "replace" | "add",
          state.parsed_products,
          state.raw_message
        );

        await sendWhatsAppMessage(
          from,
          `✅ Stock actualizado.\n\n` +
            `📦 ${result.created} productos creados\n` +
            `🔄 ${result.updated} productos actualizados\n` +
            `❌ ${result.deactivated} productos desactivados`
        );

        await setState(from, {
          step: "idle",
          updated_at: new Date().toISOString(),
        });
        return;
      }
    }

    // Handle "awaiting exchange rate" state
    if (state.step === "awaiting_exchange_rate") {
      const rate = parseFloat(message.replace(/[^0-9.,]/g, "").replace(",", "."));
      if (!isNaN(rate) && rate > 0) {
        const supabase = createAdminClient();
        await supabase
          .from("config")
          .update({ exchange_rate: rate })
          .eq("id", 1);

        await sendWhatsAppMessage(
          from,
          `✅ Tipo de cambio actualizado a $${rate.toLocaleString("es-AR")}.\nLos precios en pesos se actualizan automáticamente en la web.`
        );

        await setState(from, {
          step: "idle",
          updated_at: new Date().toISOString(),
        });
        return;
      } else {
        await sendWhatsAppMessage(
          from,
          "⚠️ No pude entender el valor. Enviame solo el número del tipo de cambio."
        );
        return;
      }
    }

    // Handle "awaiting stock action" — text fallback
    if (state.step === "awaiting_stock_action") {
      if (
        msgLower.includes("reemplazar") ||
        msgLower.includes("replace")
      ) {
        if (state.parsed_products && state.raw_message) {
          const result = await applyStock(
            "replace",
            state.parsed_products,
            state.raw_message
          );
          await sendWhatsAppMessage(
            from,
            `✅ Stock reemplazado.\n📦 ${result.created} creados · 🔄 ${result.updated} actualizados · ❌ ${result.deactivated} desactivados`
          );
          await setState(from, {
            step: "idle",
            updated_at: new Date().toISOString(),
          });
          return;
        }
      }
      if (msgLower.includes("agregar") || msgLower.includes("add")) {
        if (state.parsed_products && state.raw_message) {
          const result = await applyStock(
            "add",
            state.parsed_products,
            state.raw_message
          );
          await sendWhatsAppMessage(
            from,
            `✅ Stock agregado.\n📦 ${result.created} creados · 🔄 ${result.updated} actualizados`
          );
          await setState(from, {
            step: "idle",
            updated_at: new Date().toISOString(),
          });
          return;
        }
      }
    }

    // IDLE state handlers
    // Exchange rate
    if (
      msgLower.includes("dolar") ||
      msgLower.includes("dólar") ||
      msgLower.includes("cambio") ||
      msgLower.includes("cotización") ||
      msgLower.includes("cotizacion")
    ) {
      const supabase = createAdminClient();
      const { data: config } = await supabase
        .from("config")
        .select("exchange_rate")
        .eq("id", 1)
        .single();

      const currentRate = config?.exchange_rate || 0;

      await sendWhatsAppMessage(
        from,
        `💵 Cotización actual: $${currentRate.toLocaleString("es-AR")}.\n\nEnviame el nuevo valor del dólar (solo el número).`
      );

      await setState(from, {
        step: "awaiting_exchange_rate",
        updated_at: new Date().toISOString(),
      });
      return;
    }

    // Status/summary
    if (
      msgLower.includes("estado") ||
      msgLower.includes("resumen") ||
      msgLower.includes("info")
    ) {
      const supabase = createAdminClient();
      const [configRes, productsRes, historyRes] = await Promise.all([
        supabase.from("config").select("*").eq("id", 1).single(),
        supabase
          .from("products")
          .select("id", { count: "exact" })
          .eq("is_active", true),
        supabase
          .from("stock_history")
          .select("created_at")
          .order("created_at", { ascending: false })
          .limit(1),
      ]);

      const config = configRes.data;
      const activeCount = productsRes.count || 0;
      const lastLoad = historyRes.data?.[0]?.created_at;

      let summary = `📊 Resumen:\n\n`;
      summary += `💵 Cotización: $${config?.exchange_rate?.toLocaleString("es-AR") || "—"}\n`;
      summary += `📦 Productos activos: ${activeCount}\n`;
      summary += `📅 Última carga: ${
        lastLoad
          ? new Date(lastLoad).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Sin cargas"
      }`;

      await sendWhatsAppMessage(from, summary);
      return;
    }

    // Help
    if (msgLower.includes("ayuda") || msgLower.includes("help")) {
      await sendWhatsAppMessage(
        from,
        `📋 Comandos disponibles:\n\n` +
          `• Enviá un listado de productos para cargar stock\n` +
          `• "dolar" o "cotización" para ver/cambiar el tipo de cambio\n` +
          `• "estado" o "resumen" para ver info de la tienda\n` +
          `• "ayuda" para ver este mensaje`
      );
      return;
    }

    // If message looks like a stock listing (multiple lines with numbers)
    const lines = message.split("\n").filter((l) => l.trim());
    const hasMultipleLines = lines.length >= 2;
    const hasNumbers = /\d/.test(message);
    const hasPriceIndicator =
      /u\$s|usd|dls|dólares|dolares|\$/i.test(message);

    if (hasMultipleLines && hasNumbers && (hasPriceIndicator || lines.length >= 3)) {
      await sendWhatsAppMessage(from, "⏳ Procesando listado de productos...");

      const result = await parseStockMessage(message);

      if (result.error || result.products.length === 0) {
        await sendWhatsAppMessage(
          from,
          "⚠️ No pude extraer productos del mensaje. Intentá enviarlo de nuevo o revisá el formato."
        );
        return;
      }

      const preview = result.products
        .slice(0, 10)
        .map(
          (p) =>
            `• ${p.name} — USD ${p.price_usd} (x${p.stock})`
        )
        .join("\n");

      const moreText =
        result.products.length > 10
          ? `\n...y ${result.products.length - 10} más`
          : "";

      await sendWhatsAppInteractive(
        from,
        `📦 Encontré ${result.products.length} productos:\n\n${preview}${moreText}\n\n¿Qué querés hacer?`,
        [
          { id: "replace_stock", title: "Reemplazar stock" },
          { id: "add_stock", title: "Agregar al stock" },
        ]
      );

      await setState(from, {
        step: "awaiting_stock_action",
        parsed_products: result.products,
        raw_message: message,
        updated_at: new Date().toISOString(),
      });
      return;
    }

    // Default: don't understand
    await sendWhatsAppMessage(
      from,
      `🤔 No entendí el mensaje. Enviá "ayuda" para ver las opciones disponibles.`
    );
  } catch (error) {
    console.error("Error handling WhatsApp message:", error);
    await sendWhatsAppMessage(
      from,
      "⚠️ Ocurrió un error. Intentá de nuevo en unos segundos."
    );
    await setState(from, {
      step: "idle",
      updated_at: new Date().toISOString(),
    });
  }
}
