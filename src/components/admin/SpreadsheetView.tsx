"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react";

interface Column {
  id: string;
  label: string;
  width: number;
  visible: boolean;
  field: string;
}

interface Row {
  id: number;
  cells: Record<string, string>;
}

interface SpreadsheetViewProps {
  initialColumns?: Column[];
  initialRows?: Row[];
  onRowClick?: (rowId: number) => void;
  onCellEdit?: (rowId: number, field: string, value: string) => void;
  onRowsDelete?: (rowIds: number[]) => void;
  onExport?: () => void;
}

const DEFAULT_COLUMNS: Column[] = [
  { id: "requestId", label: "Request ID", width: 150, visible: true, field: "requestId" },
  { id: "id", label: "ID", width: 60, visible: true, field: "id" },
  { id: "firstName", label: "First Name", width: 120, visible: true, field: "firstName" },
  { id: "lastName", label: "Last Name", width: 120, visible: true, field: "lastName" },
  { id: "email", label: "Email", width: 200, visible: true, field: "email" },
  { id: "phone", label: "Phone", width: 140, visible: true, field: "phone" },
  { id: "product", label: "Product", width: 180, visible: true, field: "product" },
  { id: "variation", label: "Variation", width: 120, visible: true, field: "variation" },
  { id: "status", label: "Status", width: 110, visible: true, field: "status" },
  { id: "syncStatus", label: "Sync", width: 90, visible: true, field: "syncStatus" },
  { id: "date", label: "Date", width: 120, visible: true, field: "date" },
  { id: "notes", label: "Notes", width: 200, visible: true, field: "notes" },
];

