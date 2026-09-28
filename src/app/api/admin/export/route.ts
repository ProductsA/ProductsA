import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "";
  const search = searchParams.get("search") || "";
  const product = searchParams.get("product") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { customer: { firstName: { contains: search } } },
      { customer: { lastName: { contains: search } } },
      { customer: { email: { contains: search } } },
      { customer: { phone: { contains: search } } },
      { product: { name: { contains: search } } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (product) {
    where.productId = parseInt(product, 10);
  }

  if (dateFrom || dateTo) {
    const submittedAt: Record<string, Date> = {};
    if (dateFrom) submittedAt.gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      submittedAt.lte = end;
    }
    where.submittedAt = submittedAt;
  }

  const requests = await prisma.customerRequest.findMany({
    where,
    include: {
      customer: {
        include: {
          customValues: {
            include: { field: true },
          },
        },
      },
      product: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  const customFieldHeaders = new Set<string>();
  for (const r of requests) {
    for (const cv of r.customer.customValues) {
      customFieldHeaders.add(cv.field.fieldName);
    }
  }

  const baseHeaders = [
    "Request ID",
    "ID",
    "First Name",
    "Last Name",
    "Gender",
    "Email",
    "Phone",
    "Address",
    "City",
    "Region",
    "Postal Code",
    "Country",
    "Product",
    "Variation",
    "Status",
    "Sync Status",
    "Date",
    "Notes",
    "Admin Comments",
  ];

  const customHeaders = Array.from(customFieldHeaders).sort();
  const headers = [...baseHeaders, ...customHeaders];

  const rows = requests.map((r) => {
    const customValues: Record<string, string> = {};
    for (const cv of r.customer.customValues) {
      customValues[cv.field.fieldName] = cv.value;
    }

    const baseRow = [
      r.requestId,
      r.id.toString(),
      r.customer.firstName,
      r.customer.lastName ?? "",
      r.customer.gender ?? "",
      r.customer.email ?? "",
      r.customer.phone ?? "",
      r.customer.address ?? "",
      r.customer.city ?? "",
      r.customer.region ?? "",
      r.customer.postalCode ?? "",
      r.customer.country ?? "",
      r.product.name,
      r.variation ?? "",
      r.status,
      r.syncStatus,
      new Date(r.submittedAt).toLocaleDateString(),
      (r.notes ?? "").replace(/"/g, '""'),
      (r.adminComments ?? "").replace(/"/g, '""'),
    ];

    const customRow = customHeaders.map(
      (h) => (customValues[h] ?? "").replace(/"/g, '""')
    );

    return [...baseRow, ...customRow];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="customers-export.csv"`,
    },
  });
}
