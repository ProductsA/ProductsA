import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRODUCT_STATUSES } from "@/lib/constants";
import { FileSpreadsheet, Download } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName();
  return { title: `${siteName} | Clients` };
}

export default async function CustomerListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const search = typeof sp.search === "string" ? sp.search : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const product = typeof sp.product === "string" ? sp.product : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "date-desc";
  const page = parseInt(typeof sp.page === "string" ? sp.page : "1", 10);
  const pageSize = 20;

  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { requestId: { contains: search } },
      { customer: { firstName: { contains: search } } },
      { customer: { lastName: { contains: search } } },
      { customer: { email: { contains: search } } },
      { customer: { phone: { contains: search } } },
      { product: { name: { contains: search } } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (product) {
    where.product = { name: { contains: product } };
  }

  let orderBy: Record<string, string> = {};
  switch (sort) {
    case "date-asc":
      orderBy = { submittedAt: "asc" };
      break;
    case "name-asc":
      orderBy = { submittedAt: "asc" };
      break;
    case "name-desc":
      orderBy = { submittedAt: "desc" };
      break;
    case "status-asc":
      orderBy = { status: "asc" };
      break;
    case "status-desc":
      orderBy = { status: "desc" };
      break;
    default:
      orderBy = { submittedAt: "desc" };
  }

  const [requests, total, products] = await Promise.all([
    prisma.customerRequest.findMany({
      where,
      include: {
        customer: true,
        product: { include: { images: { take: 1 } } },
      },
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customerRequest.count({ where }),
    prisma.product.findMany({
      select: { name: true },
      distinct: ["name"],
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  function statusBadge(status: string) {
    switch (status) {
      case "New":
        return <Badge variant="default">{status}</Badge>;
      case "Contacted":
        return <Badge variant="secondary">{status}</Badge>;
      case "Confirmed":
        return <Badge variant="success">{status}</Badge>;
      case "Completed":
        return <Badge variant="success">{status}</Badge>;
      case "Cancelled":
        return <Badge variant="warning">{status}</Badge>;
      case "Rejected":
        return <Badge variant="destructive">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }

  function syncBadge(syncStatus: string) {
    switch (syncStatus) {
      case "synced":
        return <Badge variant="success" className="text-[10px]">Synced</Badge>;
      case "pending":
        return <Badge variant="warning" className="text-[10px]">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive" className="text-[10px]">Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Pending</Badge>;
    }
  }

  function buildUrl(params: Record<string, string>) {
    const urlSp = new URLSearchParams();
    if (search) urlSp.set("search", search);
    if (status) urlSp.set("status", status);
    if (product) urlSp.set("product", product);
    if (sort !== "date-desc") urlSp.set("sort", sort);
    Object.entries(params).forEach(([k, v]) => urlSp.set(k, v));
    return `/admin/customers?${urlSp.toString()}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers & Leads</h1>
          <p className="text-muted-foreground">Manage customer requests and leads</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/customers/sheet">
            <Button variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4" />
              Spreadsheet View
            </Button>
          </Link>
          <a href="/api/admin/export">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </a>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap gap-3">
            <input
              type="text"
              name="search"
              placeholder="Search name, email, phone, product..."
              defaultValue={search}
              className="flex h-9 rounded-md border border-input bg-background px-3 text-sm w-64 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <select
              name="status"
              defaultValue={status}
              className="flex h-9 appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Statuses</option>
              {PRODUCT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              name="product"
              defaultValue={product}
              className="flex h-9 appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sort}
              className="flex h-9 appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="status-asc">Status A-Z</option>
              <option value="status-desc">Status Z-A</option>
            </select>
            <Button type="submit" size="sm">
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Request ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">ID</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Customer</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Phone</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Product</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Variation</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Sync</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Notes</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-12 text-muted-foreground">
                      No customer requests found
                    </td>
                  </tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/30">
                      <td className="px-3 py-3 font-mono text-xs">{r.requestId}</td>
                      <td className="px-3 py-3 font-mono text-xs">{r.id}</td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/admin/customers/${r.customerId}`}
                          className="font-medium hover:underline"
                        >
                          {r.customer.firstName} {r.customer.lastName ?? ""}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{r.customer.email ?? "-"}</td>
                      <td className="px-3 py-3 text-muted-foreground">{r.customer.phone ?? "-"}</td>
                      <td className="px-3 py-3">{r.product.name}</td>
                      <td className="px-3 py-3 text-muted-foreground">{r.variation ?? "-"}</td>
                      <td className="px-3 py-3">{statusBadge(r.status)}</td>
                      <td className="px-3 py-3">{syncBadge(r.syncStatus)}</td>
                      <td className="px-3 py-3 text-muted-foreground text-xs">
                        {new Date(r.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground text-xs max-w-[120px] truncate">
                        {r.notes ?? "-"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1">
                          <Link href={`/admin/customers/${r.customerId}`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <span className="sr-only">View</span>
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </Button>
                          </Link>
                          <Link href={`/admin/customers/${r.customerId}/edit`}>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <span className="sr-only">Edit</span>
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y">
            {requests.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No customer requests found
              </div>
            ) : (
              requests.map((r) => (
                <Link
                  key={r.id}
                  href={`/admin/customers/${r.customerId}`}
                  className="block p-4 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs text-muted-foreground">{r.requestId}</span>
                    <div className="flex items-center gap-2">
                      {syncBadge(r.syncStatus)}
                      {statusBadge(r.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">
                      {r.customer.firstName} {r.customer.lastName ?? ""}
                    </span>
                    {statusBadge(r.status)}
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{r.customer.email ?? ""} {r.customer.phone ? `| ${r.customer.phone}` : ""}</p>
                    <p>{r.product.name} {r.variation ? `- ${r.variation}` : ""}</p>
                    <p className="text-xs">{new Date(r.submittedAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildUrl({ page: String(p) })}
              className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium ${
                p === page
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary text-foreground"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
