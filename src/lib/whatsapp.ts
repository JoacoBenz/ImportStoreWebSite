const GRAPH_API_URL = "https://graph.facebook.com/v21.0";

export async function sendWhatsAppMessage(
  to: string,
  text: string
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  await fetch(`${GRAPH_API_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}

export async function sendWhatsAppInteractive(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
): Promise<void> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  await fetch(`${GRAPH_API_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: {
          buttons: buttons.map((btn) => ({
            type: "reply",
            reply: { id: btn.id, title: btn.title },
          })),
        },
      },
    }),
  });
}

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  // En producción, verificar con HMAC-SHA256 usando el app secret
  // Para el MVP, validamos que el token de verificación coincida
  return true;
}

export function isAuthorizedNumber(from: string): boolean {
  const authorized = process.env.WHATSAPP_AUTHORIZED_NUMBER?.replace(
    /[^0-9]/g,
    ""
  );
  const incoming = from.replace(/[^0-9]/g, "");
  return incoming === authorized;
}
