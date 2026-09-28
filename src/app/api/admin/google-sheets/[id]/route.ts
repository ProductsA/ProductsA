import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/admin-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;
  const spreadsheetId = parseInt(id, 10);
  if (isNaN(spreadsheetId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await prisma.googleSpreadsheet.findUnique({ where: { id: spreadsheetId } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { name, selectedSheetName, isActive } = body;

  const updated = await prisma.googleSpreadsheet.update({
    where: { id: spreadsheetId },
    data: {
      ...(name !== undefined && { name: name.trim() }),
      ...(selectedSheetName !== undefined && { selectedSheetName: selectedSheetName?.trim() || null }),
      ...(isActive !== undefined && { isActive }),
    },
    select: {
      id: true,
      name: true,
      spreadsheetId: true,
      selectedSheetName: true,
      isActive: true,
      lastTestedAt: true,
      lastTestStatus: true,
      createdAt: true,
    },
  });

  return Response.json({ success: true, spreadsheet: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;
  const spreadsheetId = parseInt(id, 10);
  if (isNaN(spreadsheetId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await prisma.googleSpreadsheet.findUnique({ where: { id: spreadsheetId } });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.googleSpreadsheet.delete({ where: { id: spreadsheetId } });
  return Response.json({ success: true });
}
