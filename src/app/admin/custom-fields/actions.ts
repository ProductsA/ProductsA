"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCustomField(data: {
  fieldName: string;
  fieldType: string;
  required?: boolean;
  options?: string;
  defaultValue?: string;
  placeholder?: string;
  active?: boolean;
  sortOrder?: number;
  isVisible?: boolean;
}) {
  const maxOrder = await prisma.customField.aggregate({ _max: { sortOrder: true } });
  await prisma.customField.create({
    data: {
      fieldName: data.fieldName,
      fieldType: data.fieldType,
      required: data.required ?? false,
      options: data.options,
      defaultValue: data.defaultValue,
      placeholder: data.placeholder,
      active: data.active ?? true,
      sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      isVisible: data.isVisible ?? true,
    },
  });
  revalidatePath("/admin/custom-fields");
}

export async function updateCustomField(
  id: number,
  data: {
    fieldName?: string;
    fieldType?: string;
    required?: boolean;
    options?: string;
    defaultValue?: string;
    placeholder?: string;
    active?: boolean;
    sortOrder?: number;
    isVisible?: boolean;
  }
) {
  await prisma.customField.update({ where: { id }, data });
  revalidatePath("/admin/custom-fields");
}

export async function deleteCustomField(id: number) {
  await prisma.customFieldValue.deleteMany({ where: { fieldId: id } });
  await prisma.customField.delete({ where: { id } });
  revalidatePath("/admin/custom-fields");
}

export async function reorderCustomFields(ids: number[]) {
  const updates = ids.map((id, index) =>
    prisma.customField.update({ where: { id }, data: { sortOrder: index + 1 } })
  );
  await prisma.$transaction(updates);
  revalidatePath("/admin/custom-fields");
}
