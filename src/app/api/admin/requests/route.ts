import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { id, status, notes, adminComments } = body;

  if (!id) {
    return NextResponse.json({ error: "Request ID required" }, { status: 400 });
  }

  const data: Record<string, string> = {};
  if (status !== undefined) data.status = status;
  if (notes !== undefined) data.notes = notes;
  if (adminComments !== undefined) data.adminComments = adminComments;

  const updated = await prisma.customerRequest.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}
