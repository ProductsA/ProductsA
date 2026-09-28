import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/admin-auth";
import { testConnection } from "@/lib/google-api";

export async function POST(
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

  const result = await testConnection(spreadsheet.serviceAccountKey, spreadsheet.spreadsheetId);

  await prisma.googleSpreadsheet.update({
    where: { id: spreadsheetId },
    data: {
      lastTestedAt: new Date(),
      lastTestStatus: result.success ? "success" : "failed",
    },
  });

  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 });
  }

  return Response.json({ success: true });
}
