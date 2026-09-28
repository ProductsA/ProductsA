import { prisma } from "@/lib/prisma";

export async function GET() {
  const fields = await prisma.customField.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });
  return Response.json(fields);
}
