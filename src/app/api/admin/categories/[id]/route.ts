import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { requireAdmin, unauthorized } from "@/lib/admin-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return Response.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, slug, description, image } = body;

    const existing = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!existing) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    const finalSlug = slug ? slugify(slug) : slugify(name);

    if (finalSlug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({ where: { slug: finalSlug } });
      if (slugExists) {
        return Response.json(
          { error: "A category with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const category = await prisma.category.update({
      where: { id: categoryId },
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
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return unauthorized();
  try {
    const { id } = await params;
    const categoryId = parseInt(id, 10);
    if (isNaN(categoryId)) {
      return Response.json({ error: "Invalid category ID" }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      return Response.json({ error: "Category not found" }, { status: 404 });
    }

    if (existing._count.products > 0) {
      return Response.json(
        { error: "Cannot delete category with products. Move or delete products first." },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id: categoryId } });
    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
