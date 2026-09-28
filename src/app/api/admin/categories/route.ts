import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { requireAdmin, unauthorized } from "@/lib/admin-auth";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });
  return Response.json(categories);
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin();
  if (!session) return unauthorized();

  try {
    const body = await request.json();
    const { name, slug, description, image } = body;

    if (!name) {
      return Response.json({ error: "Category name is required" }, { status: 400 });
    }

    const finalSlug = slug ? slugify(slug) : slugify(name);

    const existing = await prisma.category.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return Response.json(
        { error: "A category with this slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug,
        description: description || null,
        image: image || null,
      },
    });

    return Response.json({ success: true, category });
  } catch {
    return Response.json(
      { error: "Failed to create category" },
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
      return Response.json({ error: "No category IDs provided" }, { status: 400 });
    }

    const categoryIds = ids.map((id: unknown) => Number(id)).filter((id: number) => !isNaN(id));
    if (categoryIds.length === 0) {
      return Response.json({ error: "Invalid category IDs" }, { status: 400 });
    }

    const categoriesWithProducts = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
      include: { _count: { select: { products: true } } },
    });

    const blocked = categoriesWithProducts.filter((c) => c._count.products > 0);
    if (blocked.length > 0) {
      return Response.json(
        {
          error: `Cannot delete categories with products: ${blocked.map((c) => c.name).join(", ")}. Move or delete products first.`,
        },
        { status: 400 }
      );
    }

    for (const cat of categoriesWithProducts) {
      if (cat.image) {
        try {
          const { unlink } = await import("fs/promises");
          const path = await import("path");
          await unlink(path.join(process.cwd(), "public", cat.image));
        } catch {}
      }
    }

    await prisma.category.deleteMany({ where: { id: { in: categoryIds } } });

    return Response.json({ success: true, deleted: categoryIds.length });
  } catch {
    return Response.json({ error: "Failed to delete categories" }, { status: 500 });
  }
}
