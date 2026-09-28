"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CustomFieldForm } from "@/components/admin/CustomFieldForm";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Settings2,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageTitle } from "@/components/PageTitle";

interface CustomField {
  id: number;
  fieldName: string;
  fieldType: string;
  required: boolean;
  options: string | null;
  defaultValue: string | null;
  placeholder: string | null;
  active: boolean;
  sortOrder: number;
  isVisible: boolean;
  _count?: { values: number };
}

export default function CustomFieldsPage() {
  const { toast } = useToast();
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | undefined>(undefined);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingFieldId, setDeletingFieldId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/custom-fields");
        const data = await res.json();
        if (!cancelled) setFields(data);
      } catch {
        if (!cancelled) toast("Failed to load custom fields", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [toast]);

  async function reloadFields() {
    try {
      const res = await fetch("/api/admin/custom-fields");
      const data = await res.json();
      setFields(data);
    } catch {
      toast("Failed to load custom fields", "error");
    }
  }

  async function handleSave(data: {
    fieldName: string;
    fieldType: string;
    required: boolean;
    options: string | null;
    defaultValue: string | null;
    placeholder: string | null;
    active: boolean;
    isVisible: boolean;
    id?: number;
  }) {
    try {
      if (data.id) {
        await fetch(`/api/admin/custom-fields/${data.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toast("Field updated", "success");
      } else {
        await fetch("/api/admin/custom-fields", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        toast("Field created", "success");
      }
      setShowForm(false);
      setEditingField(undefined);
      reloadFields();
    } catch {
      toast("Failed to save field", "error");
    }
  }

  async function confirmDeleteField() {
    if (!deletingFieldId) return;
    try {
      await fetch(`/api/admin/custom-fields/${deletingFieldId}`, { method: "DELETE" });
      toast("Field deleted", "success");
      reloadFields();
    } catch {
      toast("Failed to delete field", "error");
    } finally {
      setDeleteOpen(false);
      setDeletingFieldId(null);
    }
  }

  async function handleToggleActive(field: CustomField) {
    try {
      await fetch(`/api/admin/custom-fields/${field.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !field.active }),
      });
      reloadFields();
    } catch {
      toast("Failed to update field", "error");
    }
  }

  async function handleMoveUp(field: CustomField, index: number) {
    if (index === 0) return;
    const prev = fields[index - 1];
    try {
      await Promise.all([
        fetch(`/api/admin/custom-fields/${field.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: prev.sortOrder }),
        }),
        fetch(`/api/admin/custom-fields/${prev.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: field.sortOrder }),
        }),
      ]);
      reloadFields();
    } catch {
      toast("Failed to reorder", "error");
    }
  }

  async function handleMoveDown(field: CustomField, index: number) {
    if (index === fields.length - 1) return;
    const next = fields[index + 1];
    try {
      await Promise.all([
        fetch(`/api/admin/custom-fields/${field.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: next.sortOrder }),
        }),
        fetch(`/api/admin/custom-fields/${next.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: field.sortOrder }),
        }),
      ]);
      reloadFields();
    } catch {
      toast("Failed to reorder", "error");
    }
  }

  const fieldTypeBadge: Record<string, string> = {
    text: "Text",
    number: "Number",
    email: "Email",
    phone: "Phone",
    date: "Date",
    time: "Time",
    dropdown: "Dropdown",
    checkbox: "Checkbox",
    radio: "Radio",
    textarea: "Textarea",
  };

  return (
    <div className="space-y-6">
      <PageTitle pageName="Champs Personnalises" />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Settings2 className="h-6 w-6" />
            Custom Fields
          </h1>
          <p className="text-muted-foreground">Manage custom fields for customer forms</p>
        </div>
        <Button
          onClick={() => {
            setEditingField(undefined);
            setShowForm(!showForm);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Field
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingField ? `Edit: ${editingField.fieldName}` : "New Custom Field"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CustomFieldForm
              field={editingField}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false);
                setEditingField(undefined);
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No custom fields yet. Click &quot;Add Field&quot; to create one.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground w-10" />
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Required</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Active</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Visible</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Values</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="border-b hover:bg-muted/30">
                    <td className="px-3 py-3">
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => handleMoveUp(field, index)}
                          disabled={index === 0}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <GripVertical className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(field, index)}
                          disabled={index === fields.length - 1}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30 rotate-180"
                        >
                          <GripVertical className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-medium">{field.fieldName}</td>
                    <td className="px-3 py-3">
                      <Badge variant="outline">{fieldTypeBadge[field.fieldType] ?? field.fieldType}</Badge>
                    </td>
                    <td className="px-3 py-3">{field.required ? "Yes" : "No"}</td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => handleToggleActive(field)}
                        className={field.active ? "text-success" : "text-muted-foreground"}
                      >
                        {field.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-3">{field.isVisible ? "Yes" : "No"}</td>
                    <td className="px-3 py-3 text-muted-foreground">{field._count?.values ?? 0}</td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingField(field);
                            setShowForm(true);
                          }}
                          className="p-1.5 rounded hover:bg-secondary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => { setDeletingFieldId(field.id); setDeleteOpen(true); }}
                          className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeletingFieldId(null); }}
        onConfirm={confirmDeleteField}
        title="Delete custom field?"
        description="This will permanently delete this custom field and all its values. This action cannot be undone."
        confirmLabel="Delete"
      />
    </div>
  );
}
