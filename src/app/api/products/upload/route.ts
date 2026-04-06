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
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se envió ningún archivo" },
        { status: 400 }
      );
    }

    // Generar nombre único para el archivo
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${productId || crypto.randomUUID()}-${Date.now()}.${ext}`;

    const admin = createAdminClient();

    // Subir a Supabase Storage
    const { error: uploadError } = await admin.storage
      .from("product-images")
      .upload(fileName, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `Error al subir: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Obtener URL pública
    const {
      data: { publicUrl },
    } = admin.storage.from("product-images").getPublicUrl(fileName);

    // Si hay productId, actualizar el producto
    if (productId) {
      await admin
        .from("products")
        .update({ image_url: publicUrl })
        .eq("id", productId);
    }

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al subir imagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
