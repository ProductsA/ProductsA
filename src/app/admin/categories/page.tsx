"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { slugify } from "@/lib/utils";
import { Plus, Pencil, Trash2, FolderTree, X, Image as ImageIcon } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  _count: { products: number };
}

export default function CategoriesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSlugEdited, setFormSlugEdited] = useState(false);
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/categories");
        const data = await res.json();
        if (mountedRef.current) setCategories(data);
      } catch {
        if (mountedRef.current) toast("Failed to load categories", "error");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }
    load();
  }, [toast]);

  const allIds = categories.map((c) => c.id);
  const allSelected = allIds.length > 0 && allIds.every((id) => selected.has(id));
  const someSelected = selected.size > 0 && !allSelected;

  function toggleSelectAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(allIds));
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
    setBulkDeleting(true);
    try {
      const ids = Array.from(selected);
      const res = await fetch("/api/admin/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to delete categories", "error");
      } else {
        toast(`${data.deleted} categor${data.deleted !== 1 ? "ies" : "y"} deleted`, "success");
        setSelected(new Set());
        setBulkDeleteOpen(false);
        const refreshed = await fetch("/api/admin/categories");
        setCategories(await refreshed.json());
      }
    } catch {
      toast("An error occurred", "error");
    }
    setBulkDeleting(false);
  }

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormSlugEdited(false);
    setFormDescription("");
    setFormImage(null);
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormSlugEdited(true);
    setFormDescription(cat.description ?? "");
    setFormImage(cat.image);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleFormNameChange = (val: string) => {
    setFormName(val);
    if (!formSlugEdited) setFormSlug(slugify(val));
  };

  const handleFormSlugChange = (val: string) => {
    setFormSlugEdited(true);
    setFormSlug(slugify(val));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) setFormImage(data.url);
      else toast(data.error || "Upload failed", "error");
    } catch {
      toast("Upload failed", "error");
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formName.trim()) errs.name = "Name is required";
    if (!formSlug.trim()) errs.slug = "Slug is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    const payload = {
      name: formName.trim(),
      slug: formSlug.trim(),
      description: formDescription.trim() || null,
      image: formImage,
    };
    try {
      let res: Response;
      if (editingCategory) {
        res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to save category", "error");
      } else {
        toast(editingCategory ? "Category updated" : "Category created", "success");
        setModalOpen(false);
        const refreshed = await fetch("/api/admin/categories");
        setCategories(await refreshed.json());
      }
    } catch {
      toast("An error occurred", "error");
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/categories/${deletingCategory.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to delete category", "error");
      } else {
        toast("Category deleted", "success");
        setDeleteOpen(false);
        setDeletingCategory(null);
        const refreshed = await fetch("/api/admin/categories");
        setCategories(await refreshed.json());
      }
    } catch {
      toast("An error occurred", "error");
    }
    setDeleting(false);
  };

  return (
    <div className="space-y-6">
      <PageTitle pageName="Gestion des Categories" />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Organize your products into categories</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

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

      {loading ? (
        <div className="rounded-lg border bg-background p-12 text-center">
          <p className="text-muted-foreground">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border bg-background p-12 text-center">
          <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No categories yet</p>
          <Button variant="outline" onClick={openCreateModal} className="mt-4">
            Create your first category
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-background overflow-hidden">
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
                <th className="text-left px-4 py-3 font-medium">Slug</th>
                <th className="text-left px-4 py-3 font-medium">Description</th>
                <th className="text-left px-4 py-3 font-medium">Products</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className={`border-b last:border-0 hover:bg-muted/30 ${selected.has(cat.id) ? "bg-primary/5" : ""}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(cat.id)}
                      onChange={() => toggleSelect(cat.id)}
                      className="h-4 w-4 rounded border-input"
                    />
                  </td>
                  <td className="px-4 py-3">
                    {cat.image ? (
                      <img src={cat.image} alt={cat.name} className="h-10 w-10 rounded object-cover border" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{cat.slug}</code>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{cat.description ?? "—"}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{cat._count.products}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => { setDeletingCategory(cat); setDeleteOpen(true); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="max-w-md">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "New Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Name *</label>
              <Input value={formName} onChange={(e) => handleFormNameChange(e.target.value)} placeholder="Category name" error={formErrors.name} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Slug *</label>
              <Input value={formSlug} onChange={(e) => handleFormSlugChange(e.target.value)} placeholder="category-slug" error={formErrors.slug} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Category description" rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Image</label>
              {formImage ? (
                <div className="relative inline-block">
                  <img src={formImage} alt="Preview" className="w-24 h-24 object-cover rounded-md border" />
                  <button type="button" onClick={() => setFormImage(null)} className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-background border flex items-center justify-center hover:bg-muted">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} className="hidden" />
                  <ImageIcon className="h-4 w-4" /> Upload image
                </label>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} loading={submitting}>{editingCategory ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeletingCategory(null); }}
        onConfirm={handleDelete}
        title="Delete category?"
        description={deletingCategory ? `Are you sure you want to delete "${deletingCategory.name}"?` : "This action cannot be undone."}
        loading={deleting}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title={`Delete ${selected.size} categor${selected.size !== 1 ? "ies" : "y"}?`}
        description="This action cannot be undone. All selected categories will be permanently removed."
        loading={bulkDeleting}
      />
    </div>
  );
}
