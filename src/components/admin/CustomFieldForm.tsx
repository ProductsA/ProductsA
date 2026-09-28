"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface CustomField {
  id?: number;
  fieldName: string;
  fieldType: string;
  required: boolean;
  options: string | null;
  defaultValue: string | null;
  placeholder: string | null;
  active: boolean;
  isVisible: boolean;
}

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "time", label: "Time" },
  { value: "dropdown", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "radio", label: "Radio" },
  { value: "textarea", label: "Textarea" },
];

export function CustomFieldForm({
  field,
  onSave,
  onCancel,
}: {
  field?: CustomField;
  onSave: (data: CustomField) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    fieldName: field?.fieldName ?? "",
    fieldType: field?.fieldType ?? "text",
    required: field?.required ?? false,
    options: field?.options ?? "",
    defaultValue: field?.defaultValue ?? "",
    placeholder: field?.placeholder ?? "",
    active: field?.active ?? true,
    isVisible: field?.isVisible ?? true,
  });

  const [optionList, setOptionList] = useState<string[]>(
    field?.options ? field.options.split(",").map((o) => o.trim()) : []
  );

  const needsOptions = form.fieldType === "dropdown" || form.fieldType === "radio";

  function handleAddOption(opt: string) {
    if (opt.trim() && !optionList.includes(opt.trim())) {
      const updated = [...optionList, opt.trim()];
      setOptionList(updated);
      setForm((prev) => ({ ...prev, options: updated.join(", ") }));
    }
  }

  function handleRemoveOption(index: number) {
    const updated = optionList.filter((_, i) => i !== index);
    setOptionList(updated);
    setForm((prev) => ({ ...prev, options: updated.join(", ") }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ ...form, id: field?.id });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Field Name *</label>
          <Input
            value={form.fieldName}
            onChange={(e) => setForm((p) => ({ ...p, fieldName: e.target.value }))}
            required
            placeholder="e.g. Company Name"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Field Type *</label>
          <Select
            value={form.fieldType}
            onChange={(e) => setForm((p) => ({ ...p, fieldType: e.target.value }))}
            options={FIELD_TYPES}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Default Value</label>
          <Input
            value={form.defaultValue}
            onChange={(e) => setForm((p) => ({ ...p, defaultValue: e.target.value }))}
            placeholder="Default value"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Placeholder</label>
          <Input
            value={form.placeholder}
            onChange={(e) => setForm((p) => ({ ...p, placeholder: e.target.value }))}
            placeholder="Placeholder text"
          />
        </div>
      </div>

      {needsOptions && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Options</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add option and press Enter"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddOption((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = "";
                }
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {optionList.map((opt, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs"
              >
                {opt}
                <button
                  type="button"
                  onClick={() => handleRemoveOption(i)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.required}
            onChange={(e) => setForm((p) => ({ ...p, required: e.target.checked }))}
            className="rounded border-input"
          />
          Required
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
            className="rounded border-input"
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isVisible}
            onChange={(e) => setForm((p) => ({ ...p, isVisible: e.target.checked }))}
            className="rounded border-input"
          />
          Visible
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Preview</label>
        <div className="rounded-md border p-4 bg-muted/30">
          {form.fieldType === "textarea" ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">{form.fieldName || "Field Name"}</p>
              <Textarea disabled placeholder={form.placeholder} defaultValue={form.defaultValue} />
            </div>
          ) : form.fieldType === "checkbox" ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" disabled />
              {form.fieldName || "Field Name"}
            </label>
          ) : form.fieldType === "radio" ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">{form.fieldName || "Field Name"}</p>
              {optionList.map((opt, i) => (
                <label key={i} className="flex items-center gap-2 text-sm">
                  <input type="radio" disabled name="preview" />
                  {opt}
                </label>
              ))}
            </div>
          ) : form.fieldType === "dropdown" ? (
            <div className="space-y-1">
              <p className="text-sm font-medium">{form.fieldName || "Field Name"}</p>
              <select disabled className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option>{form.placeholder || "Select..."}</option>
                {optionList.map((opt, i) => (
                  <option key={i}>{opt}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <p className="text-sm font-medium">{form.fieldName || "Field Name"}</p>
              <Input disabled placeholder={form.placeholder} defaultValue={form.defaultValue} type={form.fieldType === "phone" ? "tel" : form.fieldType} />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Field</Button>
      </div>
    </form>
  );
}
