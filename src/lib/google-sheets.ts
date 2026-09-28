import { prisma } from "@/lib/prisma";
import { appendRow, ensureHeaderRow, getAllRows, updateRow, styleDataRows } from "@/lib/google-api";

const REQUEST_HEADERS = [
  "Request ID", "Date", "Time", "Product", "First Name", "Last Name",
  "Email", "Phone", "Address", "City", "Region",
  "Postal Code", "Country", "Gender", "Selected Variations",
  "Custom Fields", "Status", "Notes", "Device ID", "Created At"
];

const REQUEST_ID_COL_INDEX = 0;

export interface SheetRow {
  requestId: string;
  date: string;
  time: string;
  product: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  gender: string;
  selectedVariations: string;
  customFieldValues: string;
  requestStatus: string;
  notes: string;
  deviceId: string;
  createdAt: string;
}

function rowToValues(row: SheetRow): string[] {
  return [
    row.requestId,
    row.date,
    row.time,
    row.product,
    row.firstName,
    row.lastName,
    row.email,
    row.phone,
    row.address,
    row.city,
    row.region,
    row.postalCode,
    row.country,
    row.gender,
    row.selectedVariations,
    row.customFieldValues,
    row.requestStatus,
    row.notes,
    row.deviceId,
    row.createdAt,
  ];
}

