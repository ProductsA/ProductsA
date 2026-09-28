import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const siteName = await getSiteName();
  const product = await prisma.product.findUnique({ where: { id: parseInt(id) }, select: { name: true } });
  if (!product) return { title: `${siteName} | Produit Non Trouve` };
  return { title: `${siteName} | Modifier: ${product.name}` };
}

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) notFound();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variations: true,
    },
  });

  if (!product) notFound();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const specifications: Record<string, string> = (() => {
    try {
      return JSON.parse(product.specifications);
    } catch {
      return {};
    }
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <p className="text-muted-foreground">Update {product.name}</p>
      </div>
      <ProductForm
        mode="edit"
        categories={categories}
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          shortDescription: product.shortDescription ?? "",
          price: parseFloat(String(product.price)),
          discountPrice: product.discountPrice ? parseFloat(String(product.discountPrice)) : null,
          categoryId: product.categoryId,
          videoUrl: product.videoUrl ?? "",
          mainImage: product.mainImage,
          status: product.status,
          featured: product.featured,
          isVisible: product.isVisible,
          seoTitle: product.seoTitle ?? "",
          seoDescription: product.seoDescription ?? "",
          specifications,
          images: product.images.map((img) => ({
            id: img.id,
            imageUrl: img.imageUrl,
            sortOrder: img.sortOrder,
          })),
          variations: product.variations.map((v) => ({
            id: v.id,
            variationName: v.variationName,
            variationValue: v.variationValue,
          })),
        }}
      />
    </div>
  );
}
