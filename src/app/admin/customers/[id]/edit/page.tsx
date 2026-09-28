"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { PRODUCT_STATUSES } from "@/lib/constants";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageTitle } from "@/components/PageTitle";

interface CustomerData {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  requests: Array<{
    id: number;
    variation: string | null;
    status: string;
    notes: string | null;
    adminComments: string | null;
    submittedAt: string;
    product: { id: number; name: string };
  }>;
  customValues: Array<{
    id: number;
    value: string;
    field: { id: number; fieldName: string; fieldType: string; options: string | null; placeholder: string | null };
  }>;
}

export default function CustomerEditPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [requestNotes, setRequestNotes] = useState<Record<number, string>>({});
  const [requestComments, setRequestComments] = useState<Record<number, string>>({});
  const [requestStatus, setRequestStatus] = useState<Record<number, string>>({});

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/admin/customers/${params.id}`);
        if (!res.ok) throw new Error("Failed to load");
        const data: CustomerData = await res.json();
        setCustomer(data);
        setFirstName(data.firstName);
        setLastName(data.lastName ?? "");
        setGender(data.gender ?? "");
        setEmail(data.email ?? "");
        setPhone(data.phone ?? "");
        setAddress(data.address ?? "");
        setCity(data.city ?? "");
        setRegion(data.region ?? "");
        setPostalCode(data.postalCode ?? "");
        setCountry(data.country ?? "");

        const notes: Record<number, string> = {};
        const comments: Record<number, string> = {};
        const statuses: Record<number, string> = {};
        data.requests.forEach((r) => {
          notes[r.id] = r.notes ?? "";
          comments[r.id] = r.adminComments ?? "";
          statuses[r.id] = r.status;
        });
        setRequestNotes(notes);
        setRequestComments(comments);
        setRequestStatus(statuses);
      } catch {
        toast("Failed to load customer data", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, toast]);

  async function handleSave() {
    if (!customer) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName: lastName || null,
          gender: gender || null,
          email: email || null,
          phone: phone || null,
          address: address || null,
          city: city || null,
          region: region || null,
          postalCode: postalCode || null,
          country: country || null,
        }),
      });

      for (const req of customer.requests) {
        const updates: Record<string, unknown> = {};
        if (requestStatus[req.id] !== req.status) updates.status = requestStatus[req.id];
        if ((requestNotes[req.id] ?? "") !== (req.notes ?? "")) updates.notes = requestNotes[req.id];
        if ((requestComments[req.id] ?? "") !== (req.adminComments ?? "")) updates.adminComments = requestComments[req.id];

        if (Object.keys(updates).length > 0) {
          await fetch("/api/admin/requests", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: req.id, ...updates }),
          });
        }
      }

      toast("Customer saved successfully", "success");
      router.push(`/admin/customers/${customer.id}`);
    } catch {
      toast("Failed to save customer", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!customer) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/customers/${customer.id}`, { method: "DELETE" });
      toast("Customer deleted", "success");
      router.push("/admin/customers");
    } catch {
      toast("Failed to delete customer", "error");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12 text-muted-foreground">Customer not found</div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle pageName="Modifier le Client" />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href={`/admin/customers/${customer.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit {customer.firstName} {customer.lastName ?? ""}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button size="sm" onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">First Name</label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Last Name</label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <Input value={gender} onChange={(e) => setGender(e.target.value)} placeholder="Male / Female / Other" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Input value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Postal Code</label>
              <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {customer.requests.map((req) => (
        <Card key={req.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Request #{req.id} — {req.product.name}
              </CardTitle>
              <Select
                value={requestStatus[req.id] ?? req.status}
                onChange={(e) => setRequestStatus((p) => ({ ...p, [req.id]: e.target.value }))}
                options={PRODUCT_STATUSES.map((s) => ({ value: s, label: s }))}
                className="w-40"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={requestNotes[req.id] ?? ""}
                onChange={(e) => setRequestNotes((p) => ({ ...p, [req.id]: e.target.value }))}
                placeholder="Add notes..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Comments</label>
              <Textarea
                value={requestComments[req.id] ?? ""}
                onChange={(e) => setRequestComments((p) => ({ ...p, [req.id]: e.target.value }))}
                placeholder="Add admin comments..."
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete customer?"
        description="This will permanently delete this customer and all their requests. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}
