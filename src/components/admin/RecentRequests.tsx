"use client";

import { prisma } from "@/lib/prisma";
import { useEffect, useState } from "react";

interface RequestRow {
  id: number;
  status: string;
  submittedAt: string;
  customer: { firstName: string; lastName: string | null };
  product: { name: string };
}

export function RecentRequests() {
  const [requests, setRequests] = useState<RequestRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/recent-requests")
      .then((r) => r.json())
      .then(setRequests)
      .catch(() => {});
  }, []);

  if (requests.length === 0) {
    return <p className="text-sm text-muted-foreground py-4 text-center">No recent requests</p>;
  }

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <div
          key={req.id}
          className="flex items-center justify-between rounded-md border px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {req.customer.firstName} {req.customer.lastName ?? ""}
            </p>
            <p className="text-xs text-muted-foreground truncate">{req.product.name}</p>
          </div>
          <div className="flex items-center gap-3 ml-4 shrink-0">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                req.status === "New"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : req.status === "Confirmed"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {req.status}
            </span>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(req.submittedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
