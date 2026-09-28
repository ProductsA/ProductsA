import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { ScrollReveal } from "@/components/store/ScrollReveal";
import { serialize } from "@/lib/utils";
import { ChevronRight, Package } from "lucide-react";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(props: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const siteName = await getSiteName();
  const category = await prisma.category.findUnique({ where: { slug }, select: { name: true } });
  if (!category) return { title: `${siteName} | Category Not Found` };
  return { title: `${siteName} | ${category.name}` };
}

export default async function CategoryPage(props: PageProps<"/categories/[slug]">) {
  const { slug } = await props.params;

  const category = await prisma.category.findFirst({
    where: { slug },
    include: {
      _count: { select: { products: { where: { isVisible: true } } } },
    },
  });

  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, isVisible: true },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variations: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      <ScrollReveal>
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        {category.description && (
          <p className="text-muted-foreground mb-8 max-w-2xl">{category.description}</p>
        )}
      </ScrollReveal>

      {products.length === 0 ? (
        <ScrollReveal>
          <div className="text-center py-20 text-muted-foreground">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Aucun produit dans cette categorie</p>
            <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
              Voir tous les produits
            </Link>
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serialize(products).map((product, i) => (
            <ScrollReveal key={product.id} delay={i * 80}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
