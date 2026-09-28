import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fieldId = parseInt(id, 10);

  if (isNaN(fieldId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await request.json();

  const field = await prisma.customField.update({
    where: { id: fieldId },
    data: body,
  });

  return NextResponse.json(field);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fieldId = parseInt(id, 10);

  if (isNaN(fieldId)) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  await prisma.customFieldValue.deleteMany({ where: { fieldId } });
  await prisma.customField.delete({ where: { id: fieldId } });

  return NextResponse.json({ success: true });
}
