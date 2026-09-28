import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [{ id: parseInt(id, 10) || -1 }, { slug: id }],
      isVisible: true,
    },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variations: true,
      _count: { select: { requests: true } },
    },
  });

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json(product);
}
