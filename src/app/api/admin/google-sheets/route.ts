import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/admin-auth";
import { testConnection } from "@/lib/google-api";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const spreadsheets = await prisma.googleSpreadsheet.findMany({
    orderBy: { createdAt: "desc" },
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
  return Response.json(spreadsheets);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  try {
    const body = await request.json();
    const { name, spreadsheetId, serviceAccountKey, selectedSheetName } = body;

    if (!name?.trim()) return Response.json({ error: "Name is required" }, { status: 400 });
    if (!spreadsheetId?.trim()) return Response.json({ error: "Spreadsheet ID is required" }, { status: 400 });
    if (!serviceAccountKey?.trim()) return Response.json({ error: "Service account key is required" }, { status: 400 });

    let parsed;
    try {
      parsed = JSON.parse(serviceAccountKey);
    } catch {
      return Response.json({ error: "Invalid service account key JSON" }, { status: 400 });
    }
    if (!parsed.client_email || !parsed.private_key) {
      return Response.json({ error: "Service account key must contain client_email and private_key" }, { status: 400 });
    }

    const test = await testConnection(serviceAccountKey, spreadsheetId);
    if (!test.success) {
      return Response.json({ error: `Connection failed: ${test.error}` }, { status: 400 });
    }

    const spreadsheet = await prisma.googleSpreadsheet.create({
      data: {
        name: name.trim(),
        spreadsheetId: spreadsheetId.trim(),
        serviceAccountKey: serviceAccountKey.trim(),
        selectedSheetName: selectedSheetName?.trim() || null,
        isActive: true,
        lastTestedAt: new Date(),
        lastTestStatus: "success",
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

    return Response.json({ success: true, spreadsheet });
  } catch {
    return Response.json({ error: "Failed to create spreadsheet connection" }, { status: 500 });
  }
}
