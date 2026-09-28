"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils";
import { X, Image as ImageIcon } from "lucide-react";

interface CategoryFormProps {
  mode: "create" | "edit";
  initialData?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    image: string | null;
  };
}

export function CategoryForm({ mode, initialData }: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugEdited) setSlug(slugify(val));
  };

  const handleSlugChange = (val: string) => {
    setSlugEdited(true);
    setSlug(slugify(val));
  };

  const handleImageChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        setImagePreview(data.url);
      } else {
        toast(data.error || "Upload failed", "error");
      }
    } catch {
      toast("Upload failed", "error");
    }
  }, [toast]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Category name is required";
    if (!slug.trim()) errs.slug = "Slug is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      image: imagePreview,
    };

    try {
      let res: Response;
      if (mode === "create") {
        res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/categories/${initialData!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Failed to save category", "error");
        setSubmitting(false);
        return;
      }

      toast(mode === "create" ? "Category created successfully" : "Category updated successfully", "success");
      router.push("/admin/categories");
      router.refresh();
    } catch {
      toast("An error occurred", "error");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="rounded-lg border bg-background p-6 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Category Name *</label>
          <Input
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter category name"
            error={errors.name}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Slug *</label>
          <Input
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="category-slug"
            error={errors.slug}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Category description"
            rows={3}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Category image"
                className="w-32 h-32 object-cover rounded-md border"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                }}
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-background border flex items-center justify-center hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <ImageIcon className="h-8 w-8" />
              <span className="text-sm">Click to upload image</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" loading={submitting}>
          {mode === "create" ? "Create Category" : "Update Category"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
