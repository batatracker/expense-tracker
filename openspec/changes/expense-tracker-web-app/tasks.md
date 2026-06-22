## 1. Project Setup & Configuration

- [x] 1.1 Create project directory structure: `index.html`, `config.js`, `css/`, `js/`, `assets/`
- [x] 1.2 Set up `config.js` with `GOOGLE_CLIENT_ID` constant and default currency setting
- [x] 1.3 Create `index.html` shell with Alpine.js CDN, Chart.js CDN, Google Identity Services CDN, and hash-router scaffold
- [ ] 1.4 Configure GitHub Pages in repo settings (serve from `main` branch root or `docs/` folder)
- [ ] 1.5 Create Google Cloud project, enable Sheets API v4 and Drive API v3
- [ ] 1.6 Create OAuth 2.0 Client ID (web application), add GitHub Pages URL and `localhost` as authorized JavaScript origins

## 2. Design System & CSS

- [x] 2.1 Define CSS custom properties: color palette (primary, surface, text, error, success), spacing scale, border-radius tokens, shadow levels
- [x] 2.2 Implement base reset and typography styles (system font stack, fluid type scale)
- [x] 2.3 Build bottom navigation bar component (4 tabs: Dashboard, Expenses, Add, Settings) with active state and mobile safe-area insets
- [x] 2.4 Build card component styles used across expense list, dashboard summary, and detail views
- [x] 2.5 Build floating action button (FAB) component for quick expense add
- [x] 2.6 Build form input, select, and textarea styles with focus/error states
- [x] 2.7 Build toast/snackbar notification component (success, warning, error variants)
- [x] 2.8 Build modal/bottom-sheet component for expense detail and confirmations
- [x] 2.9 Implement loading skeleton shimmer for list and chart placeholders
- [x] 2.10 Implement empty state component (illustration + message)

## 3. Google Authentication

- [x] 3.1 Implement `auth.js` module: initialize Google Identity Services with Client ID and required scopes (spreadsheets, drive.file)
- [x] 3.2 Build sign-in screen view (centered card, "Sign in with Google" button, app name/tagline)
- [x] 3.3 Implement token storage in `sessionStorage` on successful sign-in
- [x] 3.4 Implement sign-out: revoke token, clear sessionStorage, redirect to sign-in screen
- [x] 3.5 Implement 401 interceptor: detect expired token on any API call, display "Session expired" toast, redirect to sign-in
- [x] 3.6 Restore session on page reload: check sessionStorage for existing token and skip sign-in screen if valid

## 4. Google Sheets Integration

- [x] 4.1 Implement `sheets.js` module with helper for authenticated fetch against Sheets API v4
- [x] 4.2 Implement `findOrCreateSheet()`: search Drive for `ExpenseTracker` sheet by name, create it if not found, store Sheet ID in localStorage
- [x] 4.3 Implement `writeHeader()`: write bold, frozen header row with defined column schema to new sheet
- [x] 4.4 Implement `readAllExpenses()`: fetch all rows, parse header row to build column index map, return array of expense objects
- [x] 4.5 Implement `appendExpense(expense)`: append a new expense row to the sheet
- [x] 4.6 Implement `updateExpense(expense)`: find row by ID column, update all fields via batchUpdate
- [x] 4.7 Implement `deleteExpense(id)`: find row by ID column, delete the row via deleteRows request
- [x] 4.8 Handle 404 on stored Sheet ID: clear localStorage Sheet ID and re-run `findOrCreateSheet()`

## 5. Expense Entry Form

- [x] 5.1 Build add/edit expense view with form fields: Amount (number input), Currency (text, defaulted from config), Date (date picker, defaults to today), Category (select dropdown), Merchant (text), Notes (textarea)
- [x] 5.2 Implement category dropdown with full preset list and "Other" option (reveals custom text input)
- [x] 5.3 Implement client-side form validation: required fields (Amount, Category), positive numeric amount, inline error messages
- [x] 5.4 Wire "Save" button to `appendExpense()` for new expenses, update in-memory cache, show success toast, navigate back
- [x] 5.5 Wire edit mode: pre-populate form from selected expense, wire "Save" to `updateExpense()`, update cache, show success toast
- [x] 5.6 Implement discard confirmation when user navigates away from a dirty form

