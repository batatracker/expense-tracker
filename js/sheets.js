// ============================================================
// Sheets module — Google Sheets API v4
// All expense data lives in one Google Sheet.
// ============================================================

const Sheets = (function () {
  const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
  const DRIVE_BASE = 'https://www.googleapis.com/drive/v3';

  // Authenticated fetch with status-error throwing
  async function _req(url, options = {}) {
    const token = Auth.getToken();
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw { status: res.status, body };
    }
    return res.json();
  }

  // ---- Sheet bootstrap ----

  async function findOrCreateSheet(existingId) {
    // Verify stored ID still exists
    if (existingId) {
      try {
        await _req(`${BASE}/${existingId}?fields=spreadsheetId`);
        return existingId;
      } catch (err) {
        if (err.status !== 404) throw err;
        // 404 — fall through to search/create
      }
    }

    // Search Drive for existing sheet by name
    const token = Auth.getToken();
    const q = encodeURIComponent(`name='${CONFIG.SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`);
    const searchRes = await fetch(`${DRIVE_BASE}/files?q=${q}&fields=files(id,name)`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!searchRes.ok) throw { status: searchRes.status };
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
      const sheetId = searchData.files[0].id;
      localStorage.setItem('et_sheet_id', sheetId);
      return sheetId;
    }

    // Create a new sheet with frozen header row
    const created = await _req(BASE, {
      method: 'POST',
      body: JSON.stringify({
        properties: { title: CONFIG.SHEET_NAME },
        sheets: [{
          properties: {
            title: 'Expenses',
            gridProperties: { frozenRowCount: 1 },
          },
        }],
      }),
    });
    const sheetId = created.spreadsheetId;
    await writeHeader(sheetId);
    localStorage.setItem('et_sheet_id', sheetId);
    return sheetId;
  }

  async function writeHeader(sheetId) {
    // Write column header row
    await _req(`${BASE}/${sheetId}/values/Expenses!A1:I1?valueInputOption=RAW`, {
      method: 'PUT',
      body: JSON.stringify({
        range: 'Expenses!A1:I1',
        majorDimension: 'ROWS',
        values: [CONFIG.SHEET_COLUMNS],
      }),
    });

    // Bold + color header row, auto-resize columns
    await _req(`${BASE}/${sheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  textFormat: { bold: true, fontSize: 11 },
                  backgroundColor: { red: 0.357, green: 0.31, blue: 0.914 },
                  foregroundColorStyle: { rgbColor: { red: 1, green: 1, blue: 1 } },
                  horizontalAlignment: 'CENTER',
                },
              },
              fields: 'userEnteredFormat(textFormat,backgroundColor,foregroundColorStyle,horizontalAlignment)',
            },
          },
          {
            autoResizeDimensions: {
              dimensions: { sheetId: 0, dimension: 'COLUMNS', startIndex: 0, endIndex: 9 },
            },
          },
        ],
      }),
    });
  }

  // ---- Read ----

  async function readAllExpenses(sheetId) {
    const data = await _req(`${BASE}/${sheetId}/values/Expenses?majorDimension=ROWS`);
    const rows = data.values || [];
    if (rows.length <= 1) return [];

    // Build column→index map from header row (case-insensitive, trim whitespace)
    const header = rows[0].map((h) => h.trim().toLowerCase());
    const col = (name) => header.indexOf(name.toLowerCase());

    return rows.slice(1)
      .map((row) => ({
        id:         (row[col('id')] || '').trim(),
        date:       (row[col('date')] || '').trim(),
        amount:     (row[col('amount')] || '0').trim(),
        currency:   (row[col('currency')] || 'USD').trim(),
        category:   (row[col('category')] || '').trim(),
        merchant:   (row[col('merchant')] || '').trim(),
        notes:      (row[col('notes')] || '').trim(),
        receiptUrl: (row[col('receipt url')] || '').trim(),
        createdAt:  (row[col('created at')] || '').trim(),
      }))
      .filter((e) => e.id);
  }

  // ---- Write ----

  async function appendExpense(sheetId, expense) {
    await _req(
      `${BASE}/${sheetId}/values/Expenses:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        body: JSON.stringify({
          range: 'Expenses',
          majorDimension: 'ROWS',
          values: [_toRow(expense)],
        }),
      }
    );
  }

  async function updateExpense(sheetId, expense) {
    // rowIndex is 0-based sheet row number (header = 0, first data = 1, ...)
    const rowIndex = await _findRowIndex(sheetId, expense.id);
    if (rowIndex === -1) throw new Error('Expense row not found in sheet');
    const rowNum = rowIndex + 1; // Convert to 1-based A1 notation
    await _req(
      `${BASE}/${sheetId}/values/Expenses!A${rowNum}:I${rowNum}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        body: JSON.stringify({
          range: `Expenses!A${rowNum}:I${rowNum}`,
          majorDimension: 'ROWS',
          values: [_toRow(expense)],
        }),
      }
    );
  }

  async function deleteExpense(sheetId, id) {
    // rowIndex is 0-based (header at 0, first data at 1)
    const rowIndex = await _findRowIndex(sheetId, id);
    if (rowIndex === -1) throw new Error('Expense row not found in sheet');

    // Need the tab's internal sheet ID (not the spreadsheet ID)
    const meta = await _req(`${BASE}/${sheetId}?fields=sheets(properties(sheetId,title))`);
    const tabId = meta.sheets[0].properties.sheetId;

    await _req(`${BASE}/${sheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          deleteDimension: {
            range: {
              sheetId: tabId,
              dimension: 'ROWS',
              startIndex: rowIndex,       // 0-based
              endIndex: rowIndex + 1,
            },
          },
        }],
      }),
    });
  }

  // ---- Helpers ----

  // Returns 0-based sheet row index (header=0, first data=1, ...)
  async function _findRowIndex(sheetId, id) {
    const data = await _req(`${BASE}/${sheetId}/values/Expenses!A:A`);
    const rows = data.values || [];
    for (let i = 1; i < rows.length; i++) {
      if (rows[i] && rows[i][0] === id) return i;
    }
    return -1;
  }

  function _toRow(e) {
    return [
      e.id,
      e.date,
      e.amount,
      e.currency,
      e.category,
      e.merchant,
      e.notes,
      e.receiptUrl,
      e.createdAt,
    ];
  }

  return {
    findOrCreateSheet,
    writeHeader,
    readAllExpenses,
    appendExpense,
    updateExpense,
    deleteExpense,
  };
})();
