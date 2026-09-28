import { prisma } from "@/lib/prisma";
import { SpreadsheetView } from "@/components/admin/SpreadsheetView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Vue Tableur` };
}

export default async function CustomerSheetPage() {
  const requests = await prisma.customerRequest.findMany({
    include: {
      customer: true,
      product: true,
    },
    orderBy: { submittedAt: "desc" },
  });

  const rows = requests.map((r) => ({
    id: r.id,
    cells: {
      requestId: r.requestId,
      id: String(r.id),
      firstName: r.customer.firstName,
      lastName: r.customer.lastName ?? "",
      email: r.customer.email ?? "",
      phone: r.customer.phone ?? "",
      product: r.product.name,
      variation: r.variation ?? "",
      status: r.status,
      syncStatus: r.syncStatus,
      date: new Date(r.submittedAt).toLocaleDateString(),
      notes: r.notes ?? "",
    },
  }));

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/admin/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Sheet</h1>
          <p className="text-muted-foreground text-sm">
            Spreadsheet view — click cells to edit, drag columns to resize
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <SpreadsheetView initialRows={rows} />
      </div>
    </div>
  );
}
