import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalProducts,
    activeProducts,
    hiddenProducts,
    totalCustomers,
    newCustomers,
    contactedCustomers,
    confirmedCustomers,
    totalRequests,
    requestsToday,
    requestsThisWeek,
    requestsThisMonth,
    requestsPerDayRaw,
    requestsPerProduct,
    recentRequests,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { status: true } }),
    prisma.product.count({ where: { isVisible: false } }),
    prisma.customer.count(),
    prisma.customerRequest.count({ where: { status: "New" } }),
    prisma.customerRequest.count({ where: { status: "Contacted" } }),
    prisma.customerRequest.count({ where: { status: "Confirmed" } }),
    prisma.customerRequest.count(),
    prisma.customerRequest.count({ where: { submittedAt: { gte: todayStart } } }),
    prisma.customerRequest.count({ where: { submittedAt: { gte: weekStart } } }),
    prisma.customerRequest.count({ where: { submittedAt: { gte: monthStart } } }),
    (async () => {
      const days: { date: string; count: number; fullDate: string }[] = [];
      for (let i = 29; i >= 0; i--) {
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
        const count = await prisma.customerRequest.count({
          where: { submittedAt: { gte: dayStart, lt: dayEnd } },
        });
        days.push({
          date: dayStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          count,
          fullDate: dayStart.toISOString().split("T")[0],
        });
      }
      return days;
    })(),
    prisma.customerRequest.groupBy({
      by: ["productId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.customerRequest.findMany({
      take: 20,
      orderBy: { submittedAt: "desc" },
      include: {
        customer: { select: { firstName: true, lastName: true } },
        product: { select: { name: true } },
      },
    }),
  ]);

  const topProductIds = requestsPerProduct.map((r) => r.productId);
  const topProducts = await prisma.product.findMany({
    where: { id: { in: topProductIds } },
    select: { id: true, name: true },
  });
  const productMap = new Map(topProducts.map((p) => [p.id, p.name]));

  const requestsPerProductData = requestsPerProduct.map((r) => ({
    product: productMap.get(r.productId) || `Product #${r.productId}`,
    count: r._count.id,
  }));

  const mostRequestedProduct = requestsPerProductData[0] || null;

  const conversionRate =
    totalRequests > 0 ? ((confirmedCustomers / totalRequests) * 100).toFixed(1) : "0";

  return NextResponse.json({
    products: { total: totalProducts, active: activeProducts, hidden: hiddenProducts },
    customers: {
      total: totalCustomers,
      new: newCustomers,
      contacted: contactedCustomers,
      confirmed: confirmedCustomers,
    },
    requests: {
      total: totalRequests,
      today: requestsToday,
      thisWeek: requestsThisWeek,
      thisMonth: requestsThisMonth,
    },
    requestsPerDay: requestsPerDayRaw,
    requestsPerProduct: requestsPerProductData,
    mostRequestedProduct,
    conversion: { rate: conversionRate, new: newCustomers, confirmed: confirmedCustomers },
    recentActivity: recentRequests.map((r) => ({
      id: r.id,
      customer: `${r.customer.firstName} ${r.customer.lastName ?? ""}`.trim(),
      product: r.product.name,
      status: r.status,
      date: r.submittedAt.toISOString(),
    })),
  });
}
