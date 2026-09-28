import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice, serialize } from "@/lib/utils";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductCard } from "@/components/store/ProductCard";
import { ScrollReveal } from "@/components/store/ScrollReveal";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const siteName = await getSiteName();
  const product = await prisma.product.findFirst({
    where: { slug, isVisible: true },
    include: { category: true },
  });

  if (!product) {
    return { title: `${siteName} | Produit Non Trouve` };
  }

  const title = product.seoTitle || `${siteName} | ${product.name}`;
  const description =
    product.seoDescription || product.shortDescription || product.description?.slice(0, 160) || "";
  const imageUrl = product.mainImage
    ? `${BASE_URL}${product.mainImage.startsWith("/") ? "" : "/"}${product.mainImage}`
    : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `${BASE_URL}/products/${product.slug}`,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductDetailPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;

  const [product, siteName] = await Promise.all([
    prisma.product.findFirst({
      where: { slug, isVisible: true },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variations: true,
        _count: { select: { requests: true } },
      },
    }),
    getSiteName(),
  ]);

  if (!product) notFound();

  const price = parseFloat(String(product.price));
  const discountPrice = product.discountPrice ? parseFloat(String(product.discountPrice)) : null;
  const hasDiscount = discountPrice !== null && discountPrice < price;

  let specifications: Record<string, string> = {};
  try {
    specifications = JSON.parse(product.specifications);
  } catch {}

  const relatedProducts = await prisma.product.findMany({
    where: {
      isVisible: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      variations: true,
    },
  });

  const productUrl = `${BASE_URL}/products/${product.slug}`;
  const imageUrl = product.mainImage
    ? `${BASE_URL}${product.mainImage.startsWith("/") ? "" : "/"}${product.mainImage}`
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.shortDescription || "",
    url: productUrl,
    image: imageUrl ? [imageUrl] : undefined,
    brand: {
      "@type": "Brand",
      name: siteName,
    },
    category: product.category.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "MAD",
      price: hasDiscount ? discountPrice : price,
      availability: product.status
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: productUrl,
    },
    aggregateRating: product._count.requests > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: "4.5",
          reviewCount: product._count.requests,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-8 flex-wrap">
          <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="hover:text-foreground transition-colors">Produits</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground transition-colors">
            {product.category.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          <ScrollReveal direction="left">
            <ProductGallery
              images={product.images}
              mainImage={product.mainImage}
              alt={product.name}
            />
          </ScrollReveal>

          <ScrollReveal direction="right">
            <div>
              <Badge variant="secondary" className="mb-3 rounded-full text-xs">{product.category.name}</Badge>
              <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>

              <div className="mt-5 flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {formatPrice(hasDiscount ? discountPrice! : price)}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(price)}
                  </span>
                )}
              </div>

              <Badge variant={product.status ? "success" : "secondary"} className="mt-4 rounded-full text-xs">
                {product.status ? "Disponible" : "Indisponible"}
              </Badge>

              {product.shortDescription && (
                <p className="mt-5 text-muted-foreground leading-relaxed">{product.shortDescription}</p>
              )}

              {product.description && (
                <div className="mt-6">
                  <h2 className="font-semibold text-lg mb-3">Description</h2>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {product.description}
                  </div>
                </div>
              )}

              {product.variations.length > 0 && (
                <div className="mt-6">
                  <h2 className="font-semibold text-lg mb-3">Variations</h2>
                  <div className="flex flex-wrap gap-2">
                    {product.variations.map((v) => (
                      <Badge key={v.id} variant="outline" className="rounded-full">
                        {v.variationName}: {v.variationValue}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {Object.keys(specifications).length > 0 && (
                <div className="mt-6">
                  <h2 className="font-semibold text-lg mb-3">Specifications</h2>
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {Object.entries(specifications).map(([key, val]) => (
                      <div key={key} className="contents">
                        <dt className="font-medium text-muted-foreground">{key}</dt>
                        <dd>{val}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}

              <div className="mt-8">
                <Link
                  href={`/order/${product.id}`}
                  className={`inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-8 py-3.5 text-sm font-medium hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] ${!product.status ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <ShoppingBag className="h-4 w-4" />
                  Commander maintenant
                </Link>
              </div>

              {product._count.requests > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {product._count.requests} demande{product._count.requests !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </ScrollReveal>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <ScrollReveal>
              <h2 className="text-2xl font-bold mb-8">Produits associes</h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {serialize(relatedProducts).map((p, i) => (
                <ScrollReveal key={p.id} delay={i * 100}>
                  <ProductCard product={p} />
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
