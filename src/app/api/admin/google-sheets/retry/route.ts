import { NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/lib/admin-auth";
import { retryFailed } from "@/lib/google-sheets";

export async function POST() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const result = await retryFailed();

  return NextResponse.json({
    success: true,
    synced: result.synced,
    failed: result.failed,
    errors: result.errors,
  });
}
