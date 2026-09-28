import { NextResponse } from "next/server";
import { requireAdmin, unauthorized } from "@/lib/admin-auth";
import { getSyncStats } from "@/lib/google-sheets";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const stats = await getSyncStats();

  return NextResponse.json(stats);
}
