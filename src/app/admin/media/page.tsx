"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Upload, Trash2, Image as ImageIcon, Video, File, X } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PageTitle } from "@/components/PageTitle";

interface MediaFile {
  name: string;
  size: number;
  type: string;
  url: string;
  lastModified: number;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-8 w-8 text-primary" />;
  if (type.startsWith("video/")) return <Video className="h-8 w-8 text-purple-500 dark:text-purple-400" />;
  return <File className="h-8 w-8 text-muted-foreground" />;
}

export default function MediaPage() {
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "images" | "videos">("all");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingName, setDeletingName] = useState("");

  const loadFiles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setFiles(data.files ?? []);
    } catch {
      toast("Failed to load media files", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/media");
        const data = await res.json();
        if (!cancelled) setFiles(data.files ?? []);
      } catch {
        if (!cancelled) toast("Failed to load media files", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [toast]);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);

    for (const file of Array.from(fileList)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Upload failed");
      } catch {
        toast(`Failed to upload ${file.name}`, "error");
      }
    }

    setUploading(false);
    loadFiles();
    toast("Upload complete", "success");
  }

  async function confirmDelete() {
    try {
      await fetch(`/api/admin/media?name=${encodeURIComponent(deletingName)}`, { method: "DELETE" });
      toast("File deleted", "success");
      setSelectedFile(null);
      loadFiles();
    } catch {
      toast("Failed to delete file", "error");
    } finally {
      setDeleteOpen(false);
      setDeletingName("");
    }
  }

  const filtered = files.filter((f) => {
    if (filter === "images") return f.type.startsWith("image/");
    if (filter === "videos") return f.type.startsWith("video/");
    return true;
  });

  return (
    <div className="space-y-6">
      <PageTitle pageName="Bibliotheque Media" />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
          <p className="text-muted-foreground">Manage uploaded files</p>
        </div>
        <div className="flex gap-2">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleUpload(e.dataTransfer.files);
            }}
          >
            <Button
              variant={dragOver ? "default" : "outline"}
              size="sm"
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
              {dragOver ? "Drop here" : "Upload Files"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {(["all", "images", "videos"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-md border font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-secondary"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="flex-1">
          <Card>
            <CardContent className="p-4">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No files found. Upload some files to get started.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filtered.map((file) => (
                    <button
                      key={file.name}
                      onClick={() => setSelectedFile(file)}
                      className={`aspect-square rounded-lg border-2 overflow-hidden relative group transition-colors ${
                        selectedFile?.name === file.name
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-transparent hover:border-border"
                      }`}
                    >
                      {file.type.startsWith("image/") ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          {getFileIcon(file.type)}
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-white text-xs truncate">{file.name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {selectedFile && (
          <div className="w-72 shrink-0 hidden lg:block">
            <Card className="sticky top-6">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">File Details</CardTitle>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedFile.type.startsWith("image/") ? (
                  <img
                    src={selectedFile.url}
                    alt={selectedFile.name}
                    className="w-full rounded-md border object-cover"
                  />
                ) : (
                  <div className="w-full aspect-video bg-muted rounded-md flex items-center justify-center">
                    {getFileIcon(selectedFile.type)}
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium break-all">{selectedFile.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">{selectedFile.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Size</p>
                    <p className="font-medium">{formatSize(selectedFile.size)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Modified</p>
                    <p className="font-medium">
                      {new Date(selectedFile.lastModified).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedFile.url);
                      toast("URL copied", "success");
                    }}
                  >
                    Copy URL
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => { setDeletingName(selectedFile.name); setDeleteOpen(true); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
        </div>
      )}

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeletingName(""); }}
        onConfirm={confirmDelete}
        title="Delete file?"
        description={`Are you sure you want to delete "${deletingName}"? This action cannot be undone.`}
        confirmLabel="Delete"
      />
    </div>
    </div>
  );
}
