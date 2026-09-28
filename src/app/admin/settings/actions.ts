"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateSettings(data: Record<string, string>) {
  try {
    for (const [key, value] of Object.entries(data)) {
      await prisma.websiteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }
    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/settings/domain");
    revalidatePath("/admin");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update settings" };
  }
}

export async function getSettings(): Promise<Record<string, string>> {
  const settings = await prisma.websiteSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) {
    map[s.key] = s.value || "";
  }
  return map;
}

export async function updateAdminProfile(data: {
  name?: string;
  email?: string;
  phone?: string;
  profileImage?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const adminId = parseInt(session.user.id, 10);
  if (isNaN(adminId)) {
    return { success: false, error: "Invalid admin ID" };
  }

  try {
    if (data.email) {
      const existing = await prisma.admin.findFirst({
        where: { email: data.email, NOT: { id: adminId } },
      });
      if (existing) {
        return { success: false, error: "Email is already in use by another account" };
      }
    }

    await prisma.admin.update({
      where: { id: adminId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.profileImage !== undefined && { profileImage: data.profileImage }),
      },
    });

    revalidatePath("/admin/profile");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update profile" };
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const adminId = parseInt(session.user.id, 10);
  if (isNaN(adminId)) {
    return { success: false, error: "Invalid admin ID" };
  }

  try {
    const admin = await prisma.admin.findUnique({ where: { id: adminId } });
    if (!admin) {
      return { success: false, error: "Admin not found" };
    }

    const isValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    if (newPassword.length < 8) {
      return { success: false, error: "New password must be at least 8 characters" };
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.admin.update({
      where: { id: adminId },
      data: { passwordHash },
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to change password" };
  }
}
