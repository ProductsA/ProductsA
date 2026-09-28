"use server";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";

interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
  image?: string | null;
}

export async function createCategory(data: CategoryInput) {
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    return { success: false, error: "A category with this slug already exists" };
  }

  await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      image: data.image || null,
    },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: number, data: CategoryInput) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return { success: false, error: "Category not found" };

  const slug = data.slug ? slugify(data.slug) : slugify(data.name);

  if (slug !== category.slug) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: "A category with this slug already exists" };
    }
  }

  await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      image: data.image || null,
    },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: number) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) return { success: false, error: "Category not found" };
  if (category._count.products > 0) {
    return { success: false, error: "Cannot delete category with products. Move or delete products first." };
  }

  if (category.image) {
    try {
      const fullPath = path.join(process.cwd(), "public", category.image);
      await unlink(fullPath);
    } catch {}
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { success: true };
}
