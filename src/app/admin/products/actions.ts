"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { unlink } from "fs/promises";
import path from "path";

export async function deleteProduct(id: number) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true, variations: true },
  });

  if (!product) {
    return { success: false, error: "Product not found" };
  }

  const imagePaths: string[] = [];
  if (product.mainImage) imagePaths.push(product.mainImage);
  for (const img of product.images) {
    imagePaths.push(img.imageUrl);
  }

  await prisma.customerRequest.deleteMany({ where: { productId: id } });
  await prisma.productImage.deleteMany({ where: { productId: id } });
  await prisma.productVariation.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });

  for (const imgPath of imagePaths) {
    try {
      const fullPath = path.join(process.cwd(), "public", imgPath);
      await unlink(fullPath);
    } catch {}
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function toggleProductVisibility(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { success: false, error: "Product not found" };

  await prisma.product.update({
    where: { id },
    data: { isVisible: !product.isVisible },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

export async function toggleProductFeatured(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { success: false, error: "Product not found" };

  await prisma.product.update({
    where: { id },
    data: { featured: !product.featured },
  });

  revalidatePath("/admin/products");
  return { success: true };
}

export async function toggleProductStatus(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return { success: false, error: "Product not found" };

  await prisma.product.update({
    where: { id },
    data: { status: !product.status },
  });

  revalidatePath("/admin/products");
  return { success: true };
}
