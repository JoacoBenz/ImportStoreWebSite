import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseStockMessage } from "@/lib/claude";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { raw_message } = await request.json();

    if (!raw_message || typeof raw_message !== "string") {
      return NextResponse.json(
        { error: "Se requiere un mensaje de texto" },
        { status: 400 }
      );
    }

    const result = await parseStockMessage(raw_message);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ products: result.products });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al parsear";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
