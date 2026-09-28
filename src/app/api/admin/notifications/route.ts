import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const unreadOnly = searchParams.get("unread") === "true";
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (unreadOnly) {
    where.read = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { read: false } }),
  ]);

  return Response.json({
    notifications,
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, markAllAsRead } = body;

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: { read: false },
        data: { read: true },
      });
    } else if (ids && Array.isArray(ids)) {
      await prisma.notification.updateMany({
        where: { id: { in: ids.map(Number) } },
        data: { read: true },
      });
    } else {
      return Response.json({ error: "No action specified" }, { status: 400 });
    }

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Failed to update notifications" },
      { status: 500 }
    );
  }
}
