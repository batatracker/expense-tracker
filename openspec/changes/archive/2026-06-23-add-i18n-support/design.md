## Context

The expense tracker is a client-side PWA built with Alpine.js. It has no server-side routing — `index.html` is the single entry point served as a static file. Navigation between views (dashboard, list, entry) is handled entirely in JavaScript via Alpine state. Google Sheets is the data store; the app talks to it via the Sheets API (OAuth mode) or an Apps Script deployment.

Currently all UI strings are hardcoded in English (British) throughout `index.html` and `js/app.js`. There is no translation layer. Category names stored in Google Sheets are English strings that are both the key and the display value.

## Goals / Non-Goals

**Goals:**
- Support two locales: `en-GB` (default) and `es-AR` (Spanish, Argentina)
- Make the URL the single source of truth for locale — no `localStorage`, no Google Sheets changes
- Translate all visible UI strings, including category display names, without changing sheet-stored values
- Adapt date and number formatting to the active locale
- Provide a locale switcher accessible from the app UI

**Non-Goals:**
- Server-side routing or redirects (app remains fully static)
- Right-to-left layout support
- Locale-aware sorting of category keys in Google Sheets
- Detecting the browser's language and auto-redirecting
- Supporting more than two locales in this change

## Decisions

### Decision 1: URL prefix as locale signal (`/es/` path prefix)

**Chosen**: A path prefix convention where `/es/...` activates Spanish and anything else (including bare `/`) activates English. Locale is read once at page load from `window.location.pathname`.

**Alternatives considered**:
- Query param (`?lang=es`): Works but pollutes URLs and is invisible in most share contexts.
- Subdomain (`es.app.com`): Requires DNS/hosting config changes; overkill for a static PWA.
- `localStorage` key: Can't be shared via URL; contradicts the stateless constraint.

**Why path prefix**: Clean, shareable, bookmarkable URLs. Compatible with static hosting (GitHub Pages, Netlify) as long as all routes serve `index.html`. The switcher simply rewrites `window.location.pathname`.

### Decision 2: `js/i18n.js` — a standalone translation module

**Chosen**: A new `js/i18n.js` file exporting:
- `LOCALES` — dictionary object `{ 'en-GB': {...}, 'es-AR': {...} }`
- `detectLocale()` — reads `window.location.pathname`, returns `'es-AR'` or `'en-GB'`
- `t(key)` — looks up the key in the active locale dictionary, falls back to `en-GB`
- `switchLocale(targetLocale)` — rewrites the URL path

Category display names are entries in the translation dictionaries keyed by their English name (`'Food & Dining': 'Comida y Restaurantes'`). Sheet-stored values stay as English keys; the render layer calls `t(category)` to get the display string.

**Why a standalone file over inline Alpine data**: Keeps translation logic out of `app.js`, makes adding a third locale trivial, and allows `index.html` to load it as a plain `<script>` before Alpine initialises.

### Decision 3: Category keys in Google Sheets remain English

**Chosen**: The sheet schema (`ID, Date, Amount, Currency, Category, Merchant, Notes, Receipt URL, Created At`) is unchanged. The `Category` column stores English keys (`Food & Dining`, etc.). When rendering, the app calls `t(expense.category)` to get the localised display string.

**Why**: Changing stored category values would require a data migration for all existing sheets, and mixed-locale sheets would be unreadable. Keeping keys as English makes the sheet language-agnostic and human-readable regardless of the UI locale.

The expense entry form's category dropdown renders translated labels but submits the English key. This is transparent to the user.

### Decision 4: No change to PWA manifest or service worker

The `manifest.json` `start_url` stays as `/`. Users who install the PWA from the English URL get the English default; those who install from `/es/` will have their browser handle the scoped install separately. This is acceptable for the initial implementation.

## Risks / Trade-offs

**Static host must serve `index.html` for `/es/` path** → Mitigation: document the required rewrite rule (e.g., `/* → /index.html` on Netlify/GitHub Pages). For GitHub Pages with a repo subfolder, the prefix becomes `/repo-name/es/` — `detectLocale()` must strip the base path correctly.

**Missing translation key silently falls back to English** → This is intentional. `t(key)` returns the `en-GB` value (or the raw key as last resort), so the UI never shows an empty string. A `console.warn` in dev mode is sufficient.

**Category keys in `CATEGORIES` config are display strings, not opaque IDs** → Existing data is already written with display strings as keys. This change does not worsen the situation, but a future refactor to UUID-based category keys would be cleaner.

**Date locale formatting differences** → Argentine Spanish uses `DD/MM/YYYY` (same as en-GB) so divergence is minimal. `Intl.DateTimeFormat` with the locale tag handles this correctly.

## Migration Plan

1. Add `js/i18n.js` as a new file — no existing code breaks.
2. Load it in `index.html` before Alpine's `defer` script.
3. Replace hardcoded strings in `index.html` and `app.js` with `t()` calls.
4. Add locale switcher UI to the Settings view and/or the top nav bar.
5. Update `index.html` routing init to call `detectLocale()` on load.
6. No data migration needed — Google Sheets schema unchanged.

Rollback: removing `i18n.js` and reverting `index.html`/`app.js` to hardcoded strings restores previous behaviour with no data impact.
