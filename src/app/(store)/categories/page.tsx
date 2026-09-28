import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ScrollReveal } from "@/components/store/ScrollReveal";
import { FolderTree, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Categories` };
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: { where: { isVisible: true } } } },
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <ScrollReveal>
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground mb-8">
          Parcourez nos categories pour trouver exactement ce que vous cherchez
        </p>
      </ScrollReveal>

      {categories.length === 0 ? (
        <ScrollReveal>
          <div className="text-center py-20 text-muted-foreground">
            <FolderTree className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Aucune categorie disponible</p>
          </div>
        </ScrollReveal>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.id} delay={i * 80}>
              <Link
                href={`/categories/${cat.slug}`}
                className="group block rounded-2xl border bg-card p-8 card-hover"
              >
                <h2 className="text-xl font-semibold group-hover:text-primary transition-colors">{cat.name}</h2>
                {cat.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{cat.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  {cat._count.products} produit{cat._count.products !== 1 ? "s" : ""}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Explorer <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>
  );
}
