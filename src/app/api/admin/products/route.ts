import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") || "20", 10));
  const search = searchParams.get("search");
  const category = searchParams.get("category");
  const status = searchParams.get("status");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (status === "active") {
    where.status = true;
  } else if (status === "hidden") {
    where.isVisible = false;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
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

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  try {
    const body = await request.json();

    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      discountPrice,
      categoryId,
      videoUrl,
      mainImage,
      status,
      featured,
      isVisible,
      seoTitle,
      seoDescription,
      specifications,
      variations,
      images,
    } = body;

    if (!name || !slug || price === undefined || !categoryId) {
      return Response.json(
        { error: "Name, slug, price, and category are required" },
        { status: 400 }
      );
    }

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      return Response.json(
        { error: "A product with this slug already exists" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        shortDescription: shortDescription || null,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        categoryId: Number(categoryId),
        videoUrl: videoUrl || null,
        mainImage: mainImage || null,
        status: status ?? true,
        featured: featured ?? false,
        isVisible: isVisible ?? true,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        specifications: specifications || "{}",
        images: images?.length
          ? {
              create: images.map((img: { imageUrl: string; sortOrder: number }) => ({
                imageUrl: img.imageUrl,
                sortOrder: img.sortOrder,
              })),
            }
          : undefined,
        variations: variations?.length
          ? {
              create: variations.map((v: { variationName: string; variationValue: string }) => ({
                variationName: v.variationName,
                variationValue: v.variationValue,
              })),
            }
          : undefined,
      },
    });

    return Response.json({ success: true, product });
  } catch {
    return Response.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: "No product IDs provided" }, { status: 400 });
    }

    const productIds = ids.map((id: unknown) => Number(id)).filter((id: number) => !isNaN(id));
    if (productIds.length === 0) {
      return Response.json({ error: "Invalid product IDs" }, { status: 400 });
    }

    await prisma.customerRequest.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.productImage.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.productVariation.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });

    return Response.json({ success: true, deleted: productIds.length });
  } catch {
    return Response.json({ error: "Failed to delete products" }, { status: 500 });
  }
}
