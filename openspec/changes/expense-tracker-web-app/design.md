## Context

This is a greenfield static web app. There is no existing codebase, server infrastructure, or database to migrate from. All user data will live in a Google Sheet owned by the user. The app is hosted on GitHub Pages (static files only — no server-side execution). The primary users are individuals tracking personal or small-business expenses on mobile devices.

Key constraints:
- No backend server — everything runs in the browser
- GitHub Pages requires all assets to be static (HTML, CSS, JS)
- Google API credentials (OAuth Client ID) are public by design; the OAuth flow is the security boundary
- Receipt files must be stored somewhere accessible via URL — Google Drive is the natural choice given we're already using Google auth

## Goals / Non-Goals

**Goals:**
- Deliver a complete, usable expense tracker with zero hosting cost
- Keep all user data in their own Google account (Sheet + Drive)
- Make the Google Sheet independently readable/usable without the app
- Support receipt capture on mobile (camera) and file upload on desktop
- Mobile-first, high-quality UI that feels like a native app
- No build toolchain complexity — deployable by drag-and-drop or `gh-pages` push

**Non-Goals:**
- Multi-user / shared expense tracking (single Google account per deployment)
- Offline support / local-first sync (requires service workers and conflict resolution — out of scope v1)
- Native iOS/Android app
- Custom backend, database, or server-side logic
- Importing from other expense apps or bank feeds (v1)
- Budget rules, recurring expense automation (v2)

## Decisions

### Decision 1: Vanilla JS + Alpine.js (no heavy framework)

**Chosen:** Alpine.js (8KB) + vanilla JS for DOM, with no build step.

**Why:** GitHub Pages serves static files. A React/Vue app needs a build step and bundler. Alpine.js provides reactive data binding for forms and list views without compilation. Chart.js handles dashboard charts. This keeps the project deployable as raw files with no `npm run build`.

**Alternative considered:** Preact with a simple esbuild config — rejected because it adds build toolchain complexity that raises the barrier to contribution and deployment.

### Decision 2: Google Sheets API v4 as the database

**Chosen:** Each expense is a row in a designated Google Sheet. Columns are: `ID | Date | Amount | Currency | Category | Merchant | Notes | Receipt URL | Created At`.

**Why:** The sheet must be independently usable. Named, formatted columns with a header row ensure a human reading the sheet understands it without the app. The app reads/writes specific ranges via the Sheets API — no opaque encoding.

**Alternative considered:** Storing JSON blobs in a single cell — rejected because it breaks standalone usability.

**Sheet bootstrap:** On first sign-in, the app checks for a sheet named `ExpenseTracker` in the user's Drive. If not found, it creates it and writes the header row with bold formatting and frozen columns.

### Decision 3: Google Drive for receipt storage

**Chosen:** Upload receipt images/documents to a folder `ExpenseTracker/Receipts` in Google Drive via the Drive API v3. Store the `webViewLink` (shareable URL) in the `Receipt URL` column of the sheet.

**Why:** Drive is already within the Google auth scope the user grants. The file is accessible from the sheet as a clickable link, satisfying the requirement that the sheet remain independently useful. Drive API supports multipart upload of binary files from the browser.

**Scope required:** `https://www.googleapis.com/auth/drive.file` — this scope only grants access to files created by the app, limiting blast radius.

**Alternative considered:** Storing base64 images in the sheet — rejected, Sheets cells have a ~50K character limit and sheets become unwieldy.

### Decision 4: Google Identity Services (GIS) for OAuth

**Chosen:** Use the Google Identity Services JS library (`accounts.google.com/gsi/client`) for the OAuth 2.0 implicit flow (token-based, no server).

**Why:** GIS is Google's current recommended approach for client-side OAuth. It handles token refresh and the consent screen. The access token is stored in `sessionStorage` (cleared on tab close) — not `localStorage` — to limit exposure.

**Scopes requested:**
- `https://www.googleapis.com/auth/spreadsheets` (read/write sheets)
- `https://www.googleapis.com/auth/drive.file` (upload receipts)

### Decision 5: UI architecture — single-page app with hash routing

**Chosen:** Single `index.html` with hash-based routing (`#/dashboard`, `#/expenses`, `#/add`, `#/settings`). Views are shown/hidden via CSS classes driven by Alpine.js state.

**Why:** GitHub Pages can serve `index.html` as the root, but has no server-side routing. Hash routing requires zero server config and works natively on GitHub Pages.

**Views:** Dashboard, Expense List, Add/Edit Expense, Settings (API key, sheet selection).

### Decision 6: Design system — premium mobile-first CSS

**Chosen:** Custom CSS design system (no Tailwind, no Bootstrap) aligned with the `design-taste-frontend` and `high-end-visual-design` skill patterns. CSS custom properties for theming. Bottom navigation bar for mobile. Card-based layouts.

**Why:** Bootstrap/Tailwind produce generic-looking UIs. A custom, minimal design system gives full control over the premium aesthetic the project requires while keeping bundle size small.

## Risks / Trade-offs

- **CORS / API token exposure** → The OAuth Client ID is embedded in the HTML source. This is standard for client-side OAuth apps and does not expose a secret (there is no client secret in the implicit flow). Restrict the Client ID to the GitHub Pages origin in Google Cloud Console.

- **Google API quota limits** → The free tier of Sheets API allows 300 requests/minute per project. For a personal expense tracker this is ample. If a power user has thousands of expenses, initial load (reading all rows) could be slow. Mitigation: paginate reads; cache the expense list in `sessionStorage` and only re-fetch on explicit refresh.

- **Sheet structure drift** → If the user manually rearranges sheet columns, the app will read wrong data. Mitigation: app reads by header name (column lookup on first row), not by fixed column index.

- **Drive file scope** → `drive.file` scope only sees files the app created. If the user wants to link an existing Drive file, they cannot. Accepted limitation for v1.

- **No offline support** → The app requires an active internet connection. Accepted for v1; service worker + IndexedDB sync is a v2 concern.

- **Receipt file size** → Drive API has no hard size limit for multipart uploads from browser but large files (>10MB) may be slow on mobile. Mitigation: client-side image compression before upload (e.g., canvas resize to max 1600px, JPEG quality 0.8).

## Migration Plan

N/A — greenfield project. Initial deployment:
1. Create Google Cloud project, enable Sheets API + Drive API
2. Create OAuth 2.0 Client ID (web application), add GitHub Pages URL as authorized origin
3. Embed Client ID in `index.html`
4. Push files to `gh-pages` branch (or configure GitHub Pages to serve from `main/docs` or root)
5. User visits the URL, signs in with Google, app auto-creates the sheet

## Open Questions

- **Currency support:** Should the app support multiple currencies per expense, or is single-currency sufficient for v1? (Current design includes a `Currency` column — app can default to USD/user-configurable and store it per row for v2 multi-currency support)
- **Categories list:** Fixed preset categories, or user-defined? Lean toward a preset list with an "Other" option for v1, user-editable in Settings for v2.
- **Recurring expenses:** Out of scope for v1, but the sheet structure should not preclude adding a `Recurrence` column later.
