import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ProductFilters } from "./ProductFilters";
import { ProductTable } from "./ProductTable";
import { Plus, Search, Package } from "lucide-react";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Gestion des Produits` };
}

export default async function AdminProductsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const search = (searchParams as Record<string, string>).search ?? "";
  const category = (searchParams as Record<string, string>).category ?? "";
  const status = (searchParams as Record<string, string>).status ?? "";
  const page = Math.max(1, parseInt((searchParams as Record<string, string>).page ?? "1", 10));
  const limit = 10;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (category) {
    where.category = { slug: category };
  }

  if (status === "active") {
    where.status = true;
  } else if (status === "hidden") {
    where.isVisible = false;
  }

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        category: true,
        _count: { select: { requests: true } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const serializedProducts = serialize(products);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form className="flex-1 relative" method="get">
          <input type="hidden" name="category" value={category} />
          <input type="hidden" name="status" value={status} />
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search products..."
            className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </form>
        <ProductFilters
          categories={categories}
          currentCategory={category}
          currentStatus={status}
          currentSearch={search}
        />
      </div>

      <p className="text-sm text-muted-foreground">{total} product{total !== 1 ? "s" : ""} found</p>

      {serializedProducts.length === 0 ? (
        <div className="rounded-lg border bg-background p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No products found</p>
          <Link href="/admin/products/new" className="mt-4 inline-block">
            <Button variant="outline">Create your first product</Button>
          </Link>
        </div>
      ) : (
        <>
          <ProductTable products={serializedProducts} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/admin/products?search=${search}&category=${category}&status=${status}&page=${p}`}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary text-foreground"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
