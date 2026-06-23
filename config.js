// ============================================================
// Expense Tracker — App constants
//
// Nothing here needs to be changed for a normal deployment.
// User-specific config (OAuth client ID, sheet ID, currency,
// branding) is handled entirely through the in-app Setup screen
// and stored in the bookmarked ?cfg= URL — not here.
// ============================================================

const CONFIG = {
  APP_VERSION: '1.4.0',

  // Increment this whenever the Apps Script source changes in a way that
  // requires users to re-deploy. The deployed script returns its own version
  // from the 'ping' action; if it differs, the app shows an update prompt.
  SCRIPT_VERSION: 3,

  // Base path for the app deployment (used by i18n locale routing).
  // '/' for root deploys (Netlify, custom domain, localhost).
  // '/repo-name/' for GitHub Pages project-site deploys.
  BASE_PATH: '/',

  DEFAULT_CURRENCY: '',   // no assumption; configured per-user in Settings

  // Base scopes always requested (Sheets + identity).
  // drive.file is added dynamically when receipt upload is enabled.
  SCOPES_BASE: [
    'https://www.googleapis.com/auth/spreadsheets',
    'openid',
    'profile',
    'email',
  ].join(' '),

  SCOPE_DRIVE: 'https://www.googleapis.com/auth/drive.file',

  SHEET_NAME: 'ExpenseTracker',
  SHEET_COLUMNS: ['ID', 'Date', 'Amount', 'Currency', 'Category', 'Merchant', 'Notes', 'Receipt URL', 'Created At'],

  CATEGORIES: [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Health & Fitness',
    'Housing & Utilities',
    'Travel',
    'Education',
    'Personal Care',
    'Business',
    'Debt Payment',
    'Other',
  ],

  CATEGORY_ICONS: {
    'Food & Dining':      '🍽',
    'Transportation':     '🚗',
    'Shopping':           '🛍',
    'Entertainment':      '🎬',
    'Health & Fitness':   '💪',
    'Housing & Utilities':'🏠',
    'Travel':             '✈',
    'Education':          '📚',
    'Personal Care':      '💆',
    'Business':           '💼',
    'Debt Payment':       '💳',
    'Other':              '📌',
  },

  CATEGORY_COLORS: {
    'Food & Dining':      '#F59E0B',
    'Transportation':     '#3B82F6',
    'Shopping':           '#EC4899',
    'Entertainment':      '#8B5CF6',
    'Health & Fitness':   '#10B981',
    'Housing & Utilities':'#6B7280',
    'Travel':             '#06B6D4',
    'Education':          '#F97316',
    'Personal Care':      '#EF4444',
    'Business':           '#14B8A6',
    'Debt Payment':       '#7C3AED',
    'Other':              '#9CA3AF',
  },

  DEBT_COLUMNS: ['ID', 'Source', 'Date', 'Total Amount', 'Outstanding Balance', 'Currency', 'Due Date', 'Notes', 'Status', 'Created At'],
  DEBT_PAYMENT_COLUMNS: ['ID', 'Debt ID', 'Amount', 'Currency', 'Date', 'Notes', 'Created At'],
};
