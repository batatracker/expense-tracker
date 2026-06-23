## Why

The app currently supports only English (British), limiting usability for Spanish-speaking users in Argentina. Adding locale-based URL routing allows users to access the app in their preferred language without any configuration, while keeping Google Sheets data fully language-agnostic.

## What Changes

- Introduce a URL-based locale prefix (`/es/` for Spanish Argentina, no prefix or `/en/` for English) that controls the active language on page load
- Add a locale switcher UI element allowing users to toggle between `en` and `es-AR`
- Translate all UI strings (labels, placeholders, toasts, error messages, category names, navigation) into Spanish (Argentina)
- Categories stored in Google Sheets remain as English keys; display names are translated client-side at render time
- Dates, currency symbols, and number formatting adapt to the active locale (en-GB vs es-AR)
- No locale state is stored in `localStorage` or Google Sheets — the URL is the single source of truth

## Capabilities

### New Capabilities

- `locale-routing`: URL-based locale detection and routing. Resolves active locale from the URL prefix (`/es/` → `es-AR`, anything else → `en-GB`). Provides a locale switcher in the UI that rewrites the URL path. Defaults to English when no locale prefix is present.
- `ui-translations`: Client-side translation layer covering all visible UI strings for `en-GB` and `es-AR`. Includes category display names, form labels, navigation items, toast messages, error messages, and date/number formatting.

### Modified Capabilities

- `expense-entry`: Category values written to Google Sheets remain English keys; display names are resolved through the translation layer at render time. No change to sheet schema.
- `dashboard`: Chart labels, period labels, and summary text adapt to the active locale.
- `expense-list`: Search, filter UI text, and expense display adapt to the active locale.

## Impact

- **`index.html`**: Add locale switcher element; update routing/init script to read locale from URL
- **`js/app.js`**: Integrate translation lookup throughout UI string usage; pass locale to date/number formatters
- **`config.js`**: Category keys remain unchanged (English); translation maps live in new `js/i18n.js`
- **New file `js/i18n.js`**: Translation dictionaries for `en-GB` and `es-AR`, plus a `t()` helper and locale detection logic
- **No changes** to `sheets.js`, `auth.js`, `drive.js`, or AppScript — data layer is unaffected
- **`manifest.json`**: May need `start_url` adjustment if locale prefix is used
