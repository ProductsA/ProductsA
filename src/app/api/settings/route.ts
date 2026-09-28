import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.websiteSetting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value || "";
  }
  return Response.json(settingsMap);
}
