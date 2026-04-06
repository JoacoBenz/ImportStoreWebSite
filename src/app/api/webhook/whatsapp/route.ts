import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedNumber } from "@/lib/whatsapp";
import { handleWhatsAppMessage } from "@/lib/whatsapp-handler";

// GET — Verificación del webhook de Meta
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verificación fallida" }, { status: 403 });
}

// POST — Recibir mensajes de WhatsApp
export async function POST(request: NextRequest) {
  // Siempre responder 200 rápidamente a Meta para evitar reintentos
  try {
    const body = await request.json();

    // Extraer mensajes del payload de Meta Cloud API
    const entries = body?.entry || [];

    for (const entry of entries) {
      const changes = entry?.changes || [];

      for (const change of changes) {
        const value = change?.value;
        if (!value?.messages) continue;

        for (const message of value.messages) {
          const from = message.from;

          // Solo procesar mensajes del número autorizado
          if (!isAuthorizedNumber(from)) continue;

          // Extraer texto o respuesta de botón
          let text = "";
          let buttonId: string | undefined;

          if (message.type === "text") {
            text = message.text?.body || "";
          } else if (message.type === "interactive") {
            buttonId = message.interactive?.button_reply?.id;
            text = message.interactive?.button_reply?.title || "";
          } else {
            // Ignorar otros tipos de mensaje (imagen, audio, etc.)
            continue;
          }

          // Procesar en background para no bloquear la respuesta a Meta
          handleWhatsAppMessage(from, text, buttonId).catch((err) =>
            console.error("Error procesando mensaje WhatsApp:", err)
          );
        }
      }
    }
  } catch (error) {
    console.error("Error parseando webhook de WhatsApp:", error);
  }

  // Siempre retornar 200
  return NextResponse.json({ status: "ok" });
}
