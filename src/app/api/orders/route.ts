import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRequestId } from "@/lib/request-id";
import { sendToGoogleSheets } from "@/lib/google-sheets";
import { sendWhatsAppOrderNotification } from "@/lib/whatsapp";
import { z } from "zod/v4";

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return false;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

const orderSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  deviceId: z.string().optional(),
  productId: z.number().int().positive(),
  variation: z.string().optional(),
  customFieldValues: z
    .array(
      z.object({
        fieldId: z.number().int().positive(),
        value: z.string(),
      })
    )
    .optional(),
});

export async function POST(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";

  if (!checkRateLimit(ip)) {
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Validation failed", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
  const recentDuplicate = await prisma.customerRequest.findFirst({
    where: {
      productId: data.productId,
      submittedAt: { gte: fiveMinAgo },
      customer: { email: data.email },
    },
  });

  if (recentDuplicate) {
    return Response.json(
      { error: "You have already submitted a request for this product recently." },
      { status: 409 }
    );
  }

  const requestId = await generateRequestId();

  let customer = await prisma.customer.findFirst({ where: { email: data.email } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName || null,
        gender: data.gender || null,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city || null,
        region: data.region || null,
        postalCode: data.postalCode || null,
        country: data.country || null,
        deviceId: data.deviceId || null,
      },
    });
  }

  const customerRequest = await prisma.customerRequest.create({
    data: {
      requestId,
      customerId: customer.id,
      productId: data.productId,
      variation: data.variation || null,
    },
  });

  if (data.customFieldValues && data.customFieldValues.length > 0) {
    await prisma.customFieldValue.createMany({
      data: data.customFieldValues.map((cfv) => ({
        customerId: customer.id,
        fieldId: cfv.fieldId,
        value: cfv.value,
      })),
    });
  }

  const customerName = [data.firstName, data.lastName].filter(Boolean).join(" ");
  await prisma.notification.create({
    data: {
      title: "New customer request",
      message: `Customer ${customerName} submitted a request for ${product.name}`,
      type: "new_request",
    },
  });

  const now = new Date();
  const customFieldLabels: string[] = [];
  if (data.customFieldValues && data.customFieldValues.length > 0) {
    const fieldIds = data.customFieldValues.map((cfv) => cfv.fieldId);
    const fields = await prisma.customField.findMany({ where: { id: { in: fieldIds } } });
    const fieldMap = new Map(fields.map((f) => [f.id, f.fieldName]));
    for (const cfv of data.customFieldValues) {
      const label = fieldMap.get(cfv.fieldId) || `Field ${cfv.fieldId}`;
      customFieldLabels.push(`${label}: ${cfv.value}`);
    }
  }

  const sheetResult = await sendToGoogleSheets({
    requestId,
    date: now.toLocaleDateString("fr-FR"),
    time: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    product: product.name,
    firstName: data.firstName,
    lastName: data.lastName || "",
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city || "",
    region: data.region || "",
    postalCode: data.postalCode || "",
    country: data.country || "",
    gender: data.gender || "",
    selectedVariations: data.variation || "",
    customFieldValues: customFieldLabels.join("; "),
    requestStatus: "New",
    notes: "",
    deviceId: data.deviceId || "",
    createdAt: now.toISOString(),
  }, customerRequest.id);

  if (!sheetResult.success) {
    console.warn("Google Sheets sync failed:", sheetResult.error);
  }

  const whatsAppResult = await sendWhatsAppOrderNotification({
    requestId,
    customerName: customerName,
    customerPhone: data.phone,
    customerEmail: data.email,
    customerAddress: data.address,
    customerCity: data.city || "",
    productName: product.name,
    productPrice: Number(product.price),
    productDiscountPrice: product.discountPrice ? Number(product.discountPrice) : null,
    variation: data.variation || "",
    customFields: customFieldLabels.join("; "),
    submittedAt: now.toLocaleString("fr-FR", {
      dateStyle: "full",
      timeStyle: "short",
    }),
  });

  if (!whatsAppResult.success) {
    console.warn("WhatsApp notification failed:", whatsAppResult.error);
  }

  return Response.json({
    success: true,
    message: "Your request has been submitted successfully!",
    requestId,
    syncStatus: sheetResult.success ? "synced" : "pending",
    whatsappStatus: whatsAppResult.success ? "sent" : "failed",
  });
}
