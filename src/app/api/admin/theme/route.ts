import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const setting = await prisma.websiteSetting.findUnique({
    where: { key: "appearance_theme_mode" },
  });
  return NextResponse.json({ theme: setting?.value || "system" });
}

export async function POST(request: Request) {
  const { theme } = await request.json();
  if (!["light", "dark", "system"].includes(theme)) {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }
  await prisma.websiteSetting.upsert({
    where: { key: "appearance_theme_mode" },
    update: { value: theme },
    create: { key: "appearance_theme_mode", value: theme },
  });
  return NextResponse.json({ success: true });
}
