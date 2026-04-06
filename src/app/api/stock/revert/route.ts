import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { history_id } = await request.json();

    if (!history_id) {
      return NextResponse.json(
        { error: "Se requiere history_id" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Obtener el registro de historial
    const { data: entry, error: fetchError } = await admin
      .from("stock_history")
      .select("*")
      .eq("id", history_id)
      .single();

    if (fetchError || !entry) {
      return NextResponse.json(
        { error: "Registro de historial no encontrado" },
        { status: 404 }
      );
    }

    const parsedProducts = entry.parsed_products as {
      name: string;
      stock: number;
    }[];

    let reverted = 0;
    let deleted = 0;

    for (const product of parsedProducts) {
      // Buscar el producto por nombre (case-insensitive)
      const { data: existing } = await admin
        .from("products")
        .select("*")
        .ilike("name", product.name)
        .limit(1)
        .single();

      if (!existing) continue;

      const newStock = existing.stock - product.stock;

      if (newStock <= 0 && existing.created_at === existing.updated_at) {
        // Si el stock queda en 0 o menos y nunca fue editado manualmente,
        // probablemente fue creado por esta carga → eliminar
        await admin.from("products").delete().eq("id", existing.id);
        deleted++;
      } else {
        // Restar el stock que se agregó
        await admin
          .from("products")
          .update({ stock: Math.max(0, newStock) })
          .eq("id", existing.id);
        reverted++;
      }
    }

    // Eliminar el registro de historial
    await admin.from("stock_history").delete().eq("id", history_id);

    return NextResponse.json({
      success: true,
      products_reverted: reverted,
      products_deleted: deleted,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al revertir";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
