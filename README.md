# Expense Tracker

A free, mobile-first expense tracker that stores all data in **your own Google Sheet**. No subscriptions, no backend, no vendor lock-in.

**Live demo:** `https://YOUR_USERNAME.github.io/expense-tracker/`

[![CI](https://github.com/DazedNConfused-/local-expense-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/DazedNConfused-/local-expense-tracker/actions/workflows/ci.yml)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

---

## Features

**Expenses & income**
- Track expenses with amount, date, category, merchant, notes, and optional receipt photo
- Track income entries and reconciliation adjustments per month
- Dashboard shows income, expenses, and running net balance side-by-side with semantic colors

**Debts**
- Log debts owed to creditors, track outstanding balance and due dates
- Record partial payments; the dashboard shows total outstanding across all creditors

**Dashboard**
- Monthly totals, category breakdown chart, and 6-month spending trend
- Responsive layout: three stat cards in a row on desktop, stacked on mobile
- Period selector: This Month, Last Month, Last 3 Months, This Year, All Time

**Data & privacy**
- All data lives in a Google Sheet you own — one tab per month, human-readable dates
- Multi-currency support — enter a currency per expense or set a default (e.g. ARS, USD, EUR)
- Search, filter, and sort your expense history
- Optional: attach receipt photos or PDFs, stored in your Google Drive (OAuth modes only)

**UX & customisation**
- Works as an installable PWA (add to home screen on iOS and Android)
- Full dark mode, auto-detected from system preference
- Localization: English (en-GB) and Argentine Spanish (es-AR)
- **No OAuth required** — use the Apps Script mode for a simpler, credential-free setup
- **Custom branding** — set your own app title and logo (emoji or image) from Settings; encoded in the bookmark URL, no server required

---

## Setup modes

The app supports three ways to connect to your data. Choose the one that fits your situation when you first open the app.

### Option A — Create a new sheet (recommended for most users)

Uses Google OAuth. The app creates an `ExpenseTracker` spreadsheet in your Google Drive and manages it for you. Receipt upload is available.

**Requires:** A Google Cloud project with Sheets API enabled and an OAuth Client ID.

### Option B — Connect an existing sheet

Uses Google OAuth. Point the app at a spreadsheet you already created. Receipt upload is disabled for this mode.

**Requires:** Same as Option A, plus an existing spreadsheet URL.

### Option C — No Google account needed (Apps Script)

No OAuth, no Google Cloud Console. Instead, a small Google Apps Script runs as a web app and acts as the API. You copy-paste a script into Google Sheets once, deploy it, and paste the URL into the app. The guided wizard walks you through every step.

**Requires:** A Google account to access Google Sheets (no Cloud Console or OAuth credentials needed).

---

## Setup — Option A & B (OAuth)

### 1. Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g. `expense-tracker`)
3. Enable these APIs:
   - **Google Sheets API** (search "Sheets API")
   - **Google Drive API** — only needed if you plan to use receipt upload (Option A only)

### 2. OAuth 2.0 Credentials

1. In the Cloud Console, go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Choose **Web application**
4. Add authorized JavaScript origins:
   - `https://YOUR_USERNAME.github.io` (your GitHub Pages URL)
   - `http://localhost:8080` (for local development)
5. Copy the **Client ID** (looks like `123456789-abc....apps.googleusercontent.com`)

> **Note:** The OAuth Client ID is not a secret — it only works from origins you explicitly register in Google Cloud Console.

### 3. Deploy to GitHub Pages

1. Push this repository to GitHub
2. Go to **Settings → Pages**
3. Under **Source**, select **Deploy from a branch**
4. Choose `main` branch, `/ (root)` folder
5. Save — your app will be live at `https://YOUR_USERNAME.github.io/expense-tracker/`

### 4. First run (Option A)

1. Open your GitHub Pages URL
2. A one-time **Setup** screen appears — choose **"Create new sheet for me"**
3. Paste your OAuth Client ID and optionally set a default currency (e.g. `ARS`)
4. Click **Save & Continue**, then **Sign in with Google** and grant the requested permissions
5. The app creates an `ExpenseTracker` spreadsheet in your Google Drive automatically
6. After setup, your browser URL updates to include your config as a `?cfg=` parameter — **bookmark this URL** so your setup is restored automatically if browser storage is cleared
7. Start adding expenses!

### 4. First run (Option B)

1. Open your GitHub Pages URL
2. Choose **"Connect existing sheet"** in the Setup screen
3. Paste your OAuth Client ID, a default currency, and the full URL of your existing spreadsheet
4. Click **Save & Continue**, then sign in
5. The app will read and write to the spreadsheet you provided

---

## Setup — Option C (Apps Script, no OAuth)

The in-app wizard guides you through each step. Here is what it does:

1. **Create a Google Sheet** — go to [sheets.new](https://sheets.new), give it any name
2. **Open the script editor** — in the sheet, go to **Extensions → Apps Script**, then paste the script the wizard shows you (it's pre-generated, just copy and paste)
3. **Deploy as a web app** — click **Deploy → New deployment**, choose **Web app**, set **Execute as: Me** and **Who has access: Anyone**, click **Deploy**, and copy the web app URL
4. **Connect** — paste the URL into the wizard and click **Verify & Save**

The app pings the script URL to confirm it works before saving. Once connected, all reads and writes go through the script — no OAuth, no Google Cloud Console.

> **Note:** The Apps Script URL acts like an API key. Anyone with it can read and write your expenses. Keep the bookmarked URL private.

---

## Local development

```bash
# Serve with any static file server
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

> **Important for OAuth modes:** Use `http://localhost:8080` specifically (or another port you've added as an authorized origin in Google Cloud Console). The GIS OAuth flow requires a registered origin. The Apps Script mode has no such restriction.

---

## Data structure

Data is stored in your `ExpenseTracker` Google Sheet with **one tab per calendar month** (e.g. `Jun 2026`, `Jul 2026`). Tabs are created automatically when the first expense is logged for that month.

Each expense is one row:

| Column | Example | Notes |
|--------|---------|-------|
| ID | `a1b2-c3d4-…` | UUID, auto-generated |
| Date | `Jun 22, 2026` | Human-readable |
| Amount | `24.50` | Decimal |
| Currency | `USD` | 3-letter code |
| Category | `Food & Dining` | From preset list |
| Merchant | `Starbucks` | Optional |
| Notes | `Morning coffee` | Optional |
| Receipt URL | `https://drive.google.com/…` | Google Drive link, optional |
| Created At | `2026-06-22T09:15:00.000Z` | ISO timestamp |

The app reads columns by **header name, not position** — you can reorder or add columns to the right without breaking anything.

---

## Receipt attachments

Receipt upload is **opt-in** and only available in **Option A (Create new sheet)**. When enabled, the app requests the `drive.file` scope and uploads receipts to `ExpenseTracker/Receipts/` in your Google Drive. The app can only access files it creates itself. The Google Drive link is stored in the sheet as a clickable URL.

Images are compressed client-side (max 1600px, JPEG 82% quality) before upload to keep sizes reasonable on mobile.

---

## Generate PNG icons (optional, for install prompt)

The app includes an SVG icon (`assets/icon.svg`). To generate PNG icons for the web app manifest, run:

```bash
# If you have Inkscape:
inkscape assets/icon.svg --export-png=assets/icon-192.png --export-width=192
inkscape assets/icon.svg --export-png=assets/icon-512.png --export-width=512

# Or use any image converter (ImageMagick, online tools, etc.)
```

---

## Custom branding

You can give the app a custom name and icon from **Settings → App Branding**. Both are encoded directly into the `?cfg=` bookmark URL — no server, no database.

- **App Title** — replaces "Expense Tracker" in the page title, browser tab, and navigation bar.
- **App Icon** — pick any emoji from the built-in picker, or upload a small image (PNG, JPG, SVG, etc.). The icon is used as the browser favicon and shown in the sidebar. Emoji are canvas-rendered to a PNG favicon automatically.

Share or bookmark the URL after saving and the branding travels with it. Resetting to defaults removes both fields from the URL.

> **Note on image size:** A base64-encoded image adds to the URL length. The app warns if the icon exceeds ~10 KB. Prefer emoji for sharing-friendly URLs.

---

## Privacy & security

- **OAuth modes:** The Client ID is not a secret — it only works from origins you register in Google Cloud Console. The access token is stored in `sessionStorage` (cleared when you close the tab).
- **Apps Script mode:** The script URL is the only credential. Treat the bookmarked `?cfg=` URL as private.
- Your config is encoded into the `?cfg=` URL parameter as base64 — it never touches the app's source code or any server.
- The app never sends your data anywhere except Google's own APIs (Sheets, Drive, or your Apps Script).
- All expense data and receipts live in **your** Google account.

---

## Tech stack

No build step. Everything runs directly in the browser.

- [Alpine.js](https://alpinejs.dev/) v3 — reactive UI with zero build tooling
- [Chart.js](https://www.chartjs.org/) v4 — dashboard charts (category donut + monthly bar)
- [emoji-picker-element](https://github.com/nolanlawson/emoji-picker-element) — emoji picker for custom branding
- [Google Identity Services](https://developers.google.com/identity/oauth2/web/guides/overview) — OAuth 2.0 (Options A & B)
- [Google Sheets API v4](https://developers.google.com/sheets/api) — data storage (Options A & B)
- [Google Drive API v3](https://developers.google.com/drive/api) — receipt photo storage (Option A)
- [Google Apps Script](https://developers.google.com/apps-script) — serverless API backend (Option C, no OAuth)
- Custom CSS design system — mobile-first, no frameworks, design tokens via CSS custom properties

---

## Contributing

### First-time setup

```bash
git clone https://github.com/DazedNConfused-/local-expense-tracker.git
cd local-expense-tracker
npm install        # installs dev tools and activates Git hooks
```

### Development workflow

```bash
npm run lint       # check JS for errors (ESLint)
npm run lint:fix   # auto-fix fixable lint issues
npm test           # run unit tests with coverage report
```

### Commit conventions

This project uses [Conventional Commits](https://conventionalcommits.org). Every commit message must follow the format:

```
<type>(<optional scope>): <description>

Examples:
  feat: add dark mode toggle
  fix(i18n): correct es-AR currency label
  chore: bump APP_VERSION to 1.7.0
  docs: update contributing guide
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `revert`.

The `commit-msg` Git hook will reject commits that don't follow this format.

### Pull requests

- CI runs automatically on every PR (lint + tests must pass before merge)
- Fill in the PR template — description, testing notes, and checklist
- Keep runtime files (`index.html`, `js/*.js`, `css/`) changes separate from tooling changes
