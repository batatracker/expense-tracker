// ESLint v9 flat config
const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  js.configs.recommended,

  // ── Base config for all JS files ─────────────────────────────
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        ...globals.browser,
        // Third-party CDN globals not in globals.browser
        Alpine: 'readonly',
        Chart: 'readonly',
        google: 'readonly',
        gapi: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'no-console': 'warn',
      'eqeqeq': 'error',
      'no-var': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'complexity': ['warn', 15],
    },
  },

  // ── app.js uses cross-file module globals ────────────────────
  {
    files: ['js/app.js'],
    languageOptions: {
      globals: {
        CONFIG: 'readonly',
        Auth: 'readonly',
        Sheets: 'readonly',
        Drive: 'readonly',
        AppScript: 'readonly',
        t: 'readonly',
        I18n: 'readonly',
      },
    },
  },

  // ── sheets.js uses Auth and CONFIG ───────────────────────────
  {
    files: ['js/sheets.js'],
    languageOptions: {
      globals: {
        CONFIG: 'readonly',
        Auth: 'readonly',
      },
    },
  },

  // ── drive.js uses Auth ───────────────────────────────────────
  {
    files: ['js/drive.js'],
    languageOptions: {
      globals: {
        Auth: 'readonly',
      },
    },
  },

  // ── auth.js uses CONFIG ──────────────────────────────────────
  {
    files: ['js/auth.js'],
    languageOptions: {
      globals: {
        CONFIG: 'readonly',
      },
    },
  },

  // ── IIFE module pattern: top-level const is the public API consumed
  //    by index.html via global scope; ESLint can't see that usage ────
  {
    files: ['js/auth.js'],
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^Auth$' }] },
  },
  {
    files: ['js/sheets.js'],
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^Sheets$' }] },
  },
  {
    files: ['js/drive.js'],
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^Drive$' }] },
  },
  {
    files: ['js/appscript.js'],
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^AppScript$' }] },
  },
  {
    files: ['config.js'],
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^CONFIG$' }] },
  },
  {
    files: ['js/app.js'],
    rules: { 'no-unused-vars': ['error', { varsIgnorePattern: '^appData$' }] },
  },
  // ── i18n.js: I18n is defined here, no extra globals needed ──

  // ── Test files: Jest + Node globals ──────────────────────────
  {
    files: ['js/__tests__/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
  },

  // ── Ignore generated / vendor directories ───────────────────
  {
    ignores: ['node_modules/', 'coverage/'],
  },
];
