import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const fields = await prisma.customField.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { values: true } } },
  });
  return NextResponse.json(fields);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const maxOrder = await prisma.customField.aggregate({ _max: { sortOrder: true } });

  const field = await prisma.customField.create({
    data: {
      fieldName: body.fieldName,
      fieldType: body.fieldType,
      required: body.required ?? false,
      options: body.options,
      defaultValue: body.defaultValue,
      placeholder: body.placeholder,
      active: body.active ?? true,
      sortOrder: body.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      isVisible: body.isVisible ?? true,
    },
  });

  return NextResponse.json(field, { status: 201 });
}
