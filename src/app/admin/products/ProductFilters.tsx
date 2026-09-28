"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface ProductFiltersProps {
  categories: { id: number; name: string; slug: string }[];
  currentCategory: string;
  currentStatus: string;
  currentSearch: string;
}

export function ProductFilters({
  categories,
  currentCategory,
  currentStatus,
  currentSearch,
}: ProductFiltersProps) {
  const router = useRouter();

  const handleChange = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams();
      if (currentSearch) params.set("search", currentSearch);
      if (key === "category" ? value : currentCategory) params.set("category", key === "category" ? value : currentCategory);
      if (key === "status" ? value : currentStatus) params.set("status", key === "status" ? value : currentStatus);
      router.push(`/admin/products?${params.toString()}`);
    },
    [router, currentSearch, currentCategory, currentStatus]
  );

  return (
    <div className="flex gap-3">
      <select
        name="category"
        value={currentCategory}
        onChange={(e) => handleChange("category", e.target.value)}
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <select
        name="status"
        value={currentStatus}
        onChange={(e) => handleChange("status", e.target.value)}
        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="hidden">Hidden</option>
      </select>
    </div>
  );
}
