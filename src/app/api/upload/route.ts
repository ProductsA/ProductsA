import { NextRequest } from "next/server";
import { ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES } from "@/lib/constants";

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
const MAX_BASE64_SIZE = 5 * 1024 * 1024; // 5MB for base64 storage

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return Response.json({ error: "Invalid file type. Allowed: JPG, PNG, WEBP, MP4, WEBM, OGG" }, { status: 400 });
  }

  if (file.size > MAX_BASE64_SIZE) {
    return Response.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${file.type};base64,${base64}`;

  return Response.json({
    success: true,
    url: dataUrl,
  });
}
