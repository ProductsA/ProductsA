import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const adminId = parseInt(session.user.id, 10);
  if (isNaN(adminId)) {
    return Response.json({ error: "Invalid admin ID" }, { status: 400 });
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true, phone: true, profileImage: true },
  });

  if (!admin) {
    return Response.json({ error: "Admin not found" }, { status: 404 });
  }

  return Response.json(admin);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const adminId = parseInt(session.user.id, 10);
  if (isNaN(adminId)) {
    return Response.json({ error: "Invalid admin ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { name, email, phone, profileImage } = body;

    if (email) {
      const existing = await prisma.admin.findFirst({
        where: { email, NOT: { id: adminId } },
      });
      if (existing) {
        return Response.json({ error: "Email is already in use" }, { status: 400 });
      }
    }

    await prisma.admin.update({
      where: { id: adminId },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(profileImage !== undefined && { profileImage: profileImage || null }),
      },
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
