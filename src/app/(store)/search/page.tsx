import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { SearchBar } from "@/components/store/SearchBar";
import { ScrollReveal } from "@/components/store/ScrollReveal";
import { Search } from "lucide-react";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(props: PageProps<"/search">): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const query = String(searchParams?.q || "");
  const siteName = await getSiteName();
  return { title: query ? `${siteName} | Recherche: ${query}` : `${siteName} | Recherche` };
}

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const query = String(searchParams?.q || "");

  const products = query.trim()
    ? await prisma.product.findMany({
        where: {
          isVisible: true,
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
            { shortDescription: { contains: query } },
          ],
        },
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
          variations: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <ScrollReveal>
        <h1 className="text-3xl font-bold mb-6">Recherche</h1>
        <SearchBar defaultValue={query} placeholder="Rechercher un produit..." className="max-w-xl mb-8" />
      </ScrollReveal>

      {query.trim() && (
        <ScrollReveal>
          <p className="text-muted-foreground mb-6">
            {products.length} resultat{products.length !== 1 ? "s" : ""} pour &ldquo;{query}&rdquo;
          </p>
        </ScrollReveal>
      )}

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <ScrollReveal key={product.id} delay={Math.min(i * 50, 300)}>
              <ProductCard product={product} />
            </ScrollReveal>
          ))}
        </div>
      ) : query.trim() ? (
        <ScrollReveal>
          <div className="text-center py-20 text-muted-foreground">
            <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Aucun produit trouve</p>
            <p className="text-sm mt-1">Essayez avec d&apos;autres mots-cles</p>
          </div>
        </ScrollReveal>
      ) : (
        <ScrollReveal>
          <div className="text-center py-20 text-muted-foreground">
            <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Entrez un terme de recherche</p>
            <p className="text-sm mt-1">Pour trouver des produits dans notre catalogue</p>
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