function logSync(
  level: "info" | "warn" | "error",
  message: string,
  context: Record<string, unknown>
) {
  const entry = { timestamp: new Date().toISOString(), level, ...context };
  if (level === "error") {
    console.error(`[GSheetsSync] ${message}`, JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(`[GSheetsSync] ${message}`, JSON.stringify(entry));
  } else {
    console.log(`[GSheetsSync] ${message}`, JSON.stringify(entry));
  }
}

export async function sendToGoogleSheets(
  row: SheetRow,
  customerRequestId: number
): Promise<{ success: boolean; error?: string }> {
  const spreadsheet = await prisma.googleSpreadsheet.findFirst({
    where: { isActive: true },
  });

  if (!spreadsheet) {
    await prisma.customerRequest.update({
      where: { id: customerRequestId },
      data: { syncStatus: "failed", syncError: "No active Google Spreadsheet configured" },
    });
    return { success: false, error: "No active Google Spreadsheet configured" };
  }

  if (!spreadsheet.selectedSheetName) {
    await prisma.customerRequest.update({
      where: { id: customerRequestId },
      data: { syncStatus: "failed", syncError: "No destination sheet selected" },
    });
    return { success: false, error: "No destination sheet selected" };
  }

  const values = rowToValues(row);

  try {
    await ensureHeaderRow(
      spreadsheet.serviceAccountKey,
      spreadsheet.spreadsheetId,
      spreadsheet.selectedSheetName,
      REQUEST_HEADERS
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    logSync("error", "ensureHeaderRow failed", {
      customerRequestId,
      requestId: row.requestId,
      spreadsheetId: spreadsheet.spreadsheetId,
      sheetName: spreadsheet.selectedSheetName,
      error: msg,
    });
    await prisma.customerRequest.update({
      where: { id: customerRequestId },
      data: { syncStatus: "failed", syncError: `Header row setup failed: ${msg}` },
    });
    return { success: false, error: `Header row setup failed: ${msg}` };
  }

  const existingRows = await getAllRows(
    spreadsheet.serviceAccountKey,
    spreadsheet.spreadsheetId,
    spreadsheet.selectedSheetName
  );

  if (existingRows.error) {
    logSync("warn", "Could not read existing rows for dedup check", {
      customerRequestId,
      requestId: row.requestId,
      spreadsheetId: spreadsheet.spreadsheetId,
      sheetName: spreadsheet.selectedSheetName,
      error: existingRows.error,
    });
  }

  const duplicateRowIndex = existingRows.rows.findIndex(
    (r, i) => i > 0 && r[REQUEST_ID_COL_INDEX] === row.requestId
  );

  if (duplicateRowIndex > -1) {
    const sheetRowNumber = duplicateRowIndex + 1;
    logSync("info", "Duplicate requestId found, updating existing row", {
      customerRequestId,
      requestId: row.requestId,
      spreadsheetId: spreadsheet.spreadsheetId,
      sheetName: spreadsheet.selectedSheetName,
      sheetRow: sheetRowNumber,
    });

    const updateResult = await updateRow(
      spreadsheet.serviceAccountKey,
      spreadsheet.spreadsheetId,
      spreadsheet.selectedSheetName,
      sheetRowNumber,
      values
    );

    if (!updateResult.success) {
      logSync("error", "Failed to update existing row", {
        customerRequestId,
        requestId: row.requestId,
        spreadsheetId: spreadsheet.spreadsheetId,
        sheetName: spreadsheet.selectedSheetName,
        error: updateResult.error,
      });
      await prisma.customerRequest.update({
        where: { id: customerRequestId },
        data: { syncStatus: "failed", syncError: `Update failed: ${updateResult.error}` },
      });
      return { success: false, error: updateResult.error };
    }

    await prisma.customerRequest.update({
      where: { id: customerRequestId },
      data: {
        syncStatus: "synced",
        syncedAt: new Date(),
        syncError: null,
        googleSheetRow: sheetRowNumber,
      },
    });

    logSync("info", "Existing row updated successfully", {
      customerRequestId,
      requestId: row.requestId,
      spreadsheetId: spreadsheet.spreadsheetId,
      sheetName: spreadsheet.selectedSheetName,
      sheetRow: sheetRowNumber,
    });

    return { success: true };
  }

  const appendResult = await appendRow(
    spreadsheet.serviceAccountKey,
    spreadsheet.spreadsheetId,
    spreadsheet.selectedSheetName,
    values
  );

  if (!appendResult.success) {
    logSync("error", "Failed to append row", {
      customerRequestId,
      requestId: row.requestId,
      spreadsheetId: spreadsheet.spreadsheetId,
      sheetName: spreadsheet.selectedSheetName,
      error: appendResult.error,
    });
    await prisma.customerRequest.update({
      where: { id: customerRequestId },
      data: { syncStatus: "failed", syncError: appendResult.error || "Append failed" },
    });
    return { success: false, error: appendResult.error };
  }

  const newRowCount = existingRows.rows.length;
  const newRowNumber = newRowCount;

  await prisma.customerRequest.update({
    where: { id: customerRequestId },
    data: {
      syncStatus: "synced",
      syncedAt: new Date(),
      syncError: null,
      googleSheetRow: newRowNumber,
    },
  });

  await prisma.googleSpreadsheet.update({
    where: { id: spreadsheet.id },
    data: { lastSyncAt: new Date() },
  });

  logSync("info", "Row appended successfully", {
    customerRequestId,
    requestId: row.requestId,
    spreadsheetId: spreadsheet.spreadsheetId,
    sheetName: spreadsheet.selectedSheetName,
    sheetRow: newRowNumber,
  });

  return { success: true };
}

export async function syncSingleRequest(
  requestId: string
): Promise<{ success: boolean; error?: string }> {
  const customerRequest = await prisma.customerRequest.findUnique({
    where: { requestId },
    include: { customer: true, product: true },
  });

  if (!customerRequest) {
    return { success: false, error: `Request ${requestId} not found` };
  }

  const customValues = await prisma.customFieldValue.findMany({
    where: { customerId: customerRequest.customerId },
    include: { field: true },
  });

  const customFieldLabels = customValues.map(
    (cv) => `${cv.field.fieldName}: ${cv.value}`
  );

  const now = customerRequest.submittedAt;
  const sheetRow: SheetRow = {
    requestId: customerRequest.requestId,
    date: now.toLocaleDateString("fr-FR"),
    time: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    product: customerRequest.product.name,
    firstName: customerRequest.customer.firstName,
    lastName: customerRequest.customer.lastName || "",
    email: customerRequest.customer.email || "",
    phone: customerRequest.customer.phone || "",
    address: customerRequest.customer.address || "",
    city: customerRequest.customer.city || "",
    region: customerRequest.customer.region || "",
    postalCode: customerRequest.customer.postalCode || "",
    country: customerRequest.customer.country || "",
    gender: customerRequest.customer.gender || "",
    selectedVariations: customerRequest.variation || "",
    customFieldValues: customFieldLabels.join("; "),
    requestStatus: customerRequest.status,
    notes: customerRequest.notes || "",
    deviceId: customerRequest.customer.deviceId || "",
    createdAt: customerRequest.submittedAt.toISOString(),
  };

  return sendToGoogleSheets(sheetRow, customerRequest.id);
}

export async function syncAllPending(): Promise<{
  synced: number;
  failed: number;
  errors: string[];
}> {
  const pendingRequests = await prisma.customerRequest.findMany({
    where: {
      syncStatus: { in: ["pending", "failed"] },
    },
    orderBy: { submittedAt: "asc" },
  });

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const req of pendingRequests) {
    const result = await syncSingleRequest(req.requestId);
    if (result.success) {
      synced++;
    } else {
      failed++;
      errors.push(`${req.requestId}: ${result.error}`);
    }
  }

  return { synced, failed, errors };
}

export async function retryFailed(): Promise<{
  synced: number;
  failed: number;
  errors: string[];
}> {
  const failedRequests = await prisma.customerRequest.findMany({
    where: { syncStatus: "failed" },
    orderBy: { submittedAt: "asc" },
  });

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const req of failedRequests) {
    await prisma.customerRequest.update({
      where: { id: req.id },
      data: { syncStatus: "pending", syncError: null },
    });

    const result = await syncSingleRequest(req.requestId);
    if (result.success) {
      synced++;
    } else {
      failed++;
      errors.push(`${req.requestId}: ${result.error}`);
    }
  }

  return { synced, failed, errors };
}

export async function getSyncStats(spreadsheetId?: number) {
  const where = spreadsheetId ? {} : {};

  const total = await prisma.customerRequest.count({ where });
  const synced = await prisma.customerRequest.count({ where: { ...where, syncStatus: "synced" } });
  const pending = await prisma.customerRequest.count({ where: { ...where, syncStatus: "pending" } });
  const failed = await prisma.customerRequest.count({ where: { ...where, syncStatus: "failed" } });

  return { total, synced, pending, failed };
}
