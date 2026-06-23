// ============================================================
// Expense Tracker — Configuration
//
// GOOGLE_CLIENT_ID: Leave empty here. The app will ask for it
// on first run and store it in localStorage (never in source).
// If you're self-hosting and want to hard-code it, set it below.
//
// DEFAULT_CURRENCY: Leave empty for currency-agnostic operation.
// Users set their preferred currency in the Settings screen.
// ============================================================

const CONFIG = {
  GOOGLE_CLIENT_ID: '',   // set via in-app setup screen or hard-code here
  APP_VERSION: '1.2.0',
  REPO_URL: 'https://github.com/YOUR_USERNAME/expense-tracker',

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
    'Other':              '#9CA3AF',
  },
};
