## Why

Tracking personal expenses manually is tedious, and existing apps either require subscriptions or lock data in proprietary formats. This project delivers a free, mobile-first expense tracker that stores all data in a user-owned Google Sheet — giving full data portability and the ability to work directly in the spreadsheet when needed.

## What Changes

This is a greenfield project. The following is introduced:

- A static web app (HTML/CSS/JS) deployable to GitHub Pages — no server required
- Google Sheets integration via the Google Sheets API v4 as the sole data store
- Google OAuth 2.0 for authentication and Sheets/Drive API access
- Mobile-first, touch-optimized UI with premium visual design (leveraging design-taste-frontend skill)
- Expense entry form: amount, category, date, merchant, notes, optional receipt image
- Receipt/document capture: camera access on mobile, file upload on desktop — files uploaded to Google Drive and linked in the sheet
- Expense list view with search, filter by category/date range, and sort
- Dashboard with spending summaries, category breakdowns, and monthly trends
- The Google Sheet is structured to be human-readable and independently usable (labeled columns, formatted cells, summary formulas)

## Capabilities

### New Capabilities

- `google-auth`: Google OAuth 2.0 sign-in flow; manages access tokens for Sheets and Drive APIs
- `google-sheets-sync`: Read/write expenses to a user-owned Google Sheet; sheet is structured for standalone usability with headers, formatting, and summary rows
- `expense-entry`: Add and edit expense records (amount, date, category, merchant, notes, receipt link)
- `expense-list`: View, search, filter, and sort expenses; delete individual records
- `receipt-capture`: Capture or upload receipt images/documents; upload to Google Drive and store the file URL in the sheet cell
- `dashboard`: Summary view showing total spend, category breakdown (pie/bar chart), and monthly trend; computed from sheet data

### Modified Capabilities

_(none — greenfield project)_

## Impact

- **Runtime**: 100% client-side JavaScript; no backend server or database
- **Hosting**: GitHub Pages (static files only)
- **External APIs**: Google Sheets API v4, Google Drive API v3, Google Identity Services (OAuth 2.0)
- **Dependencies**: Vanilla JS or lightweight framework (e.g., Preact/Alpine.js); Chart.js for dashboard charts; no heavy build toolchain required for GitHub Pages simplicity
- **Data ownership**: All expense data lives in the user's own Google account; app stores no data itself
- **Receipt attachments**: Uploading to Google Drive requires Drive API scope; files are stored in a dedicated `ExpenseTracker/Receipts` folder in the user's Drive and linked as clickable URLs in the sheet — this is fully supported by the API
