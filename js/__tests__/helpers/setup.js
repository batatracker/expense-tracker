/**
 * Global mock shim for browser APIs.
 *
 * Source files in js/ are plain browser scripts (not ES modules). They
 * reference browser globals like `window`, `document`, `localStorage`, and
 * `URLSearchParams`. This shim provides minimal fakes so the files can be
 * `require()`'d in a Node/Jest environment.
 *
 * Usage: require this file before requiring any source file.
 *   const { loadI18n } = require('./helpers/setup');
 */

'use strict';

// ── Minimal browser global stubs ──────────────────────────────────────────────

global.window = global.window || {};

global.document = {
  documentElement: { setAttribute: () => {} },
  get title() { return this._title || ''; },
  set title(v) { this._title = v; },
};

const _store = {};
global.localStorage = {
  getItem: (k) => _store[k] !== undefined ? _store[k] : null,
  setItem: (k, v) => { _store[k] = String(v); },
  removeItem: (k) => { delete _store[k]; },
  clear: () => { Object.keys(_store).forEach(k => delete _store[k]); },
};

// URLSearchParams is available in Node 10+, but set on global just in case.
global.URLSearchParams = global.URLSearchParams || URLSearchParams;

// ── Helper: load i18n.js into the current global scope ───────────────────────

/**
 * Loads i18n.js with a given ?lang= search string and returns
 * the `window.t` function exposed by the module.
 *
 * @param {string} search - URL search string, e.g. '?lang=es'
 */
function loadI18n(search = '') {
  // Reset any previous load (do NOT clear localStorage — callers may pre-set it)
  delete global.window.t;
  delete global.window.switchLocale;
  delete global.window._activeLocale;
  delete global.I18n;

  // Mock window.location.search
  global.window.location = { search, href: `http://localhost/${search}` };
  global.location = global.window.location;

  // Evaluate the source file
   
  jest.isolateModules(() => {
    // Clear module cache so the IIFE re-runs with the new location mock
    jest.resetModules();
    require('../../i18n.js');
  });

  return global.window.t;
}

module.exports = { loadI18n };
