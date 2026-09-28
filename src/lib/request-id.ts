import { prisma } from "@/lib/prisma";

export async function generateRequestId(): Promise<string> {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");

  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const count = await prisma.customerRequest.count({
    where: {
      submittedAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  });

  const seq = String(count + 1).padStart(4, "0");
  return `REQ-${dateStr}-${seq}`;
}
