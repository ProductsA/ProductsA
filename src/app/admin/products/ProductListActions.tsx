"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";
import {
  deleteProduct,
  toggleProductVisibility,
  toggleProductFeatured,
  toggleProductStatus,
} from "./actions";
import { Edit, Trash2, Eye, EyeOff, Star, StarOff, ToggleLeft, ToggleRight } from "lucide-react";

interface Product {
  id: number;
  name: string;
  status: boolean;
  featured: boolean;
  isVisible: boolean;
}

export function ProductListActions({ product, mobile }: { product: Product; mobile?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const result = await deleteProduct(product.id);
    if (result.success) {
      toast("Product deleted successfully", "success");
      setDeleteOpen(false);
      router.refresh();
    } else {
      toast(result.error || "Failed to delete product", "error");
    }
    setDeleting(false);
  };

  const handleToggleVisibility = async () => {
    const result = await toggleProductVisibility(product.id);
    if (result.success) {
      toast(product.isVisible ? "Product hidden" : "Product visible", "success");
      router.refresh();
    } else {
      toast(result.error || "Failed to update product", "error");
    }
  };

  const handleToggleFeatured = async () => {
    const result = await toggleProductFeatured(product.id);
    if (result.success) {
      toast(product.featured ? "Removed from featured" : "Marked as featured", "success");
      router.refresh();
    } else {
      toast(result.error || "Failed to update product", "error");
    }
  };

  const handleToggleStatus = async () => {
    const result = await toggleProductStatus(product.id);
    if (result.success) {
      toast(product.status ? "Product set to unavailable" : "Product set to available", "success");
      router.refresh();
    } else {
      toast(result.error || "Failed to update product", "error");
    }
  };

  if (mobile) {
    return (
      <>
        <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            <Edit className="h-4 w-4" /> Edit
          </Button>
        </Link>
        <Button variant="outline" size="sm" onClick={handleToggleVisibility}>
          {product.isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={handleToggleStatus}>
          {product.status ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
        <ConfirmDialog
          open={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          onConfirm={handleDelete}
          title="Delete product?"
          description={`Are you sure you want to delete "${product.name}"? This cannot be undone.`}
          loading={deleting}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleVisibility}
          title={product.isVisible ? "Hide product" : "Show product"}
        >
          {product.isVisible ? (
            <Eye className="h-4 w-4 text-muted-foreground" />
          ) : (
            <EyeOff className="h-4 w-4 text-destructive" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleFeatured}
          title={product.featured ? "Remove from featured" : "Mark as featured"}
        >
          {product.featured ? (
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400" />
          ) : (
            <StarOff className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleStatus}
          title={product.status ? "Set unavailable" : "Set available"}
        >
          {product.status ? (
            <ToggleRight className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
        <Link href={`/admin/products/${product.id}/edit`}>
          <Button variant="ghost" size="icon" title="Edit product">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setDeleteOpen(true)} title="Delete product">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete product?"
        description={`Are you sure you want to delete "${product.name}"? This cannot be undone.`}
        loading={deleting}
      />
    </>
  );
}
