import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const settings = await prisma.websiteSetting.findMany({
    where: { key: { startsWith: "appearance_" } },
  });

  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value || "";
  }
  return Response.json(map);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    for (const [key, value] of Object.entries(body)) {
      if (!key.startsWith("appearance_") || typeof value !== "string") continue;
      await prisma.websiteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to update appearance settings" }, { status: 500 });
  }
}
