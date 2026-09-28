"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import { ProductListActions } from "./ProductListActions";
import { formatPrice } from "@/lib/utils";

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v) || 0;
  if (v && typeof v === "object" && "toString" in v) return parseFloat(String(v)) || 0;
  return 0;
}
import { Package, Trash2, X } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number | { toString(): string };
  discountPrice: number | { toString(): string } | null;
  status: boolean;
  featured: boolean;
  isVisible: boolean;
  mainImage: string | null;
  category: { name: string };
  _count: { requests: number };
}

export function ProductTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const allIds = products.map((p) => p.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0 && !allSelected;

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(allIds));
    }
  }

  function toggleSelect(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleBulkDelete() {
    setDeleting(true);
    try {
      const ids = Array.from(selected);
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to delete products", "error");
      } else {
        toast(`${data.deleted} product${data.deleted !== 1 ? "s" : ""} deleted`, "success");
        setSelected(new Set());
        setBulkDeleteOpen(false);
        router.refresh();
      }
    } catch {
      toast("An error occurred", "error");
    }
    setDeleting(false);
  }

  return (
    <>
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border bg-primary/5 p-3 animate-slide-down">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>
            <X className="h-3 w-3" /> Clear
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setBulkDeleteOpen(true)}>
            <Trash2 className="h-3 w-3" /> Delete Selected
          </Button>
        </div>
      )}

      <div className="hidden md:block rounded-lg border bg-background overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-input"
                />
              </th>
              <th className="text-left px-4 py-3 font-medium">Image</th>
              <th className="text-left px-4 py-3 font-medium">Name</th>
              <th className="text-left px-4 py-3 font-medium">Category</th>
              <th className="text-left px-4 py-3 font-medium">Price</th>
              <th className="text-left px-4 py-3 font-medium">Discount</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Featured</th>
              <th className="text-left px-4 py-3 font-medium">Requests</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={`border-b last:border-0 hover:bg-muted/30 ${selected.has(product.id) ? "bg-primary/5" : ""}`}>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="h-4 w-4 rounded border-input"
                  />
                </td>
                <td className="px-4 py-3">
                  {product.mainImage ? (
                    <img src={product.mainImage} alt={product.name} className="h-10 w-10 rounded object-cover border" />
                  ) : (
                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-medium max-w-[200px] truncate">
                  <Link href={`/admin/products/${product.id}/edit`} className="hover:text-primary transition-colors">{product.name}</Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground"><Badge variant="secondary">{product.category.name}</Badge></td>
                <td className="px-4 py-3 font-medium">{formatPrice(toNum(product.price))}</td>
                <td className="px-4 py-3">
                  {product.discountPrice ? <span className="text-green-600 dark:text-green-400 font-medium">{formatPrice(toNum(product.discountPrice))}</span> : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3"><Badge variant={product.status ? "success" : "secondary"}>{product.status ? "Active" : "Unavailable"}</Badge></td>
                <td className="px-4 py-3">{product.featured ? <Badge variant="default">Featured</Badge> : <span className="text-muted-foreground">—</span>}</td>
                <td className="px-4 py-3 text-muted-foreground">{product._count.requests}</td>
                <td className="px-4 py-3 text-right"><ProductListActions product={product} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        <div className="flex items-center gap-2 px-1 pb-1">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => { if (el) el.indeterminate = someSelected; }}
            onChange={toggleSelectAll}
            className="h-4 w-4 rounded border-input"
          />
          <span className="text-xs text-muted-foreground">Select all</span>
        </div>
        {products.map((product) => (
          <div key={product.id} className={`rounded-lg border bg-background p-4 space-y-3 ${selected.has(product.id) ? "border-primary/50 bg-primary/5" : ""}`}>
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(product.id)}
                onChange={() => toggleSelect(product.id)}
                className="h-4 w-4 mt-1 rounded border-input shrink-0"
              />
              {product.mainImage ? (
                <img src={product.mainImage} alt={product.name} className="h-16 w-16 rounded object-cover border shrink-0" />
              ) : (
                <div className="h-16 w-16 rounded bg-muted flex items-center justify-center shrink-0">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <Link href={`/admin/products/${product.id}/edit`} className="font-medium hover:text-primary transition-colors block truncate">{product.name}</Link>
                <p className="text-sm text-muted-foreground truncate">{product.category.name}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="font-semibold">{formatPrice(toNum(product.price))}</span>
                  {product.discountPrice && <span className="text-sm text-green-600 dark:text-green-400 line-through">{formatPrice(toNum(product.discountPrice))}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={product.status ? "success" : "secondary"}>{product.status ? "Active" : "Unavailable"}</Badge>
              {!product.isVisible && <Badge variant="outline">Hidden</Badge>}
              {product.featured && <Badge>Featured</Badge>}
              <span className="text-xs text-muted-foreground ml-auto">{product._count.requests} requests</span>
            </div>
            <div className="flex gap-2">
              <ProductListActions product={product} mobile />
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} product${selected.size !== 1 ? "s" : ""}?`}
        description="This action cannot be undone. All selected products and their data will be permanently removed."
        loading={deleting}
      />
    </>
  );
}
