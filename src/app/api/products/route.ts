import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import type { Prisma } from "@/generated/prisma/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10))
  );
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    isVisible: true,
  };

  if (category) {
    where.category = { slug: category };
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { shortDescription: { contains: search } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput;
  switch (sort) {
    case "price-asc":
      orderBy = { price: "asc" };
      break;
    case "price-desc":
      orderBy = { price: "desc" };
      break;
    case "popular":
      orderBy = { requests: { _count: "desc" } };
      break;
    case "newest":
    default:
      orderBy = { createdAt: "desc" };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variations: true,
        _count: { select: { requests: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return Response.json({
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
