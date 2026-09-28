import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/ProductCard";
import { ScrollReveal } from "@/components/store/ScrollReveal";
import { serialize } from "@/lib/utils";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import Link from "next/link";
import { Package } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Produits` };
}

export default async function ProductsPage(props: PageProps<"/products">) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(String(searchParams?.page || "1"), 10));
  const limit = DEFAULT_PAGE_SIZE;
  const category = String(searchParams?.category || "");
  const search = String(searchParams?.search || "");
  const sort = String(searchParams?.sort || "newest");
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = { isVisible: true };
  if (category) where.category = { slug: category };
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { shortDescription: { contains: search } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput;
  switch (sort) {
    case "price-asc": orderBy = { price: "asc" }; break;
    case "price-desc": orderBy = { price: "desc" }; break;
    case "popular": orderBy = { requests: { _count: "desc" } }; break;
    default: orderBy = { createdAt: "desc" };
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where, orderBy, skip, take: limit,
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variations: true,
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: { where: { isVisible: true } } } } },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const sortOptions = [
    { value: "newest", label: "Plus recents" },
    { value: "price-asc", label: "Prix croissant" },
    { value: "price-desc", label: "Prix decroissant" },
    { value: "popular", label: "Populaires" },
  ];

  function buildUrl(params: Record<string, string>) {
    const sp = new URLSearchParams();
    if (params.category) sp.set("category", params.category);
    if (params.search) sp.set("search", params.search);
    if (params.sort && params.sort !== "newest") sp.set("sort", params.sort);
    if (params.page && params.page !== "1") sp.set("page", params.page);
    return `/products?${sp.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <ScrollReveal>
        <h1 className="text-3xl font-bold mb-2">Produits</h1>
        <p className="text-muted-foreground mb-8">
          {total} produit{total !== 1 ? "s" : ""} disponible{total !== 1 ? "s" : ""}
        </p>
      </ScrollReveal>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 flex-shrink-0">
          <ScrollReveal direction="left">
            <div className="rounded-2xl border bg-card p-5 mb-4">
              <h3 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Categories</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    href={buildUrl({ category: "", search, sort, page: "1" })}
                    className={`block px-3 py-2 rounded-xl text-sm transition-all ${!category ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                  >
                    Toutes ({total})
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={buildUrl({ category: cat.slug, search, sort, page: "1" })}
                      className={`block px-3 py-2 rounded-xl text-sm transition-all ${category === cat.slug ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                    >
                      {cat.name} ({cat._count.products})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <h3 className="font-semibold mb-3 text-xs uppercase tracking-wider text-muted-foreground">Trier par</h3>
              <ul className="space-y-1">
                {sortOptions.map((opt) => (
                  <li key={opt.value}>
                    <Link
                      href={buildUrl({ category, search, sort: opt.value, page: "1" })}
                      className={`block px-3 py-2 rounded-xl text-sm transition-all ${sort === opt.value ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                    >
                      {opt.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </aside>

        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <ScrollReveal>
              <div className="text-center py-20 text-muted-foreground">
                <Package className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Aucun produit trouve</p>
                <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
                <Link href="/products" className="mt-6 inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium">
                  Voir tous les produits
                </Link>
              </div>
            </ScrollReveal>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {serialize(products).map((product, i) => (
                  <ScrollReveal key={product.id} delay={Math.min(i * 50, 300)}>
                    <ProductCard product={product} />
                  </ScrollReveal>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {page > 1 && (
                    <Link
                      href={buildUrl({ category, search, sort, page: String(page - 1) })}
                      className="px-4 py-2 rounded-xl border text-sm hover:bg-muted transition-colors"
                    >
                      Precedent
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .reduce<(number | "...")[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === "..." ? (
                        <span key={`dots-${i}`} className="px-2 text-muted-foreground">...</span>
                      ) : (
                        <Link
                          key={p}
                          href={buildUrl({ category, search, sort, page: String(p) })}
                          className={`px-4 py-2 rounded-xl text-sm transition-all ${p === page ? "bg-primary text-primary-foreground font-medium" : "border hover:bg-muted"}`}
                        >
                          {p}
                        </Link>
                      )
                    )}
                  {page < totalPages && (
                    <Link
                      href={buildUrl({ category, search, sort, page: String(page + 1) })}
                      className="px-4 py-2 rounded-xl border text-sm hover:bg-muted transition-colors"
                    >
                      Suivant
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
