import { NextRequest, NextResponse } from "next/server";
import { readdir, stat, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { writeFile } from "fs/promises";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

async function ensureUploadDir() {
  try {
    await stat(UPLOAD_DIR);
  } catch {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function GET() {
  await ensureUploadDir();

  try {
    const entries = await readdir(UPLOAD_DIR, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((e) => e.isFile())
        .map(async (entry) => {
          const filePath = join(UPLOAD_DIR, entry.name);
          const fileStat = await stat(filePath);
          const ext = entry.name.split(".").pop()?.toLowerCase() ?? "";
          let type = "application/octet-stream";
          if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) {
            type = `image/${ext === "jpg" ? "jpeg" : ext}`;
          } else if (["mp4", "webm", "ogg"].includes(ext)) {
            type = `video/${ext}`;
          }

          return {
            name: entry.name,
            size: fileStat.size,
            type,
            url: `/uploads/${entry.name}`,
            lastModified: fileStat.mtimeMs,
          };
        })
    );

    files.sort((a, b) => b.lastModified - a.lastModified);

    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
  }
}

export async function POST(request: NextRequest) {
  await ensureUploadDir();

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = join(UPLOAD_DIR, safeName);

  await writeFile(filePath, buffer);

  return NextResponse.json({
    success: true,
    file: {
      name: safeName,
      size: file.size,
      type: file.type,
      url: `/uploads/${safeName}`,
    },
  });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "No file name provided" }, { status: 400 });
  }

  const safeName = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = join(UPLOAD_DIR, safeName);

  try {
    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
