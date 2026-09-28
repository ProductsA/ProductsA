import { google, type sheets_v4 } from "googleapis";

export function getSheetsClient(serviceAccountKey: string): sheets_v4.Sheets {
  const credentials = JSON.parse(serviceAccountKey);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export async function testConnection(serviceAccountKey: string, spreadsheetId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const sheets = getSheetsClient(serviceAccountKey);
    await sheets.spreadsheets.get({ spreadsheetId, fields: "spreadsheetId,properties.title" });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function listSheets(serviceAccountKey: string, spreadsheetId: string): Promise<{ sheets: { title: string; sheetId: number }[]; error?: string }> {
  try {
    const sheets = getSheetsClient(serviceAccountKey);
    const res = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties" });
    const sheetProps = res.data.sheets?.map((s) => ({
      title: s.properties?.title || "Untitled",
      sheetId: s.properties?.sheetId ?? 0,
    })) || [];
    return { sheets: sheetProps };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { sheets: [], error: message };
  }
}

export async function createSheet(serviceAccountKey: string, spreadsheetId: string, title: string): Promise<{ success: boolean; sheetId?: number; error?: string }> {
  try {
    const sheets = getSheetsClient(serviceAccountKey);
    const res = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }],
      },
    });
    const sheetId = res.data.replies?.[0]?.addSheet?.properties?.sheetId ?? undefined;
    return { success: true, sheetId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function renameSheet(serviceAccountKey: string, spreadsheetId: string, sheetId: number, newTitle: string): Promise<{ success: boolean; error?: string }> {
  try {
    const sheets = getSheetsClient(serviceAccountKey);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ updateSheetProperties: { properties: { sheetId, title: newTitle }, fields: "title" } }],
      },
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function deleteSheet(serviceAccountKey: string, spreadsheetId: string, sheetId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const sheets = getSheetsClient(serviceAccountKey);
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ deleteSheet: { sheetId } }],
      },
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function appendRow(
  serviceAccountKey: string,
  spreadsheetId: string,
  sheetName: string,
  values: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const sheets = getSheetsClient(serviceAccountKey);
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [values] },
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function getAllRows(
  serviceAccountKey: string,
  spreadsheetId: string,
  sheetName: string
): Promise<{ rows: string[][]; error?: string }> {
  try {
    const sheets = getSheetsClient(serviceAccountKey);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
    return { rows: res.data.values || [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { rows: [], error: message };
  }
}

export async function updateRow(
  serviceAccountKey: string,
  spreadsheetId: string,
  sheetName: string,
  rowIndex: number,
  values: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const sheets = getSheetsClient(serviceAccountKey);
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function styleDataRows(
  serviceAccountKey: string,
  spreadsheetId: string,
  sheetName: string,
  totalRows: number
): Promise<void> {
  try {
    const sheets = getSheetsClient(serviceAccountKey);
    const headerRes = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties",
    });
    const sheetProps = headerRes.data.sheets?.find((s) => s.properties?.title === sheetName);
    const sheetId = sheetProps?.properties?.sheetId;
    if (sheetId === undefined || sheetId === null) return;
    if (totalRows <= 1) return;

    const requests: sheets_v4.Schema$Request[] = [];

    for (let i = 1; i < totalRows; i++) {
      const isEven = i % 2 === 0;
      requests.push({
        repeatCell: {
          range: { sheetId, startRowIndex: i, endRowIndex: i + 1 },
          cell: {
            userEnteredFormat: {
              backgroundColor: isEven
                ? { red: 0.95, green: 0.96, blue: 0.98 }
                : { red: 1, green: 1, blue: 1 },
              textFormat: { fontSize: 10 },
              verticalAlignment: "MIDDLE",
              padding: { top: 4, bottom: 4, left: 6, right: 6 },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,padding)",
        },
      });
    }

    requests.push({
      updateSheetProperties: {
        properties: {
          sheetId,
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 20,
          },
        },
        fields: "gridProperties.frozenRowCount,gridProperties.columnCount",
      },
    });

    const BATCH_SIZE = 100;
    for (let i = 0; i < requests.length; i += BATCH_SIZE) {
      const batch = requests.slice(i, i + BATCH_SIZE);
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: batch },
      });
    }
  } catch {}
}

export async function ensureHeaderRow(
  serviceAccountKey: string,
  spreadsheetId: string,
  sheetName: string,
  headers: string[]
): Promise<void> {
  try {
    const sheets = getSheetsClient(serviceAccountKey);
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:A1`,
    });
    const existing = res.data.values?.[0];
    if (!existing || existing.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: [headers] },
      });

      const headerRes = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets.properties",
      });
      const sheetProps = headerRes.data.sheets?.find((s) => s.properties?.title === sheetName);
      const sheetId = sheetProps?.properties?.sheetId;
      if (sheetId !== undefined && sheetId !== null) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: [
              {
                repeatCell: {
                  range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.15, green: 0.22, blue: 0.45 },
                      textFormat: {
                        foregroundColor: { red: 1, green: 1, blue: 1 },
                        bold: true,
                        fontSize: 11,
                      },
                      horizontalAlignment: "CENTER",
                      verticalAlignment: "MIDDLE",
                      padding: { top: 8, bottom: 8, left: 6, right: 6 },
                    },
                  },
                  fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)",
                },
              },
              {
                updateSheetProperties: {
                  properties: { sheetId, gridProperties: { frozenRowCount: 1 } },
                  fields: "gridProperties.frozenRowCount",
                },
              },
            ],
          },
        });
      }
    }
  } catch {}
}
