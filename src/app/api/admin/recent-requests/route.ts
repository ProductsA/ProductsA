import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const requests = await prisma.customerRequest.findMany({
    take: 10,
    orderBy: { submittedAt: "desc" },
    include: {
      customer: { select: { firstName: true, lastName: true } },
      product: { select: { name: true } },
    },
  });

  return NextResponse.json(requests);
}
