"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { slugify } from "@/lib/utils";
import {
  Plus,
  Trash2,

  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
}

interface ExistingImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

interface ProductFormProps {
  mode: "create" | "edit";
  categories: Category[];
  initialData?: {
    id: number;
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    discountPrice: number | null;
    categoryId: number;
    videoUrl: string;
    mainImage: string | null;
    status: boolean;
    featured: boolean;
    isVisible: boolean;
    seoTitle: string;
    seoDescription: string;
    specifications: Record<string, string>;
    images: ExistingImage[];
    variations: { id?: number; variationName: string; variationValue: string }[];
  };
}

interface ImagePreview {
  file?: File;
  url: string;
  existingId?: number;
  uploading?: boolean;
}

export function ProductForm({ mode, categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainImageInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription ?? "");
  const [price, setPrice] = useState(initialData?.price?.toString() ?? "");
  const [discountPrice, setDiscountPrice] = useState(initialData?.discountPrice?.toString() ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId?.toString() ?? "");
  const [videoUrl, setVideoUrl] = useState(initialData?.videoUrl ?? "");
  const [status, setStatus] = useState(initialData?.status ?? true);
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? true);
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription ?? "");

  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(() => {
    if (!initialData?.specifications) return [{ key: "", value: "" }];
    const entries = Object.entries(initialData.specifications);
    return entries.length > 0 ? entries.map(([k, v]) => ({ key: k, value: v })) : [{ key: "", value: "" }];
  });

  const [variations, setVariations] = useState<{ id?: number; name: string; value: string }[]>(() => {
    if (!initialData?.variations || initialData.variations.length === 0) {
      return [{ name: "", value: "" }];
    }
    return initialData.variations.map((v) => ({
      id: v.id,
      name: v.variationName,
      value: v.variationValue,
    }));
  });

  const [mainImagePreview, setMainImagePreview] = useState<ImagePreview | null>(
    initialData?.mainImage ? { url: initialData.mainImage } : null
  );

  const [galleryImages, setGalleryImages] = useState<ImagePreview[]>(
    initialData?.images
      ? initialData.images.map((img) => ({ url: img.imageUrl, existingId: img.id }))
      : []
  );

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

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };
  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    const updated = [...specs];
    updated[index][field] = val;
    setSpecs(updated);
  };

  const addVariation = () => setVariations([...variations, { name: "", value: "" }]);
  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };
  const updateVariation = (index: number, field: "name" | "value", val: string) => {
    const updated = [...variations];
    updated[index][field] = val;
    setVariations(updated);
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) return data.url;
      toast(data.error || "Upload failed", "error");
      return null;
    } catch {
      toast("Upload failed", "error");
      return null;
    }
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setMainImagePreview({ file, url, uploading: true });
    const uploadedUrl = await uploadFile(file);
    if (uploadedUrl) {
      setMainImagePreview({ url: uploadedUrl, uploading: false });
    } else {
      setMainImagePreview(null);
    }
  };

  const handleGalleryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPreviews: ImagePreview[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      newPreviews.push({ file, url, uploading: true });
    }

    setGalleryImages((prev) => [...prev, ...newPreviews]);

    for (let i = 0; i < newPreviews.length; i++) {
      const preview = newPreviews[i];
      if (!preview.file) continue;
      const uploadedUrl = await uploadFile(preview.file);
      if (uploadedUrl) {
        setGalleryImages((prev) =>
          prev.map((img) => (img.url === preview.url ? { url: uploadedUrl, uploading: false } : img))
        );
      } else {
        setGalleryImages((prev) => prev.filter((img) => img !== preview));
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Product name is required";
    if (!slug.trim()) errs.slug = "Slug is required";
    if (!price || isNaN(Number(price)) || Number(price) < 0) errs.price = "Valid price is required";
    if (!categoryId) errs.categoryId = "Category is required";
    if (discountPrice && isNaN(Number(discountPrice))) errs.discountPrice = "Invalid discount price";
    if (discountPrice && Number(discountPrice) >= Number(price)) errs.discountPrice = "Discount must be less than price";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    const specifications: Record<string, string> = {};
    for (const spec of specs) {
      if (spec.key.trim()) {
        specifications[spec.key.trim()] = spec.value;
      }
    }

    const productVariations = variations
      .filter((v) => v.name.trim())
      .map((v) => ({ variationName: v.name, variationValue: v.value }));

    const imageData = galleryImages
      .filter((img) => !img.uploading)
      .map((img, index) => ({
        imageUrl: img.url,
        sortOrder: index,
        ...(img.existingId ? { id: img.existingId } : {}),
      }));

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      shortDescription: shortDescription.trim() || null,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : null,
      categoryId: Number(categoryId),
      videoUrl: videoUrl.trim() || null,
      mainImage: mainImagePreview?.uploading ? null : (mainImagePreview?.url ?? null),
      status,
      featured,
      isVisible,
      seoTitle: seoTitle.trim() || null,
      seoDescription: seoDescription.trim() || null,
      specifications: JSON.stringify(specifications),
      variations: productVariations,
      images: imageData,
    };

    try {
      let res: Response;
      if (mode === "create") {
        res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/admin/products/${initialData!.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        toast(data.error || "Failed to save product", "error");
        setSubmitting(false);
        return;
      }

      toast(mode === "create" ? "Product created successfully" : "Product updated successfully", "success");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast("An error occurred", "error");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border bg-background p-6 space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>

            <div>
              <label className="text-sm font-medium mb-1 block">Product Name *</label>
              <Input
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter product name"
                error={errors.name}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Slug *</label>
              <Input
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="product-slug"
                error={errors.slug}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Short Description</label>
              <Input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief description for product cards"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Full product description"
                rows={6}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-background p-6 space-y-4">
            <h2 className="text-lg font-semibold">Pricing & Category</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Price (MAD) *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  error={errors.price}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Discount Price (MAD)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  placeholder="0.00"
                  error={errors.discountPrice}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Category *</label>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                placeholder="Select a category"
                error={errors.categoryId}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Video URL</label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          </div>

          <div className="rounded-lg border bg-background p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Specifications</h2>
              <Button type="button" variant="outline" size="sm" onClick={addSpec}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            {specs.map((spec, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    value={spec.key}
                    onChange={(e) => updateSpec(i, "key", e.target.value)}
                    placeholder="Key (e.g. Color)"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={spec.value}
                    onChange={(e) => updateSpec(i, "value", e.target.value)}
                    placeholder="Value (e.g. Red)"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSpec(i)}
                  disabled={specs.length === 1}
                  className="mt-0.5"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="rounded-lg border bg-background p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Variations</h2>
              <Button type="button" variant="outline" size="sm" onClick={addVariation}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            {variations.map((v, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    value={v.name}
                    onChange={(e) => updateVariation(i, "name", e.target.value)}
                    placeholder="Name (e.g. Size)"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={v.value}
                    onChange={(e) => updateVariation(i, "value", e.target.value)}
                    placeholder="Value (e.g. XL)"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeVariation(i)}
                  disabled={variations.length === 1}
                  className="mt-0.5"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          <div className="rounded-lg border bg-background p-6 space-y-4">
            <h2 className="text-lg font-semibold">SEO</h2>
            <div>
              <label className="text-sm font-medium mb-1 block">SEO Title</label>
              <Input
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="SEO title for search engines"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">SEO Description</label>
              <Textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="SEO meta description"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border bg-background p-6 space-y-4">
            <h2 className="text-lg font-semibold">Status</h2>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={status}
                onChange={(e) => setStatus(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">Available (in stock)</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">Featured product</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <span className="text-sm">Visible on store</span>
            </label>
          </div>

          <div className="rounded-lg border bg-background p-6 space-y-4">
            <h2 className="text-lg font-semibold">Main Image</h2>
            <input
              ref={mainImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleMainImageChange}
              className="hidden"
            />
            {mainImagePreview ? (
              <div className="relative">
                <img
                  src={mainImagePreview.url}
                  alt="Main image preview"
                  className="w-full h-48 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => setMainImagePreview(null)}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 border flex items-center justify-center hover:bg-background"
                >
                  <X className="h-3 w-3" />
                </button>
                {mainImagePreview.uploading && (
                  <div className="absolute inset-0 bg-background/60 rounded-md flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">Uploading...</span>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => mainImageInputRef.current?.click()}
                className="w-full h-48 rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                <ImageIcon className="h-8 w-8" />
                <span className="text-sm">Click to upload main image</span>
              </button>
            )}
          </div>

          <div className="rounded-lg border bg-background p-6 space-y-4">
            <h2 className="text-lg font-semibold">Gallery Images</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleGalleryChange}
              className="hidden"
            />
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {galleryImages.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={img.url}
                      alt={`Gallery ${i + 1}`}
                      className="w-full h-24 object-cover rounded-md border"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(i)}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-background/80 border flex items-center justify-center hover:bg-background opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {img.uploading && (
                      <div className="absolute inset-0 bg-background/60 rounded-md flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Uploading...</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-md border-2 border-dashed flex items-center justify-center gap-2 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Upload className="h-4 w-4" />
              Add images
            </button>
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              loading={submitting}
              className="flex-1"
            >
              {mode === "create" ? "Create Product" : "Update Product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
