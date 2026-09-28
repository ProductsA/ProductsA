import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const days: { date: string; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);

    const count = await prisma.customerRequest.count({
      where: {
        submittedAt: { gte: start, lt: end },
      },
    });

    days.push({
      date: start.toLocaleDateString("en-US", { weekday: "short" }),
      count,
    });
  }

  return NextResponse.json(days);
}
