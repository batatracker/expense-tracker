// ============================================================
// Sheets module — Google Sheets API v4
// One tab per month (e.g. "Jun 2026"). Dates stored in human-
// readable format ("Jun 22, 2026"). Column order is irrelevant —
// the app maps by header name on every read.
// ============================================================

const Sheets = (function () {
  const BASE      = 'https://sheets.googleapis.com/v4/spreadsheets';
  const DRIVE_BASE = 'https://www.googleapis.com/drive/v3';

  // ---- Authenticated request ----

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

  // ---- Date helpers ----

  // "2026-06-22"  →  "Jun 22, 2026"
  function _isoToDisplay(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  }

  // "Jun 22, 2026" (or already ISO) → "2026-06-22"
  function _toIso(dateStr) {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // "2026-06-22" → "Jun 2026"  (used as the tab name)
  function _monthTabName(isoDate) {
    const [y, m] = isoDate.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', {
      month: 'short', year: 'numeric',
    });
  }

  // Build a Sheets A1-notation range string safe for use in a URL path.
  // Tab names with spaces are wrapped in single quotes and space→%20.
  //   _range('Jun 2026')          → "'Jun%202026'"
  //   _range('Jun 2026', 'A:A')   → "'Jun%202026'!A:A"
  function _range(tabName, cells) {
    const safe = "'" + tabName.replace(/ /g, '%20') + "'";
    return cells ? `${safe}!${cells}` : safe;
  }

  // ---- Tab metadata ----

  // Returns [{ title, sheetId }] for every monthly tab in the spreadsheet.
  async function _getMonthlyTabs(spreadsheetId) {
    const data = await _req(
      `${BASE}/${spreadsheetId}?fields=sheets(properties(sheetId,title))`
    );
    const pattern = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/;
    return (data.sheets || [])
      .map(s => s.properties)
      .filter(p => pattern.test(p.title));
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
    const q = encodeURIComponent(
      `name='${CONFIG.SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`
    );
    const searchRes = await fetch(`${DRIVE_BASE}/files?q=${q}&fields=files(id,name)`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!searchRes.ok) throw { status: searchRes.status };
    const { files = [] } = await searchRes.json();

    if (files.length > 0) {
      localStorage.setItem('et_sheet_id', files[0].id);
      return files[0].id;
    }

    // Create a fresh spreadsheet (Google adds a default "Sheet1" tab — ignored)
    const created = await _req(BASE, {
      method: 'POST',
      body: JSON.stringify({ properties: { title: CONFIG.SHEET_NAME } }),
    });
    localStorage.setItem('et_sheet_id', created.spreadsheetId);
    return created.spreadsheetId;
  }

  // Ensure a monthly tab exists; create + format it if missing.
  async function _ensureMonthTab(spreadsheetId, tabName) {
    const tabs = await _getMonthlyTabs(spreadsheetId);
    if (tabs.find(t => t.title === tabName)) return;

    // Create the tab with a frozen header row
    const result = await _req(`${BASE}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          addSheet: {
            properties: {
              title: tabName,
              gridProperties: { frozenRowCount: 1 },
            },
          },
        }],
      }),
    });
    const newTabSheetId = result.replies[0].addSheet.properties.sheetId;
    await _writeTabHeader(spreadsheetId, tabName, newTabSheetId);
  }

  async function _writeTabHeader(spreadsheetId, tabName, tabSheetId) {
    // Write column headers
    await _req(
      `${BASE}/${spreadsheetId}/values/${_range(tabName, 'A1:I1')}?valueInputOption=RAW`,
      {
        method: 'PUT',
        body: JSON.stringify({
          range: `'${tabName}'!A1:I1`,
          majorDimension: 'ROWS',
          values: [CONFIG.SHEET_COLUMNS],
        }),
      }
    );

    // Bold purple header + auto-resize columns
    await _req(`${BASE}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: { sheetId: tabSheetId, startRowIndex: 0, endRowIndex: 1 },
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
              dimensions: { sheetId: tabSheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 9 },
            },
          },
        ],
      }),
    });
  }

  // ---- Read ----

  async function readAllExpenses(spreadsheetId) {
    const tabs = await _getMonthlyTabs(spreadsheetId);
    if (tabs.length === 0) return [];

    const all = [];
    for (const tab of tabs) {
      const data = await _req(
        `${BASE}/${spreadsheetId}/values/${_range(tab.title)}?majorDimension=ROWS`
      );
      const rows = data.values || [];
      if (rows.length <= 1) continue;

      const header = rows[0].map(h => h.trim().toLowerCase());
      const col = name => header.indexOf(name.toLowerCase());

      const expenses = rows.slice(1)
        .map(row => ({
          id:         (row[col('id')]          || '').trim(),
          date:       _toIso((row[col('date')] || '').trim()),
          amount:     (row[col('amount')]       || '0').toString().trim(),
          currency:   (row[col('currency')]     || '').trim(),
          category:   (row[col('category')]     || '').trim(),
          merchant:   (row[col('merchant')]     || '').trim(),
          notes:      (row[col('notes')]        || '').trim(),
          receiptUrl: (row[col('receipt url')]  || '').trim(),
          createdAt:  (row[col('created at')]   || '').trim(),
        }))
        .filter(e => e.id);

      all.push(...expenses);
    }

    // Newest first
    return all.sort((a, b) => (a.date > b.date ? -1 : 1));
  }

  // ---- Write ----

  async function appendExpense(spreadsheetId, expense) {
    const tabName = _monthTabName(expense.date);
    await _ensureMonthTab(spreadsheetId, tabName);

    await _req(
      `${BASE}/${spreadsheetId}/values/${_range(tabName)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: 'POST',
        body: JSON.stringify({
          range: `'${tabName}'`,
          majorDimension: 'ROWS',
          values: [_toRow(expense)],
        }),
      }
    );
  }

  async function updateExpense(spreadsheetId, expense) {
    const loc = await _findExpenseLocation(spreadsheetId, expense.id);
    if (!loc) throw new Error('Expense not found in sheet');
    const rowNum = loc.rowIndex + 1; // 1-based A1 row number
    await _req(
      `${BASE}/${spreadsheetId}/values/${_range(loc.tabName, `A${rowNum}:I${rowNum}`)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        body: JSON.stringify({
          range: `'${loc.tabName}'!A${rowNum}:I${rowNum}`,
          majorDimension: 'ROWS',
          values: [_toRow(expense)],
        }),
      }
    );
  }

  async function deleteExpense(spreadsheetId, id) {
    const loc = await _findExpenseLocation(spreadsheetId, id);
    if (!loc) throw new Error('Expense not found in sheet');

    await _req(`${BASE}/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      body: JSON.stringify({
        requests: [{
          deleteDimension: {
            range: {
              sheetId: loc.tabSheetId,
              dimension: 'ROWS',
              startIndex: loc.rowIndex,       // 0-based
              endIndex:   loc.rowIndex + 1,
            },
          },
        }],
      }),
    });
  }

  // ---- Helpers ----

  // Search all monthly tabs for an expense by ID.
  // Returns { tabName, tabSheetId, rowIndex } or null.
  async function _findExpenseLocation(spreadsheetId, expenseId) {
    const tabs = await _getMonthlyTabs(spreadsheetId);
    for (const tab of tabs) {
      const data = await _req(
        `${BASE}/${spreadsheetId}/values/${_range(tab.title, 'A:A')}`
      );
      const rows = data.values || [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i] && rows[i][0] === expenseId) {
          return { tabName: tab.title, tabSheetId: tab.sheetId, rowIndex: i };
        }
      }
    }
    return null;
  }

  // Serialize an expense object into the column order defined in CONFIG.SHEET_COLUMNS.
  // Date is stored human-friendly; amount as a plain number.
  function _toRow(e) {
    return [
      e.id         || '',
      _isoToDisplay(e.date),          // "Jun 22, 2026"
      Number(e.amount) || 0,
      e.currency   || '',
      e.category   || '',
      e.merchant   || '',
      e.notes      || '',
      e.receiptUrl || '',
      e.createdAt  || '',
    ];
  }

  return {
    findOrCreateSheet,
    readAllExpenses,
    appendExpense,
    updateExpense,
    deleteExpense,
  };
})();
