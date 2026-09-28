"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { PRODUCT_STATUSES } from "@/lib/constants";

type StatusType = (typeof PRODUCT_STATUSES)[number];

export async function updateCustomer(
  id: number,
  data: {
    firstName?: string;
    lastName?: string;
    gender?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  }
) {
  await prisma.customer.update({ where: { id }, data });
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${id}`);
}

export async function updateRequestStatus(requestId: number, status: StatusType) {
  await prisma.customerRequest.update({
    where: { id: requestId },
    data: { status, updatedAt: new Date() },
  });
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${requestId}`);
}

export async function addNote(requestId: number, notes: string) {
  await prisma.customerRequest.update({
    where: { id: requestId },
    data: { notes, updatedAt: new Date() },
  });
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${requestId}`);
}

export async function addAdminComment(requestId: number, adminComments: string) {
  await prisma.customerRequest.update({
    where: { id: requestId },
    data: { adminComments, updatedAt: new Date() },
  });
  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${requestId}`);
}

export async function deleteCustomer(id: number) {
  await prisma.customFieldValue.deleteMany({ where: { customerId: id } });
  await prisma.customerRequest.deleteMany({ where: { customerId: id } });
  await prisma.customer.delete({ where: { id } });

  revalidatePath("/admin/customers");
}

export async function deleteRequest(id: number) {
  await prisma.customerRequest.delete({ where: { id } });
  revalidatePath("/admin/customers");
}
