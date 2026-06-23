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

  // Returns the script's self-reported version number, or 1 if the deployed
  // script predates versioning (it won't have a 'version' field in the ping).
  async function getScriptVersion() {
    const json = await _call({ action: 'ping' });
    return typeof json.version === 'number' ? json.version : 1;
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

  async function getSheetUrl() {
    const json = await _call({ action: 'sheetUrl' });
    return json.url || null;
  }

  async function readAllDebts() {
    const json = await _call({ action: 'readDebts' });
    return (json.debts || []).map(d => ({ ...d, dueDate: _toIso(d.dueDate) }));
  }

  async function appendDebt(debt) {
    return _call({ action: 'appendDebt', debt });
  }

  async function updateDebt(debt) {
    return _call({ action: 'updateDebt', debt });
  }

  async function deleteDebt(id) {
    return _call({ action: 'deleteDebt', id });
  }

  async function readDebtPayments(debtId) {
    const json = await _call({ action: 'readDebtPayments', debtId });
    return (json.payments || []).map(p => ({ ...p, date: _toIso(p.date) }));
  }

  async function appendDebtPayment(payment) {
    return _call({ action: 'appendDebtPayment', payment });
  }

  async function deleteDebtPayment(id) {
    return _call({ action: 'deleteDebtPayment', id });
  }

  async function readAllIncome() {
    const json = await _call({ action: 'readIncome' });
    return (json.income || []).map(e => ({ ...e }));
  }

  async function appendIncomeEntry(entry) {
    return _call({ action: 'appendIncome', entry });
  }

  async function deleteIncomeEntry(id) {
    return _call({ action: 'deleteIncome', id });
  }

  const SCRIPT_SOURCE = `// ExpenseTracker — Apps Script backend
// Deploy: Extensions → Apps Script → Deploy → New deployment
//   Type: Web app | Execute as: Me | Who has access: Anyone
var SCRIPT_VERSION = 4;
var COLS = ['ID','Date','Amount','Currency','Category','Merchant','Notes','Receipt URL','Created At'];
var DEBT_COLS = ['ID','Source','Date','Total Amount','Outstanding Balance','Currency','Due Date','Notes','Status','Created At'];
var PAYMENT_COLS = ['ID','Debt ID','Amount','Currency','Date','Notes','Created At'];
var INCOME_COLS = ['ID','Type','Source','Amount','Currency','Date','Notes','Created At'];
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Returns the active spreadsheet (container-bound) or finds/creates one (standalone).
function getSpreadsheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (ss) return ss;
  // Standalone deployment: reuse a stored spreadsheet ID or create a new one.
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty('SPREADSHEET_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); } catch(e) {}
  }
  ss = SpreadsheetApp.create('ExpenseTracker');
  props.setProperty('SPREADSHEET_ID', ss.getId());
  return ss;
}

function doGet(e) {
  if (!e.parameter.p) return ok({ status: 'ok', app: 'ExpenseTracker', version: SCRIPT_VERSION });
  try {
    var d = JSON.parse(e.parameter.p);
    var ss = getSpreadsheet();
    if (d.action === 'ping')               return ok({ status: 'ok', version: SCRIPT_VERSION });
    if (d.action === 'sheetUrl')           return ok({ url: ss.getUrl() });
    if (d.action === 'read')               return ok(readAll(ss));
    if (d.action === 'append')             return ok(appendRow(ss, d.expense));
    if (d.action === 'update')             return ok(updateRow(ss, d.expense));
    if (d.action === 'delete')             return ok(deleteRow(ss, d.id));
    if (d.action === 'readDebts')          return ok(readDebts(ss));
    if (d.action === 'appendDebt')         return ok(appendDebt(ss, d.debt));
    if (d.action === 'updateDebt')         return ok(updateDebt(ss, d.debt));
    if (d.action === 'deleteDebt')         return ok(deleteDebtRow(ss, d.id));
    if (d.action === 'readDebtPayments')   return ok(readDebtPayments(ss, d.debtId));
    if (d.action === 'appendDebtPayment')  return ok(appendDebtPayment(ss, d.payment));
    if (d.action === 'deleteDebtPayment')  return ok(deleteDebtPaymentRow(ss, d.id));
    if (d.action === 'readIncome')         return ok(readIncome(ss));
    if (d.action === 'appendIncome')       return ok(appendIncome(ss, d.entry));
    if (d.action === 'deleteIncome')       return ok(deleteIncomeRow(ss, d.id));
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

function ci(h, name) { var i=h.indexOf(name); return i>=0?i:999; }

function readDebts(ss) {
  var sh = ss.getSheetByName('Debts');
  if (!sh) return { debts: [] };
  var rows = sh.getDataRange().getValues();
  if (rows.length < 2) return { debts: [] };
  var h = rows[0].map(function(c){ return c.toString().toLowerCase().trim(); });
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i], id = (r[ci(h,'id')]||'').toString().trim();
    if (!id) continue;
    out.push({ id:id, source:(r[ci(h,'source')]||'').toString().trim(),
      date:toIso((r[ci(h,'date')]||'').toString().trim()),
      totalAmount:(r[ci(h,'total amount')]||'0').toString().trim(),
      outstandingBalance:(r[ci(h,'outstanding balance')]||'0').toString().trim(),
      currency:(r[ci(h,'currency')]||'').toString().trim(),
      dueDate:(r[ci(h,'due date')]||'').toString().trim(),
      notes:(r[ci(h,'notes')]||'').toString().trim(),
      status:(r[ci(h,'status')]||'open').toString().trim(),
      createdAt:(r[ci(h,'created at')]||'').toString().trim() });
  }
  return { debts: out };
}

function appendDebt(ss, d) {
  var sh = ensureNamedSheet(ss, 'Debts', DEBT_COLS);
  sh.appendRow([d.id||'', d.source||'', d.date||'', parseFloat(d.totalAmount)||0,
    parseFloat(d.outstandingBalance)||0, d.currency||'', d.dueDate||'',
    d.notes||'', d.status||'open', d.createdAt||'']);
  return { ok: true };
}

function updateDebt(ss, d) {
  var loc = findRowInSheet(ss, 'Debts', d.id);
  if (!loc) return { error: 'Not found' };
  loc.sh.getRange(loc.row,1,1,DEBT_COLS.length).setValues([[d.id||'', d.source||'',
    d.date||'', parseFloat(d.totalAmount)||0, parseFloat(d.outstandingBalance)||0,
    d.currency||'', d.dueDate||'', d.notes||'', d.status||'open', d.createdAt||'']]);
  return { ok: true };
}

function deleteDebtRow(ss, id) {
  var loc = findRowInSheet(ss, 'Debts', id);
  if (!loc) return { error: 'Not found' };
  loc.sh.deleteRow(loc.row);
  return { ok: true };
}

function readDebtPayments(ss, debtId) {
  var sh = ss.getSheetByName('Debt Payments');
  if (!sh) return { payments: [] };
  var rows = sh.getDataRange().getValues();
  if (rows.length < 2) return { payments: [] };
  var h = rows[0].map(function(c){ return c.toString().toLowerCase().trim(); });
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i], id = (r[ci(h,'id')]||'').toString().trim();
    if (!id) continue;
    var pid = (r[ci(h,'debt id')]||'').toString().trim();
    if (debtId && pid !== debtId) continue;
    out.push({ id:id, debtId:pid, amount:(r[ci(h,'amount')]||'0').toString().trim(),
      currency:(r[ci(h,'currency')]||'').toString().trim(),
      date:(r[ci(h,'date')]||'').toString().trim(),
      notes:(r[ci(h,'notes')]||'').toString().trim(),
      createdAt:(r[ci(h,'created at')]||'').toString().trim() });
  }
  return { payments: out };
}

function appendDebtPayment(ss, p) {
  var sh = ensureNamedSheet(ss, 'Debt Payments', PAYMENT_COLS);
  sh.appendRow([p.id||'', p.debtId||'', parseFloat(p.amount)||0,
    p.currency||'', p.date||'', p.notes||'', p.createdAt||'']);
  return { ok: true };
}

function deleteDebtPaymentRow(ss, id) {
  var loc = findRowInSheet(ss, 'Debt Payments', id);
  if (!loc) return { error: 'Not found' };
  loc.sh.deleteRow(loc.row);
  return { ok: true };
}

function findRowInSheet(ss, sheetName, id) {
  var sh = ss.getSheetByName(sheetName);
  if (!sh) return null;
  var col = sh.getRange('A:A').getValues();
  for (var r = 1; r < col.length; r++) {
    if (col[r][0] === id) return { sh: sh, row: r+1 };
  }
  return null;
}

function ensureNamedSheet(ss, name, cols) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
  }
  // Always verify (and repair) the header row so column positions stay in sync
  // with the cols definition used by append functions.
  var existingHeaders = sh.getLastRow() > 0
    ? sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0]
    : [];
  var headersMatch = cols.length === existingHeaders.length &&
    cols.every(function(c,i){ return c === (existingHeaders[i]||'').toString().trim(); });
  if (!headersMatch) {
    sh.getRange(1,1,1,cols.length).setValues([cols]).setFontWeight('bold')
       .setBackground('#5b4fe9').setFontColor('#ffffff')
       .setHorizontalAlignment('center');
    sh.setFrozenRows(1);
    sh.autoResizeColumns(1, cols.length);
  }
  return sh;
}

function readIncome(ss) {
  var sh = ss.getSheetByName('Income');
  if (!sh) return { income: [] };
  var rows = sh.getDataRange().getValues();
  if (rows.length < 2) return { income: [] };
  var h = rows[0].map(function(c){ return c.toString().toLowerCase().trim(); });
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i], id = (r[ci(h,'id')]||'').toString().trim();
    if (!id) continue;
    out.push({ id:id, type:(r[ci(h,'type')]||'income').toString().trim(),
      source:(r[ci(h,'source')]||'').toString().trim(),
      amount:(r[ci(h,'amount')]||'0').toString().trim(),
      currency:(r[ci(h,'currency')]||'').toString().trim(),
      date:toIso((r[ci(h,'date')]||'').toString().trim()),
      notes:(r[ci(h,'notes')]||'').toString().trim(),
      createdAt:(r[ci(h,'created at')]||'').toString().trim() });
  }
  return { income: out };
}

function appendIncome(ss, e) {
  var sh = ensureNamedSheet(ss, 'Income', INCOME_COLS);
  sh.appendRow([e.id||'', e.type||'income', e.source||'',
    parseFloat(e.amount)||0, e.currency||'', e.date||'',
    e.notes||'', e.createdAt||'']);
  return { ok: true };
}

function deleteIncomeRow(ss, id) {
  var loc = findRowInSheet(ss, 'Income', id);
  if (!loc) return { error: 'Not found' };
  loc.sh.deleteRow(loc.row);
  return { ok: true };
}`;

  return {
    init,
    ping,
    getScriptVersion,
    getSheetUrl,
    readAllExpenses,
    appendExpense,
    updateExpense,
    deleteExpense,
    readAllDebts,
    appendDebt,
    updateDebt,
    deleteDebt,
    readDebtPayments,
    appendDebtPayment,
    deleteDebtPayment,
    readAllIncome,
    appendIncomeEntry,
    deleteIncomeEntry,
    SCRIPT_SOURCE,
  };
})();
