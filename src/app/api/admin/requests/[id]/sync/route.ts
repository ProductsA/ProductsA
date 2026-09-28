import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/lib/admin-auth";
import { syncSingleRequest } from "@/lib/google-sheets";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const { id } = await params;
  const requestId = id;

  if (!requestId) {
    return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
  }

  const result = await syncSingleRequest(requestId);

  return NextResponse.json({
    success: result.success,
    error: result.error,
  });
}
