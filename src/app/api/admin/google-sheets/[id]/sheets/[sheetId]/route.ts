import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/admin-auth";
import { renameSheet, deleteSheet } from "@/lib/google-api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sheetId: string }> }
) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id, sheetId: sheetIdStr } = await params;
  const spreadsheetId = parseInt(id, 10);
  const sheetId = parseInt(sheetIdStr, 10);
  if (isNaN(spreadsheetId) || isNaN(sheetId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const spreadsheet = await prisma.googleSpreadsheet.findUnique({ where: { id: spreadsheetId } });
  if (!spreadsheet) return Response.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const { title } = body;
  if (!title?.trim()) return Response.json({ error: "Sheet name is required" }, { status: 400 });

  const result = await renameSheet(spreadsheet.serviceAccountKey, spreadsheet.spreadsheetId, sheetId, title.trim());
  if (!result.success) return Response.json({ error: result.error }, { status: 500 });

  const sheets = await prisma.googleSpreadsheet.findUnique({ where: { id: spreadsheetId } });
  if (sheets?.selectedSheetName) {
    const currentSheetList = await import("@/lib/google-api").then((m) => m.listSheets(spreadsheet.serviceAccountKey, spreadsheet.spreadsheetId));
    const renamedSheet = currentSheetList.sheets.find((s) => s.sheetId === sheetId);
    if (renamedSheet && sheets.selectedSheetName !== renamedSheet.title) {
      const oldTitle = sheets.selectedSheetName;
      if (oldTitle) {
        await prisma.googleSpreadsheet.update({
          where: { id: spreadsheetId },
          data: { selectedSheetName: renamedSheet.title },
        });
      }
    }
  }

  return Response.json({ success: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; sheetId: string }> }
) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id, sheetId: sheetIdStr } = await params;
  const spreadsheetId = parseInt(id, 10);
  const sheetId = parseInt(sheetIdStr, 10);
  if (isNaN(spreadsheetId) || isNaN(sheetId)) {
    return Response.json({ error: "Invalid ID" }, { status: 400 });
  }

  const spreadsheet = await prisma.googleSpreadsheet.findUnique({ where: { id: spreadsheetId } });
  if (!spreadsheet) return Response.json({ error: "Not found" }, { status: 404 });

  const result = await deleteSheet(spreadsheet.serviceAccountKey, spreadsheet.spreadsheetId, sheetId);
  if (!result.success) return Response.json({ error: result.error }, { status: 500 });

  return Response.json({ success: true });
}
