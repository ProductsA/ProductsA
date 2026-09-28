import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, unauthorized } from "@/lib/admin-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

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

    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({ where: { slug } });
      if (slugExists) {
        return Response.json(
          { error: "A product with this slug already exists" },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id: productId },
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
      },
    });

    if (images !== undefined) {
      await prisma.productImage.deleteMany({ where: { productId } });
      if (images.length > 0) {
        await prisma.productImage.createMany({
          data: images.map((img: { imageUrl: string; sortOrder: number; id?: number }) => ({
            productId,
            imageUrl: img.imageUrl,
            sortOrder: img.sortOrder,
          })),
        });
      }
    }

    if (variations !== undefined) {
      await prisma.productVariation.deleteMany({ where: { productId } });
      if (variations.length > 0) {
        await prisma.productVariation.createMany({
          data: variations.map((v: { variationName: string; variationValue: string }) => ({
            productId,
            variationName: v.variationName,
            variationValue: v.variationValue,
          })),
        });
      }
    }

    return Response.json({ success: true, product });
  } catch {
    return Response.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id, 10);
    if (isNaN(productId)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const existing = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });
    if (!existing) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.productImage.deleteMany({ where: { productId } });
    await prisma.productVariation.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
