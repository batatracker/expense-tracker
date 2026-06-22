# Expense Tracker

A free, mobile-first expense tracker that stores all data in **your own Google Sheet**. No subscriptions, no backend, no vendor lock-in.

**Live demo:** `https://YOUR_USERNAME.github.io/expense-tracker/`

---

## Features

- Track expenses with amount, date, category, merchant, and notes
- Multi-currency support — enter a currency per expense or set a default (e.g. ARS, USD, EUR)
- Search, filter, and sort your expense history
- Dashboard with monthly totals, category breakdown chart, and 6-month trend
- All data lives in a Google Sheet you own — readable and editable without the app
- Optional: attach receipt photos or PDFs, stored in your Google Drive
- Works as an installable PWA (add to home screen)

---

## Setup

### 1. Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g. `expense-tracker`)
3. Enable these APIs:
   - **Google Sheets API** (search "Sheets API")
   - **Google Drive API** — only needed if you plan to use receipt upload

### 2. OAuth 2.0 Credentials

1. In the Cloud Console, go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Choose **Web application**
4. Add authorized JavaScript origins:
   - `https://YOUR_USERNAME.github.io` (your GitHub Pages URL)
   - `http://localhost:8080` (for local development)
5. Copy the **Client ID** (looks like `123456789-abc....apps.googleusercontent.com`)

> **Note:** The OAuth Client ID is not a secret — it only works from origins you explicitly register in Google Cloud Console.

### 3. Generate PNG icons (optional, for install prompt)

The app includes an SVG icon (`assets/icon.svg`). To generate PNG icons for the web app manifest, run:

```bash
# If you have Inkscape:
inkscape assets/icon.svg --export-png=assets/icon-192.png --export-width=192
inkscape assets/icon.svg --export-png=assets/icon-512.png --export-width=512

# Or use any image converter (ImageMagick, online tools, etc.)
```

### 4. Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select **Deploy from a branch**
4. Choose `main` branch, `/ (root)` folder
5. Save — your app will be live at `https://YOUR_USERNAME.github.io/expense-tracker/`

### 5. First run

1. Open your GitHub Pages URL
2. A one-time **Setup** screen appears — paste your OAuth Client ID and optionally set a default currency (e.g. `ARS`) and enable receipt upload
3. After saving, your browser URL updates to include your config as a `?cfg=` parameter — **bookmark this URL** so your setup is restored automatically if browser storage is cleared
4. Click **Sign in with Google** and grant the requested permissions
5. The app creates an `ExpenseTracker` spreadsheet in your Google Drive automatically
6. Start adding expenses!

---

## Local development

```bash
# Serve with any static file server
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

> **Important:** Use `http://localhost:8080` specifically (or another port you've added as an authorized origin in Google Cloud Console). The GIS OAuth flow requires a registered origin.

---

## Data structure

Each expense is one row in your `ExpenseTracker` Google Sheet:

| Column | Example | Notes |
|--------|---------|-------|
| ID | `a1b2-c3d4-…` | UUID, auto-generated |
| Date | `2026-06-22` | ISO 8601 format |
| Amount | `24.50` | Decimal |
| Currency | `USD` | 3-letter code |
| Category | `Food & Dining` | From preset list |
| Merchant | `Starbucks` | Optional |
| Notes | `Morning coffee` | Optional |
| Receipt URL | `https://drive.google.com/…` | Google Drive link, optional |
| Created At | `2026-06-22T09:15:00.000Z` | ISO timestamp |

You can add columns to the right without breaking the app. The app reads columns by header name, not position.

---

## Receipt attachments

Receipt upload is **opt-in** — enable it in the Setup screen or Settings. When enabled, the app requests the `drive.file` scope and uploads receipts to `ExpenseTracker/Receipts/` in your Google Drive. The app can only access files it creates itself. The Google Drive link is stored in the sheet as a clickable URL.

Images are compressed client-side (max 1600px, JPEG 82% quality) before upload to keep sizes reasonable on mobile.

If you don't need receipts, leave the option off — the app works fully without Drive access.

---

## Privacy & security

- The OAuth Client ID is not a secret — it only works from origins you register in Google Cloud Console
- Your Client ID is stored in your browser's `localStorage` and encoded into the bookmarkable `?cfg=` URL — it never touches the app's source code or any server
- The access token is stored in `sessionStorage` (cleared when you close the tab)
- The app never sends your data anywhere except Google's own APIs
- All expense data and receipts live in **your** Google account

---

## Tech stack

- [Alpine.js](https://alpinejs.dev/) v3 — reactive UI, no build step
- [Chart.js](https://www.chartjs.org/) v4 — dashboard charts
- [Google Identity Services](https://developers.google.com/identity/oauth2/web/guides/overview) — OAuth 2.0
- [Google Sheets API v4](https://developers.google.com/sheets/api) — data storage
- [Google Drive API v3](https://developers.google.com/drive/api) — receipt storage
- Custom CSS design system — no frameworks
