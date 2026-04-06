import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ParsedProduct, StockAction, StockSource } from "@/types";

interface ApplyRequest {
  products: ParsedProduct[];
  action: StockAction;
  raw_message: string;
  source: StockSource;
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
    const { products, action, raw_message, source } = body;

    if (!products?.length || !action || !raw_message) {
      return NextResponse.json(
        { error: "Datos incompletos" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    let productsCreated = 0;
    let productsUpdated = 0;
    let productsDeactivated = 0;

    // En modo replace, desactivar todos los productos
    if (action === "replace") {
      // Contar cuántos se desactivan
      const { data: activeProducts } = await admin
        .from("products")
        .select("id")
        .eq("is_active", true);

      productsDeactivated = activeProducts?.length || 0;

      await admin
        .from("products")
        .update({ is_active: false })
        .eq("is_active", true);
    }

    // Procesar cada producto
    for (const product of products) {
      // Buscar producto existente por nombre (case-insensitive)
      const { data: existing } = await admin
        .from("products")
        .select("*")
        .ilike("name", product.name)
        .limit(1)
        .single();

      if (existing) {
        // Actualizar producto existente
        const updates: Record<string, unknown> = {
          price_usd: product.price_usd,
          category: product.category,
          is_active: true,
          description: product.description || existing.description,
        };

        if (action === "add") {
          updates.stock = existing.stock + product.stock;
        } else {
          updates.stock = product.stock;
        }

        await admin.from("products").update(updates).eq("id", existing.id);
        productsUpdated++;

        // Si estaba desactivado y lo reactivamos, no cuenta como "desactivado"
        if (action === "replace") {
          productsDeactivated = Math.max(0, productsDeactivated - 1);
        }
      } else {
        // Crear producto nuevo
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
      action,
      products_created: productsCreated,
      products_updated: productsUpdated,
      products_deactivated: productsDeactivated,
      source,
    });

    return NextResponse.json({
      success: true,
      products_created: productsCreated,
      products_updated: productsUpdated,
      products_deactivated: productsDeactivated,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al aplicar stock";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