## 6. Receipt Capture & Drive Upload

- [x] 6.1 Build receipt attachment section in expense form: "Take Photo" button (mobile camera via `capture="environment"`), "Upload File" button (file picker, accept image/* and .pdf)
- [x] 6.2 Implement client-side image compression: Canvas API resize to max 1600px longest side, JPEG re-encode at quality 0.82
- [x] 6.3 Implement `drive.js` module: `findOrCreateReceiptsFolder()` creates `ExpenseTracker/Receipts` hierarchy in Drive, stores folder IDs in localStorage
- [x] 6.4 Implement `uploadReceipt(file, expenseName)`: multipart upload to Drive API v3, set sharing to "anyone with link can view", return `webViewLink`
- [x] 6.5 Show receipt thumbnail preview (image) or filename (PDF) in form after selection; provide "Remove" button
- [x] 6.6 On expense save with attachment: run upload before sheet write; on upload failure show warning toast and save expense without receipt URL
- [x] 6.7 Show "View Receipt" link in expense detail view when Receipt URL is present; open in new tab
- [x] 6.8 Show "Add Receipt" / "Replace Receipt" button in expense detail for retroactive attachment; run upload and `updateExpense()` with new URL

## 7. Expense List View

- [x] 7.1 Build expense list view rendering cached expenses as cards (date, merchant/category, amount + currency, category badge)
- [x] 7.2 Implement default sort: reverse-chronological (newest first)
- [x] 7.3 Build search input with real-time filtering against merchant, notes, and category fields (case-insensitive)
- [x] 7.4 Build filter panel (collapsible): category multi-select checkboxes, start/end date pickers, "Clear filters" button
- [x] 7.5 Implement sort control: Date Newest, Date Oldest, Amount High-Low, Amount Low-High
- [x] 7.6 Build expense detail bottom-sheet: all fields, receipt thumbnail/link, Edit and Delete buttons
- [x] 7.7 Implement delete flow: confirmation dialog → `deleteExpense()` → remove from cache → toast → close detail sheet
- [x] 7.8 Implement empty state and "no results" states for list and search/filter

## 8. Dashboard View

- [x] 8.1 Build Dashboard view layout: period selector at top, summary card, category chart, trend chart, recent expenses list
- [x] 8.2 Implement period selector component: This Month, Last Month, Last 3 Months, This Year, All Time
- [x] 8.3 Implement `computeSummary(expenses, period)`: filter by period, total amount, group by category
- [x] 8.4 Render monthly total summary card with formatted currency amount
- [x] 8.5 Render Chart.js donut chart for category breakdown with legend (category name + percentage)
- [x] 8.6 Render Chart.js bar chart for 6-month trend (zero bars for months with no spend)
- [x] 8.7 Render recent expenses list (5 most recent by date) with "View all" link to Expenses view
- [x] 8.8 Ensure Dashboard recomputes from cache on period change and after expense add/edit/delete

## 9. Settings View

- [x] 9.1 Build Settings view with: default currency input, sign-out button, link to open the Google Sheet directly, "Re-link Sheet" option (clear stored Sheet ID and re-run setup)
- [x] 9.2 Persist settings (default currency) in localStorage
- [x] 9.3 Display Google account name and profile picture in Settings header
- [x] 9.4 Add "About" section with app version and link to GitHub repo

## 10. Polish & Quality

- [ ] 10.1 Test full flow on mobile (iOS Safari, Android Chrome): sign-in, add expense, camera capture, view list, dashboard
- [ ] 10.2 Verify sheet is human-readable when opened directly in Google Sheets (headers visible, dates formatted, receipt URLs are clickable)
- [x] 10.3 Add `manifest.json` and meta tags for PWA-lite: theme color, viewport, apple-touch-icon so app can be added to home screen
- [x] 10.4 Implement pull-to-refresh gesture on expense list to force re-fetch from sheet
- [x] 10.5 Add keyboard accessibility: focus management on modal open/close, ARIA labels on icon buttons
- [ ] 10.6 Verify GitHub Pages deployment: push to configured branch, confirm app loads at `<username>.github.io/<repo>/`
- [x] 10.7 Write `README.md` with setup instructions: Google Cloud project setup, OAuth Client ID configuration, deployment steps
