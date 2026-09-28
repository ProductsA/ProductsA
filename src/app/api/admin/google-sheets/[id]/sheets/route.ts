import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/admin-auth";
import { listSheets, createSheet } from "@/lib/google-api";

export async function GET(
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

  const spreadsheet = await prisma.googleSpreadsheet.findUnique({ where: { id: spreadsheetId } });
  if (!spreadsheet) return Response.json({ error: "Not found" }, { status: 404 });

  const result = await listSheets(spreadsheet.serviceAccountKey, spreadsheet.spreadsheetId);
  if (result.error) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  return Response.json({ sheets: result.sheets, selectedSheetName: spreadsheet.selectedSheetName });
}

export async function POST(
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

  const spreadsheet = await prisma.googleSpreadsheet.findUnique({ where: { id: spreadsheetId } });
  if (!spreadsheet) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { title } = body;
  if (!title?.trim()) return Response.json({ error: "Sheet name is required" }, { status: 400 });

  const result = await createSheet(spreadsheet.serviceAccountKey, spreadsheet.spreadsheetId, title.trim());
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  return Response.json({ success: true, sheetId: result.sheetId });
}
