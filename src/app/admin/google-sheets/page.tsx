"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Trash2,
  Pencil,
  RefreshCw,
  TestTube,
  CheckCircle,
  XCircle,
  Link2,
  FileSpreadsheet,
  Sheet,
  ChevronRight,
  ArrowUpCircle,
  AlertTriangle,
  Clock,
  CheckCheck,
} from "lucide-react";
import { PageTitle } from "@/components/PageTitle";

interface Spreadsheet {
  id: number;
  name: string;
  spreadsheetId: string;
  selectedSheetName: string | null;
  isActive: boolean;
  lastTestedAt: string | null;
  lastTestStatus: string | null;
  lastSyncAt: string | null;
  createdAt: string;
}

interface SheetTab {
  title: string;
  sheetId: number;
}

interface SyncStats {
  total: number;
  synced: number;
  pending: number;
  failed: number;
}

export default function GoogleSheetsPage() {
  const { toast } = useToast();
  const [spreadsheets, setSpreadsheets] = useState<Spreadsheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncStats, setSyncStats] = useState<SyncStats>({ total: 0, synced: 0, pending: 0, failed: 0 });
  const [syncing, setSyncing] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addSpreadsheetId, setAddSpreadsheetId] = useState("");
  const [addServiceKey, setAddServiceKey] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<Spreadsheet | null>(null);
  const [editName, setEditName] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState<Spreadsheet | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [disconnectOpen, setDisconnectOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState<Spreadsheet | null>(null);
  const [disconnectLoading, setDisconnectLoading] = useState(false);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sheets, setSheets] = useState<SheetTab[]>([]);
  const [sheetsLoading, setSheetsLoading] = useState(false);

  const [newSheetName, setNewSheetName] = useState("");
  const [creatingSheet, setCreatingSheet] = useState(false);
  const [renamingSheet, setRenamingSheet] = useState<{ sheetId: number; title: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteSheetTarget, setDeleteSheetTarget] = useState<SheetTab | null>(null);

  const fetchSpreadsheets = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/google-sheets");
      const data = await res.json();
      setSpreadsheets(data);
    } catch {
      toast("Failed to load spreadsheets", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchSyncStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/google-sheets/stats");
      if (res.ok) {
        const data = await res.json();
        setSyncStats(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchSpreadsheets();
    fetchSyncStats();
  }, [fetchSpreadsheets, fetchSyncStats]);

  async function handleAdd() {
    if (!addName.trim() || !addSpreadsheetId.trim() || !addServiceKey.trim()) {
      toast("All fields are required", "error");
      return;
    }
    setAddLoading(true);
    try {
      const res = await fetch("/api/admin/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: addName.trim(),
          spreadsheetId: addSpreadsheetId.trim(),
          serviceAccountKey: addServiceKey.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || "Failed to add", "error");
      } else {
        toast("Spreadsheet connected successfully", "success");
        setAddOpen(false);
        setAddName("");
        setAddSpreadsheetId("");
        setAddServiceKey("");
        fetchSpreadsheets();
      }
    } catch {
      toast("An error occurred", "error");
    }
    setAddLoading(false);
  }

  async function handleEdit() {
    if (!editing || !editName.trim()) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/google-sheets/${editing.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (res.ok) {
        toast("Updated", "success");
        setEditOpen(false);
        fetchSpreadsheets();
      } else {
        const data = await res.json();
        toast(data.error || "Failed", "error");
      }
    } catch {
      toast("An error occurred", "error");
    }
    setEditLoading(false);
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/google-sheets/${deleting.id}`, { method: "DELETE" });
      if (res.ok) {
        toast("Deleted", "success");
        setDeleteOpen(false);
        setDeleting(null);
        if (expandedId === deleting.id) setExpandedId(null);
        fetchSpreadsheets();
        fetchSyncStats();
      } else {
        const data = await res.json();
        toast(data.error || "Failed", "error");
      }
    } catch {
      toast("An error occurred", "error");
    }
    setDeleteLoading(false);
  }

  async function handleDisconnect() {
    if (!disconnecting) return;
    setDisconnectLoading(true);
    try {
      const res = await fetch(`/api/admin/google-sheets/${disconnecting.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      if (res.ok) {
        toast("Disconnected. Requests will no longer sync.", "info");
        setDisconnectOpen(false);
        setDisconnecting(null);
        fetchSpreadsheets();
      } else {
        const data = await res.json();
        toast(data.error || "Failed", "error");
      }
    } catch {
      toast("An error occurred", "error");
    }
    setDisconnectLoading(false);
  }

  async function handleReconnect(spreadsheet: Spreadsheet) {
    try {
      const res = await fetch(`/api/admin/google-sheets/${spreadsheet.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (res.ok) {
        toast("Reconnected", "success");
        fetchSpreadsheets();
      }
    } catch {
      toast("An error occurred", "error");
    }
  }

  async function handleTest(spreadsheet: Spreadsheet) {
    toast("Testing connection...", "info");
    try {
      const res = await fetch(`/api/admin/google-sheets/${spreadsheet.id}/test`, { method: "POST" });
      if (res.ok) {
        toast("Connection successful", "success");
      } else {
        const data = await res.json();
        toast(data.error || "Connection failed", "error");
      }
      fetchSpreadsheets();
    } catch {
      toast("Test failed", "error");
    }
  }

  async function handleSyncNow() {
    setSyncing(true);
    try {
      const res = await fetch("/api/admin/google-sheets/sync", { method: "POST" });
      const data = await res.json();
      if (data.synced > 0) {
        toast(`Synced ${data.synced} request(s) to Google Sheets`, "success");
      }
      if (data.failed > 0) {
        toast(`${data.failed} request(s) failed to sync`, "error");
      }
      if (data.synced === 0 && data.failed === 0) {
        toast("All requests are already synced", "info");
      }
      fetchSyncStats();
    } catch {
      toast("Sync failed", "error");
    }
    setSyncing(false);
  }

  async function handleRetryFailed() {
    setRetrying(true);
    try {
      const res = await fetch("/api/admin/google-sheets/retry", { method: "POST" });
      const data = await res.json();
      if (data.synced > 0) {
        toast(`Retried ${data.synced} request(s) successfully`, "success");
      }
      if (data.failed > 0) {
        toast(`${data.failed} request(s) still failed`, "error");
      }
      if (data.synced === 0 && data.failed === 0) {
        toast("No failed requests to retry", "info");
      }
      fetchSyncStats();
    } catch {
      toast("Retry failed", "error");
    }
    setRetrying(false);
  }

  async function loadSheets(spreadsheetId: number) {
    if (expandedId === spreadsheetId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(spreadsheetId);
    setSheetsLoading(true);
    try {
      const res = await fetch(`/api/admin/google-sheets/${spreadsheetId}/sheets`);
      const data = await res.json();
      if (res.ok) {
        setSheets(data.sheets || []);
      } else {
        toast(data.error || "Failed to load sheets", "error");
        setSheets([]);
      }
    } catch {
      toast("Failed to load sheets", "error");
      setSheets([]);
    }
    setSheetsLoading(false);
  }

  async function handleCreateSheet(spreadsheetId: number) {
    if (!newSheetName.trim()) return;
    setCreatingSheet(true);
    try {
      const res = await fetch(`/api/admin/google-sheets/${spreadsheetId}/sheets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newSheetName.trim() }),
      });
      if (res.ok) {
        toast("Sheet created", "success");
        setNewSheetName("");
        loadSheets(spreadsheetId);
      } else {
        const data = await res.json();
        toast(data.error || "Failed", "error");
      }
    } catch {
      toast("An error occurred", "error");
    }
    setCreatingSheet(false);
  }

  async function handleRenameSheet(spreadsheetId: number) {
    if (!renamingSheet || !renameValue.trim()) return;
    try {
      const res = await fetch(`/api/admin/google-sheets/${spreadsheetId}/sheets/${renamingSheet.sheetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: renameValue.trim() }),
      });
      if (res.ok) {
        toast("Renamed", "success");
        setRenamingSheet(null);
        loadSheets(spreadsheetId);
      } else {
        const data = await res.json();
        toast(data.error || "Failed", "error");
      }
    } catch {
      toast("An error occurred", "error");
    }
  }

  async function handleDeleteSheet(spreadsheetId: number) {
    if (!deleteSheetTarget) return;
    try {
      const res = await fetch(`/api/admin/google-sheets/${spreadsheetId}/sheets/${deleteSheetTarget.sheetId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast("Sheet deleted", "success");
        setDeleteSheetTarget(null);
        loadSheets(spreadsheetId);
      } else {
        const data = await res.json();
        toast(data.error || "Failed", "error");
      }
    } catch {
      toast("An error occurred", "error");
    }
  }

  async function handleSelectSheet(spreadsheetId: number, sheetName: string) {
    try {
      const res = await fetch(`/api/admin/google-sheets/${spreadsheetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedSheetName: sheetName }),
      });
      if (res.ok) {
        toast(`Selected "${sheetName}" as destination`, "success");
        fetchSpreadsheets();
      }
    } catch {
      toast("An error occurred", "error");
    }
  }

  const hasConnected = spreadsheets.some((s) => s.isActive);

  return (
    <div className="space-y-6">
      <PageTitle pageName="Google Sheets" />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Google Sheets</h1>
          <p className="text-muted-foreground">Manage spreadsheet connections and synchronization</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add Spreadsheet
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-background p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <FileSpreadsheet className="h-4 w-4" /> Total Requests
          </div>
          <p className="text-2xl font-bold">{syncStats.total}</p>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <CheckCheck className="h-4 w-4 text-green-600 dark:text-green-400" /> Synced
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{syncStats.synced}</p>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" /> Pending
          </div>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{syncStats.pending}</p>
        </div>
        <div className="rounded-lg border bg-background p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" /> Failed
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{syncStats.failed}</p>
        </div>
      </div>

      {hasConnected && (
        <div className="flex items-center gap-3 flex-wrap">
          <Button onClick={handleSyncNow} loading={syncing} disabled={syncing || retrying}>
            <ArrowUpCircle className="h-4 w-4 mr-1" /> Sync Now
          </Button>
          <Button variant="outline" onClick={handleRetryFailed} loading={retrying} disabled={syncing || retrying}>
            <RefreshCw className="h-4 w-4 mr-1" /> Retry Failed
          </Button>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border bg-background p-12 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      ) : spreadsheets.length === 0 ? (
        <div className="rounded-lg border bg-background p-12 text-center">
          <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No spreadsheets connected yet</p>
          <p className="text-sm text-muted-foreground mt-2">
            Connect a Google Spreadsheet to automatically sync customer requests.
          </p>
          <Button variant="outline" onClick={() => setAddOpen(true)} className="mt-4">
            <Plus className="h-4 w-4" /> Connect your first spreadsheet
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {spreadsheets.map((s) => (
            <div key={s.id} className="rounded-lg border bg-background overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20 shrink-0">
                  <FileSpreadsheet className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{s.name}</h3>
                    <Badge variant={s.isActive ? "success" : "secondary"}>
                      {s.isActive ? "Connected" : "Disconnected"}
                    </Badge>
                    {s.isActive ? (
                      <Badge variant="success">
                        <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Active</span>
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <span className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Inactive</span>
                      </Badge>
                    )}
                    {s.lastTestStatus && (
                      <Badge variant={s.lastTestStatus === "success" ? "success" : "destructive"}>
                        {s.lastTestStatus === "success" ? "Tested OK" : "Test Failed"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    <Link2 className="h-3 w-3 inline mr-1" />
                    {s.spreadsheetId}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    {s.selectedSheetName && (
                      <span>
                        <Sheet className="h-3 w-3 inline mr-1" />
                        Destination: <strong>{s.selectedSheetName}</strong>
                      </span>
                    )}
                    {s.lastSyncAt && (
                      <span className="text-xs">
                        Last sync: {new Date(s.lastSyncAt).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
                  <Button variant="ghost" size="icon" title="Test connection" onClick={() => handleTest(s)}>
                    <TestTube className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Manage sheets" onClick={() => loadSheets(s.id)}>
                    <ChevronRight className={`h-4 w-4 transition-transform ${expandedId === s.id ? "rotate-90" : ""}`} />
                  </Button>
                  <Button variant="ghost" size="icon" title="Edit" onClick={() => { setEditing(s); setEditName(s.name); setEditOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  {s.isActive ? (
                    <Button variant="ghost" size="icon" title="Disconnect" onClick={() => { setDisconnecting(s); setDisconnectOpen(true); }}>
                      <XCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    </Button>
                  ) : (
                    <Button variant="ghost" size="icon" title="Reconnect" onClick={() => handleReconnect(s)}>
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" title="Delete" onClick={() => { setDeleting(s); setDeleteOpen(true); }}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {expandedId === s.id && (
                <div className="border-t bg-muted/30 p-4 space-y-4 animate-slide-down">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Sheets / Tabs</h4>
                    <Button variant="ghost" size="sm" onClick={() => loadSheets(s.id)}>
                      <RefreshCw className="h-3 w-3 mr-1" /> Refresh
                    </Button>
                  </div>

                  {sheetsLoading ? (
                    <p className="text-sm text-muted-foreground">Loading sheets...</p>
                  ) : sheets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No sheets found</p>
                  ) : (
                    <div className="space-y-1">
                      {sheets.map((sheet) => (
                        <div key={sheet.sheetId} className="flex items-center gap-2 rounded-md bg-background border px-3 py-2">
                          <Sheet className="h-4 w-4 text-muted-foreground shrink-0" />
                          {renamingSheet?.sheetId === sheet.sheetId ? (
                            <Input
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              className="h-7 flex-1"
                              onKeyDown={(e) => { if (e.key === "Enter") handleRenameSheet(s.id); if (e.key === "Escape") setRenamingSheet(null); }}
                              autoFocus
                            />
                          ) : (
                            <span className="flex-1 text-sm">{sheet.title}</span>
                          )}
                          {s.selectedSheetName === sheet.title && (
                            <Badge variant="default" className="text-[10px]">Destination</Badge>
                          )}
                          <div className="flex gap-1 shrink-0">
                            {s.selectedSheetName !== sheet.title && (
                              <Button variant="ghost" size="icon" className="h-6 w-6" title="Set as destination" onClick={() => handleSelectSheet(s.id, sheet.title)}>
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                            {renamingSheet?.sheetId === sheet.sheetId ? (
                              <Button variant="ghost" size="icon" className="h-6 w-6" title="Save" onClick={() => handleRenameSheet(s.id)}>
                                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" className="h-6 w-6" title="Rename" onClick={() => { setRenamingSheet({ sheetId: sheet.sheetId, title: sheet.title }); setRenameValue(sheet.title); }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-6 w-6" title="Delete" onClick={() => setDeleteSheetTarget(sheet)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={newSheetName}
                      onChange={(e) => setNewSheetName(e.target.value)}
                      placeholder="New sheet name..."
                      className="h-8 flex-1"
                      onKeyDown={(e) => { if (e.key === "Enter") handleCreateSheet(s.id); }}
                    />
                    <Button size="sm" onClick={() => handleCreateSheet(s.id)} loading={creatingSheet}>
                      <Plus className="h-3 w-3 mr-1" /> Create
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} className="max-w-lg">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Google Spreadsheet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1 block">Connection Name *</label>
              <Input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="e.g. Customer Requests" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Spreadsheet ID *</label>
              <Input value={addSpreadsheetId} onChange={(e) => setAddSpreadsheetId(e.target.value)} placeholder="From the Google Sheets URL" />
              <p className="text-xs text-muted-foreground mt-1">
                Find it in the URL: docs.google.com/spreadsheets/d/<strong>THIS_PART</strong>/edit
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Service Account Key (JSON) *</label>
              <textarea
                value={addServiceKey}
                onChange={(e) => setAddServiceKey(e.target.value)}
                placeholder='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Create a service account in Google Cloud Console, enable Sheets API, then download the JSON key.
                Share the spreadsheet with the service account email.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={addLoading}>Cancel</Button>
            <Button onClick={handleAdd} loading={addLoading}>Connect</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} className="max-w-md">
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Spreadsheet</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <label className="text-sm font-medium mb-1 block">Name</label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editLoading}>Cancel</Button>
            <Button onClick={handleEdit} loading={editLoading}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); setDeleting(null); }}
        onConfirm={handleDelete}
        title="Delete spreadsheet connection?"
        description={`Are you sure you want to remove "${deleting?.name}"? This does not delete the Google Spreadsheet itself.`}
        loading={deleteLoading}
      />

      <ConfirmDialog
        open={disconnectOpen}
        onClose={() => { setDisconnectOpen(false); setDisconnecting(null); }}
        onConfirm={handleDisconnect}
        title="Disconnect Google Sheet?"
        description={`Are you sure you want to disconnect "${disconnecting?.name}"? New requests will not be synced until reconnected.`}
        loading={disconnectLoading}
      />

      <ConfirmDialog
        open={!!deleteSheetTarget}
        onClose={() => setDeleteSheetTarget(null)}
        onConfirm={() => expandedId && handleDeleteSheet(expandedId)}
        title="Delete sheet/tab?"
        description={`Are you sure you want to delete "${deleteSheetTarget?.title}"? This cannot be undone.`}
      />
    </div>
  );
}