export function SpreadsheetView({
  initialColumns = DEFAULT_COLUMNS,
  initialRows = [],
  onRowClick,
  onCellEdit,
  onRowsDelete,
  onExport,
}: SpreadsheetViewProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [editingCell, setEditingCell] = useState<{ rowId: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ field: string; direction: "asc" | "desc" } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; columnId: string } | null>(null);
  const [renamingColumn, setRenamingColumn] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [showColumnManager, setShowColumnManager] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  useEffect(() => {
    function handleClickOutside() {
      setContextMenu(null);
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const visibleColumns = useMemo(() => columns.filter((c) => c.visible), [columns]);

  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((row) =>
        visibleColumns.some((col) => (row.cells[col.field] ?? "").toLowerCase().includes(q))
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a.cells[sortConfig.field] ?? "";
        const bVal = b.cells[sortConfig.field] ?? "";

        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        const cmp = aVal.localeCompare(bVal);
        return sortConfig.direction === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [rows, searchQuery, sortConfig, visibleColumns]);

  function handleSort(field: string) {
    setSortConfig((prev) => {
      if (prev?.field === field) {
        if (prev.direction === "asc") return { field, direction: "desc" };
        return null;
      }
      return { field, direction: "asc" };
    });
  }

  function handleCellClick(rowId: number, field: string, value: string) {
    setEditingCell({ rowId, field });
    setEditValue(value);
  }

  function handleCellBlur() {
    if (editingCell) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editingCell.rowId
            ? { ...r, cells: { ...r.cells, [editingCell.field]: editValue } }
            : r
        )
      );
      onCellEdit?.(editingCell.rowId, editingCell.field, editValue);
      setEditingCell(null);
    }
  }

  function handleCellKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCellBlur();
    } else if (e.key === "Escape") {
      setEditingCell(null);
    } else if (e.key === "Tab") {
      e.preventDefault();
      handleCellBlur();
    }
  }

  function handleSelectRow(rowId: number, e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (e.shiftKey && prev.size > 0) {
        const lastSelected = Array.from(prev).pop()!;
        const allRowIds = filteredRows.map((r) => r.id);
        const startIdx = allRowIds.indexOf(lastSelected);
        const endIdx = allRowIds.indexOf(rowId);
        const [lo, hi] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
        for (let i = lo; i <= hi; i++) next.add(allRowIds[i]);
      } else if (e.ctrlKey || e.metaKey) {
        if (next.has(rowId)) next.delete(rowId);
        else next.add(rowId);
      } else {
        next.clear();
        next.add(rowId);
      }
      return next;
    });
  }

  function handleSelectAll() {
    if (selectedRows.size === filteredRows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredRows.map((r) => r.id)));
    }
  }

  function handleContextMenu(e: React.MouseEvent, columnId: string) {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, columnId });
  }

  function handleColumnResize(columnId: string, startX: number) {
    const col = columns.find((c) => c.id === columnId);
    if (!col) return;

    const startWidth = col.width;

    function onMouseMove(e: MouseEvent) {
      const delta = e.clientX - startX;
      const newWidth = Math.max(50, startWidth + delta);
      setColumns((prev) =>
        prev.map((c) => (c.id === columnId ? { ...c, width: newWidth } : c))
      );
    }

    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  function handleStartRename(columnId: string) {
    const col = columns.find((c) => c.id === columnId);
    if (!col) return;
    setRenamingColumn(columnId);
    setRenameValue(col.label);
    setContextMenu(null);
  }

  function handleFinishRename() {
    if (renamingColumn && renameValue.trim()) {
      setColumns((prev) =>
        prev.map((c) => (c.id === renamingColumn ? { ...c, label: renameValue.trim() } : c))
      );
    }
    setRenamingColumn(null);
  }

  function toggleColumnVisibility(columnId: string) {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, visible: !c.visible } : c))
    );
    setContextMenu(null);
  }

  function addNewRow() {
    const newRow: Row = {
      id: Date.now(),
      cells: Object.fromEntries(columns.map((c) => [c.field, ""])),
    };
    setRows((prev) => [...prev, newRow]);
  }

  function deleteSelectedRows() {
    if (selectedRows.size === 0) return;
    const ids = Array.from(selectedRows);
    setRows((prev) => prev.filter((r) => !selectedRows.has(r.id)));
    setSelectedRows(new Set());
    onRowsDelete?.(ids);
  }

  function addNewColumn() {
    const name = prompt("Enter column name:");
    if (!name?.trim()) return;
    const id = name.trim().toLowerCase().replace(/\s+/g, "_");
    setColumns((prev) => [
      ...prev,
      { id, label: name.trim(), width: 150, visible: true, field: id },
    ]);
  }

  function highlightText(text: string) {
    if (!searchQuery) return text;
    const q = searchQuery.toLowerCase();
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-yellow-200 dark:bg-yellow-900/40 text-foreground rounded-sm">{text.slice(idx, idx + q.length)}</mark>
        {text.slice(idx + q.length)}
      </>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-lg bg-background">
      <div className="flex items-center gap-2 p-2 border-b flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search cells..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {selectedRows.size > 0 && (
            <span className="text-xs text-muted-foreground">
              {selectedRows.size} row{selectedRows.size !== 1 ? "s" : ""} selected
            </span>
          )}
          <button
            onClick={addNewColumn}
            className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Column
          </button>
          <button
            onClick={addNewRow}
            className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Row
          </button>
          {selectedRows.size > 0 && (
            <button
              onClick={deleteSelectedRows}
              className="inline-flex items-center gap-1.5 rounded-md border border-destructive/50 bg-background px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
          <button
            onClick={() => setShowColumnManager(!showColumnManager)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary",
              showColumnManager && "bg-secondary"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Columns
          </button>
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {showColumnManager && (
        <div className="border-b p-3 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">Toggle Columns</p>
          <div className="flex flex-wrap gap-2">
            {columns.map((col) => (
              <button
                key={col.id}
                onClick={() => toggleColumnVisibility(col.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                  col.visible
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-background text-muted-foreground"
                )}
              >
                {col.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                {col.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={tableRef} className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm" style={{ minWidth: "100%" }}>
          <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
            <tr>
              <th className="border border-border w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.size === filteredRows.length && filteredRows.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-input"
                />
              </th>
              {visibleColumns.map((col) => (
                <th
                  key={col.id}
                  className="border border-border text-left text-xs font-medium text-muted-foreground select-none relative group"
                  style={{ width: col.width, minWidth: col.width }}
                >
                  <div className="flex items-center gap-1 px-2 py-2">
                    {renamingColumn === col.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleFinishRename();
                            if (e.key === "Escape") setRenamingColumn(null);
                          }}
                          onBlur={handleFinishRename}
                          autoFocus
                          className="h-6 w-full bg-background border rounded px-1 text-xs"
                        />
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSort(col.field)}
                          className="flex items-center gap-1 flex-1 text-left hover:text-foreground"
                          onContextMenu={(e) => handleContextMenu(e, col.id)}
                          onDoubleClick={() => handleStartRename(col.id)}
                        >
                          {col.label}
                          {sortConfig?.field === col.field ? (
                            sortConfig.direction === "asc" ? (
                              <ArrowUp className="h-3 w-3 shrink-0" />
                            ) : (
                              <ArrowDown className="h-3 w-3 shrink-0" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-50" />
                          )}
                        </button>
                        <button
                          onClick={() => handleContextMenu(
                            { clientX: 0, clientY: 0, preventDefault: () => {} } as React.MouseEvent,
                            col.id
                          )}
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <GripVertical className="h-3 w-3" />
                        </button>
                      </>
                    )}
                    <div
                      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/50 opacity-0 group-hover:opacity-100"
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        handleColumnResize(col.id, e.clientX);
                      }}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + 1}
                  className="text-center py-12 text-muted-foreground"
                >
                  {searchQuery ? "No matching results" : "No data yet. Add a row to get started."}
                </td>
              </tr>
            ) : (
              filteredRows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "group hover:bg-muted/50 cursor-pointer",
                    selectedRows.has(row.id) && "bg-primary/5"
                  )}
                  onClick={() => onRowClick?.(row.id)}
                >
                  <td className="border border-border text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row.id)}
                      onChange={() => {}}
                      onClick={(e) => handleSelectRow(row.id, e)}
                      className="rounded border-input"
                    />
                  </td>
                  {visibleColumns.map((col) => {
                    const cellValue = row.cells[col.field] ?? "";
                    const isEditing =
                      editingCell?.rowId === row.id && editingCell?.field === col.field;

                    return (
                      <td
                        key={col.id}
                        className={cn(
                          "border border-border px-2 py-1.5 text-sm",
                          isEditing && "ring-2 ring-primary ring-inset"
                        )}
                        style={{ width: col.width, minWidth: col.width }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCellClick(row.id, col.field, cellValue);
                        }}
                      >
                        {isEditing ? (
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleCellKeyDown}
                            className="w-full h-7 bg-background border-0 px-1 text-sm outline-none ring-0"
                          />
                        ) : (
                          <span className="truncate block max-w-full">
                            {highlightText(cellValue)}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t px-3 py-2 text-xs text-muted-foreground">
        <span>
          {filteredRows.length} row{filteredRows.length !== 1 ? "s" : ""}
          {searchQuery && ` (filtered from ${rows.length})`}
        </span>
        <span>
          {visibleColumns.length} column{visibleColumns.length !== 1 ? "s" : ""}
        </span>
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 rounded-md border bg-background shadow-lg py-1 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary flex items-center gap-2"
            onClick={() => handleStartRename(contextMenu.columnId)}
          >
            Rename Column
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary flex items-center gap-2"
            onClick={() => toggleColumnVisibility(contextMenu.columnId)}
          >
            Hide Column
          </button>
          <div className="border-t my-1" />
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary flex items-center gap-2"
            onClick={() => {
              handleSort(contextMenu.columnId);
              setContextMenu(null);
            }}
          >
            Sort A to Z
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-sm hover:bg-secondary flex items-center gap-2"
            onClick={() => {
              setSortConfig({ field: contextMenu.columnId, direction: "desc" });
              setContextMenu(null);
            }}
          >
            Sort Z to A
          </button>
        </div>
      )}
    </div>
  );
}
