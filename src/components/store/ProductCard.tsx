import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    shortDescription?: string | null;
    price: number | string | { toString(): string };
    discountPrice?: number | string | { toString(): string } | null;
    mainImage?: string | null;
    status: boolean;
    images?: { imageUrl: string }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const price = parseFloat(String(product.price));
  const discountPrice = product.discountPrice ? parseFloat(String(product.discountPrice)) : null;
  const imageUrl = product.images?.[0]?.imageUrl || product.mainImage || null;
  const hasDiscount = discountPrice !== null && discountPrice < price;

  return (
    <Link href={`/products/${product.slug}`} className="group block h-full">
      <div className="rounded-2xl border bg-card overflow-hidden card-hover h-full flex flex-col">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              unoptimized={imageUrl.startsWith("http")}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-3 left-3">
              <Badge variant="destructive" className="text-xs font-semibold px-2.5 py-0.5 rounded-full">
                -{Math.round(((price - discountPrice!) / price) * 100)}%
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {product.shortDescription}
            </p>
          )}
          <div className="mt-auto pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-lg">{formatPrice(hasDiscount ? discountPrice! : price)}</span>
                {hasDiscount && (
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(price)}
                  </span>
                )}
              </div>
              <Badge variant={product.status ? "success" : "secondary"} className="text-[10px] px-2 py-0.5">
                {product.status ? "Disponible" : "Indisponible"}
              </Badge>
            </div>
            <div className="mt-3">
              <span className="inline-flex items-center justify-center w-full rounded-xl bg-primary text-primary-foreground text-xs font-medium py-2.5 group-hover:bg-primary/90 group-hover:shadow-md group-hover:shadow-primary/20 transition-all duration-200">
                Commander
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
