"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: { imageUrl: string }[];
  mainImage?: string | null;
  alt: string;
}

export function ProductGallery({ images, mainImage, alt }: ProductGalleryProps) {
  const allImages = images.length > 0 ? images : mainImage ? [{ imageUrl: mainImage }] : [];
  const [selectedIndex, setSelectedIndex] = useState(0);

  const currentImage = allImages[selectedIndex];

  if (allImages.length === 0) {
    return (
      <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
        <svg className="w-20 h-20 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
        <Image
          src={currentImage.imageUrl}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          unoptimized={currentImage.imageUrl.startsWith("http")}
        />
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${
                i === selectedIndex ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
              }`}
            >
              <Image
                src={img.imageUrl}
                alt={`${alt} ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
                unoptimized={img.imageUrl.startsWith("http")}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
