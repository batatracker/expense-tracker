// ============================================================
// appscript.js — No-OAuth backend via Google Apps Script
// All API calls use a simple GET request (no auth headers,
// no CORS pre-flight) to a deployed Apps Script web app.
// ============================================================

const AppScript = (() => {
  let _scriptUrl = null;

  function init(url) {
    _scriptUrl = url;
  }

  async function _call(payload) {
    if (!_scriptUrl) throw new Error('AppScript not initialized. Call AppScript.init(url) first.');
    const url = _scriptUrl + '?p=' + encodeURIComponent(JSON.stringify(payload));
    const res = await fetch(url);
    if (!res.ok) throw { status: res.status };
    const json = await res.json();
    if (json.error) throw new Error(json.error);
    return json;
  }

  async function ping() {
    const json = await _call({ action: 'ping' });
    return json.status === 'ok';
  }

  // "Jun 22, 2026" (or any parseable date) → "2026-06-22"
  // Already-ISO strings pass through unchanged.
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

  async function readAllExpenses() {
    const json = await _call({ action: 'read' });
    return (json.expenses || []).map(e => ({ ...e, date: _toIso(e.date) }));
  }

  async function appendExpense(expense) {
    return _call({ action: 'append', expense });
  }

  async function updateExpense(expense) {
    return _call({ action: 'update', expense });
  }

  async function deleteExpense(id) {
    return _call({ action: 'delete', id });
  }

  const SCRIPT_SOURCE = `// ExpenseTracker — Apps Script backend
// Deploy: Extensions → Apps Script → Deploy → New deployment
//   Type: Web app | Execute as: Me | Who has access: Anyone
var COLS = ['ID','Date','Amount','Currency','Category','Merchant','Notes','Receipt URL','Created At'];
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function doGet(e) {
  if (!e.parameter.p) return ok({ status: 'ok', app: 'ExpenseTracker' });
  try {
    var d = JSON.parse(e.parameter.p);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (d.action === 'ping')   return ok({ status: 'ok' });
    if (d.action === 'read')   return ok(readAll(ss));
    if (d.action === 'append') return ok(appendRow(ss, d.expense));
    if (d.action === 'update') return ok(updateRow(ss, d.expense));
    if (d.action === 'delete') return ok(deleteRow(ss, d.id));
    return ok({ error: 'Unknown action' });
  } catch(err) { return ok({ error: err.toString() }); }
}

function ok(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function readAll(ss) {
  var pat = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \\d{4}$/;
  var out = [];
  ss.getSheets().forEach(function(sh) {
    if (!pat.test(sh.getName())) return;
    var rows = sh.getDataRange().getValues();
    if (rows.length < 2) return;
    var h = rows[0].map(function(c){ return c.toString().toLowerCase().trim(); });
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i], id = (r[ci(h,'id')]||'').toString().trim();
      if (!id) continue;
      out.push({ id:id, date:toIso((r[ci(h,'date')]||'').toString().trim()),
        amount:(r[ci(h,'amount')]||'0').toString().trim(),
        currency:(r[ci(h,'currency')]||'').toString().trim(),
        category:(r[ci(h,'category')]||'').toString().trim(),
        merchant:(r[ci(h,'merchant')]||'').toString().trim(),
        notes:(r[ci(h,'notes')]||'').toString().trim(),
        receiptUrl:(r[ci(h,'receipt url')]||'').toString().trim(),
        createdAt:(r[ci(h,'created at')]||'').toString().trim() });
    }
  });
  return { expenses: out };
}

function pad2(n) { return n < 10 ? '0'+n : ''+n; }
function toIso(d) {
  if (!d) return '';
  if (/^\\d{4}-\\d{2}-\\d{2}$/.test(d)) return d;
  var dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.getFullYear() + '-' + pad2(dt.getMonth()+1) + '-' + pad2(dt.getDate());
}

function appendRow(ss, e) {
  var sh = ensureSheet(ss, monthName(e.date));
  sh.appendRow([e.id, fmtDate(e.date), parseFloat(e.amount)||0,
    e.currency||'', e.category||'', e.merchant||'',
    e.notes||'', e.receiptUrl||'', e.createdAt||'']);
  return { ok: true };
}

function updateRow(ss, e) {
  var loc = findRow(ss, e.id);
  if (!loc) return { error: 'Not found' };
  loc.sh.getRange(loc.row,1,1,9).setValues([[e.id, fmtDate(e.date),
    parseFloat(e.amount)||0, e.currency||'', e.category||'',
    e.merchant||'', e.notes||'', e.receiptUrl||'', e.createdAt||'']]);
  return { ok: true };
}

function deleteRow(ss, id) {
  var loc = findRow(ss, id);
  if (!loc) return { error: 'Not found' };
  loc.sh.deleteRow(loc.row);
  return { ok: true };
}

function findRow(ss, id) {
  var pat = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \\d{4}$/;
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var sh = sheets[i];
    if (!pat.test(sh.getName())) continue;
    var col = sh.getRange('A:A').getValues();
    for (var r = 1; r < col.length; r++) {
      if (col[r][0] === id) return { sh: sh, row: r+1 };
    }
  }
  return null;
}

function ensureSheet(ss, name) {
  var sh = ss.getSheetByName(name);
  if (sh) return sh;
  sh = ss.insertSheet(name);
  var rng = sh.getRange(1,1,1,COLS.length);
  rng.setValues([COLS]).setFontWeight('bold')
     .setBackground('#5b4fe9').setFontColor('#ffffff')
     .setHorizontalAlignment('center');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, COLS.length);
  return sh;
}

function monthName(iso) {
  if (!iso) return 'Expenses';
  var p = iso.split('-');
  return MONTHS[parseInt(p[1],10)-1] + ' ' + p[0];
}

function fmtDate(iso) {
  if (!iso) return '';
  var p = iso.split('-').map(Number);
  return new Date(p[0],p[1]-1,p[2]).toLocaleDateString('en-US',
    {month:'short',day:'numeric',year:'numeric'});
}

function ci(h, name) { var i=h.indexOf(name); return i>=0?i:999; }`;

  return {
    init,
    ping,
    readAllExpenses,
    appendExpense,
    updateExpense,
    deleteExpense,
    SCRIPT_SOURCE,
  };
})();
