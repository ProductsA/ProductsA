import { prisma } from "@/lib/prisma";

const WHATSAPP_API_URL = "https://graph.facebook.com/v21.0";
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export interface WhatsAppOrderDetails {
  requestId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  productName: string;
  productPrice: number;
  productDiscountPrice: number | null;
  variation: string;
  customFields: string;
  submittedAt: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
  }).format(price);
}

function buildOrderMessage(details: WhatsAppOrderDetails): string {
  const priceLine = details.productDiscountPrice
    ? `*${formatPrice(details.productDiscountPrice)}* ~~${formatPrice(details.productPrice)}~~`
    : `*${formatPrice(details.productPrice)}*`;

  let msg = `🛒 *Nouvelle Commande - Souq*\n\n`;
  msg += `📋 *Request ID:* ${details.requestId}\n`;
  msg += `🕐 *Date:* ${details.submittedAt}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 *Client*\n`;
  msg += `   Nom: ${details.customerName}\n`;
  msg += `   Tel: ${details.customerPhone}\n`;
  msg += `   Email: ${details.customerEmail}\n`;
  msg += `   Adresse: ${details.customerAddress}`;
  if (details.customerCity) msg += `, ${details.customerCity}`;
  msg += `\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━\n`;
  msg += `📦 *Produit*\n`;
  msg += `   ${details.productName}\n`;
  msg += `   Prix: ${priceLine}\n`;
  if (details.variation) {
    msg += `   Variation: ${details.variation}\n`;
  }
  if (details.customFields) {
    msg += `\n📝 *Champs supplementaires*\n`;
    msg += `   ${details.customFields}\n`;
  }
  msg += `\n━━━━━━━━━━━━━━━━━━\n`;
  msg += `✅ *Statut:* Nouveau`;

  return msg;
}

export async function sendWhatsAppOrderNotification(
  details: WhatsAppOrderDetails,
  recipientPhone?: string
): Promise<{ success: boolean; error?: string }> {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    return { success: false, error: "WhatsApp API not configured" };
  }

  let phone = recipientPhone || process.env.ADMIN_WHATSAPP_PHONE;
  if (!phone) {
    const setting = await prisma.websiteSetting.findUnique({
      where: { key: "whatsapp" },
    });
    phone = setting?.value || undefined;
  }
  if (!phone) {
    return { success: false, error: "No recipient phone number configured" };
  }

  const formattedPhone = phone.replace(/[^0-9]/g, "");
  const message = buildOrderMessage(details);

  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "text",
          text: { body: message },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMsg =
        errorData?.error?.message || `HTTP ${response.status}`;
      console.error("[WhatsApp] Send failed:", errorMsg);
      return { success: false, error: errorMsg };
    }

    const result = await response.json();
    console.log("[WhatsApp] Message sent:", result.messages?.[0]?.id);
    return { success: true };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Unknown error";
    console.error("[WhatsApp] Send error:", errorMsg);
    return { success: false, error: errorMsg };
  }
}
