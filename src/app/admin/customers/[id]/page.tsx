import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft, Clock, MessageSquareText, FileText } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getSiteName } from "@/lib/pageTitles";

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await props.params;
  const siteName = await getSiteName();
  const customer = await prisma.customer.findUnique({ where: { id: parseInt(id) }, select: { firstName: true, lastName: true } });
  if (!customer) return { title: `${siteName} | Client Non Trouve` };
  return { title: `${siteName} | Client: ${customer.firstName} ${customer.lastName ?? ""}` };
}

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

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customerId = parseInt(id, 10);

  if (isNaN(customerId)) notFound();

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      requests: {
        include: {
          product: {
            include: { images: true, variations: true },
          },
        },
        orderBy: { submittedAt: "desc" },
      },
      customValues: {
        include: { field: true },
      },
    },
  });

  if (!customer) notFound();

  const STATUS_TIMELINE: Record<string, number> = {
    New: 0,
    Contacted: 1,
    Confirmed: 2,
    Completed: 3,
    Cancelled: -1,
    Rejected: -1,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {customer.firstName} {customer.lastName ?? ""}
            </h1>
            <p className="text-muted-foreground text-sm">Customer ID: {customer.id}</p>
          </div>
        </div>
        <Link href={`/admin/customers/${customer.id}/edit`}>
          <Button size="sm">
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">First Name</dt>
                  <dd className="font-medium">{customer.firstName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last Name</dt>
                  <dd className="font-medium">{customer.lastName ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Email</dt>
                  <dd className="font-medium">{customer.email ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Phone</dt>
                  <dd className="font-medium">{customer.phone ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Gender</dt>
                  <dd className="font-medium">{customer.gender ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Country</dt>
                  <dd className="font-medium">{customer.country ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">City</dt>
                  <dd className="font-medium">{customer.city ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Region</dt>
                  <dd className="font-medium">{customer.region ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Postal Code</dt>
                  <dd className="font-medium">{customer.postalCode ?? "-"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Address</dt>
                  <dd className="font-medium">{customer.address ?? "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {customer.customValues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Custom Fields</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  {customer.customValues.map((cv) => (
                    <div key={cv.id}>
                      <dt className="text-muted-foreground">{cv.field.fieldName}</dt>
                      <dd className="font-medium">{cv.value || "-"}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          )}

          {customer.requests.map((req) => (
            <Card key={req.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Request #{req.id}
                  </CardTitle>
                  {statusBadge(req.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Product</dt>
                    <dd className="font-medium">{req.product.name}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Variation</dt>
                    <dd className="font-medium">{req.variation ?? "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Submitted</dt>
                    <dd className="font-medium">
                      {new Date(req.submittedAt).toLocaleDateString()} at{" "}
                      {new Date(req.submittedAt).toLocaleTimeString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Last Updated</dt>
                    <dd className="font-medium">
                      {new Date(req.updatedAt).toLocaleDateString()} at{" "}
                      {new Date(req.updatedAt).toLocaleTimeString()}
                    </dd>
                  </div>
                </div>

                {req.product.images.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Product Image</p>
                    <img
                      src={req.product.images[0].imageUrl}
                      alt={req.product.name}
                      className="h-32 w-32 object-cover rounded-md border"
                    />
                  </div>
                )}

                {req.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                      <MessageSquareText className="h-3.5 w-3.5" /> Notes
                    </p>
                    <p className="text-sm bg-muted/50 rounded-md p-3 whitespace-pre-wrap">{req.notes}</p>
                  </div>
                )}

                {req.adminComments && (
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                      <MessageSquareText className="h-3.5 w-3.5" /> Admin Comments
                    </p>
                    <p className="text-sm bg-primary/5 rounded-md p-3 whitespace-pre-wrap border border-primary/10">
                      {req.adminComments}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.requests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No requests yet</p>
              ) : (
                <div className="space-y-3">
                  {customer.requests.map((req) => {
                    const timelineSteps = ["New", "Contacted", "Confirmed", "Completed"];
                    const currentIdx = timelineSteps.indexOf(req.status);
                    const isNegative = STATUS_TIMELINE[req.status] === -1;

                    return (
                      <div key={req.id} className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">
                          Request #{req.id}
                        </p>
                        <div className="flex items-center gap-1">
                          {timelineSteps.map((step, i) => (
                            <div
                              key={step}
                              className={`h-2 flex-1 rounded-full ${
                                !isNegative && i <= currentIdx
                                  ? "bg-primary"
                                  : isNegative && req.status === "Rejected" && i <= 0
                                    ? "bg-destructive"
                                    : isNegative && req.status === "Cancelled" && i <= 0
                                      ? "bg-warning"
                                      : "bg-muted"
                              }`}
                              title={step}
                            />
                          ))}
                        </div>
                        <p className="text-xs">
                          {statusBadge(req.status)} —{" "}
                          <span className="text-muted-foreground">
                            {new Date(req.submittedAt).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer Since</span>
                <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Requests</span>
                <span>{customer.requests.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{new Date(customer.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
