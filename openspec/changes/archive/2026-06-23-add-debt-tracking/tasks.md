## 1. Config & Category

- [x] 1.1 Add "Debt Payment" built-in category to `CONFIG.CATEGORIES` in `config.js` with icon 💳 and a distinct color
- [x] 1.2 Add translation keys for all new debt-related labels in `js/i18n.js` (en-GB and es-AR)

## 2. Data Layer — Sheets Backend

- [x] 2.1 Add `_ensureDebtsTabs()` in `js/sheets.js` that creates "Debts" and "Debt Payments" tabs with correct headers if they don't exist
- [x] 2.2 Implement `Sheets.readAllDebts()` to fetch all rows from the "Debts" tab and return structured debt objects
- [x] 2.3 Implement `Sheets.appendDebt(debt)` to write a new debt row to the "Debts" tab
- [x] 2.4 Implement `Sheets.updateDebt(debt)` to update an existing debt row (finds by ID, updates all columns)
- [x] 2.5 Implement `Sheets.deleteDebt(debtId)` to delete a debt row by ID
- [x] 2.6 Implement `Sheets.readDebtPayments(debtId)` to fetch payment rows for a given debt ID from "Debt Payments" tab
- [x] 2.7 Implement `Sheets.appendDebtPayment(payment)` to write a new row to the "Debt Payments" tab
- [x] 2.8 Implement `Sheets.deleteDebtPayment(paymentId)` to remove a payment row by ID from "Debt Payments" tab

## 3. Data Layer — Apps Script Backend

- [x] 3.1 Add server-side Apps Script functions for debt CRUD: `getDebts`, `appendDebt`, `updateDebt`, `deleteDebt`
- [x] 3.2 Add server-side Apps Script functions for payment CRUD: `getDebtPayments`, `appendDebtPayment`, `deleteDebtPayment`
- [x] 3.3 Update `js/appscript.js` client wrappers to call the new Apps Script endpoints

## 4. App State & Logic (app.js)

- [x] 4.1 Add `debts[]`, `debtPayments{}` (keyed by debtId), and `showPaidDebts` to Alpine.js state
- [x] 4.2 Add `_dbReadDebts()`, `_dbAppendDebt()`, `_dbUpdateDebt()`, `_dbDeleteDebt()` adapter methods (route to Sheets or AppScript)
- [x] 4.3 Add `_dbReadDebtPayments()`, `_dbAppendDebtPayment()`, `_dbDeleteDebtPayment()` adapter methods
- [x] 4.4 Add `loadDebts()` method that calls `_dbReadDebts()`, stores results in `debts[]`, and calls `_ensureDebtsTabs()` on first run
- [x] 4.5 Add `groupedDebts` computed getter that groups `debts[]` by lowercased source name and sums outstanding balances per group
- [x] 4.6 Add `openAddDebt()` and `openEditDebt(debt)` methods to open the debt form modal with pre-filled values
- [x] 4.7 Add `saveDebt()` method: validates form, calls `_dbAppendDebt` or `_dbUpdateDebt`, refreshes `debts[]`
- [x] 4.8 Add `confirmDeleteDebt(debtId)` method with confirmation prompt, then `_dbDeleteDebt`, refresh `debts[]`
- [x] 4.9 Add `openPaymentForm(debt)` method to open the payment modal pre-filled with debt currency and today's date
- [x] 4.10 Add `savePayment()` method: validates form, calls `_dbAppendDebtPayment`, updates debt `outstandingBalance` via `_dbUpdateDebt`, synthesizes and appends an expense object via `_dbAppend`, marks debt paid if balance reaches zero
- [x] 4.11 Add `loadDebtPayments(debtId)` method to load and store payment history for a specific debt
- [x] 4.12 Extend `dashboardSummary` computed getter to include `debtSummary` (outstanding balances grouped by currency)
- [x] 4.13 Call `loadDebts()` during app initialization alongside `loadExpenses()`

## 5. UI — Debts View (index.html)

- [x] 5.1 Add Debts navigation item (icon: 🏦 or similar) to the sidebar that sets `currentView = 'debts'`
- [x] 5.2 Create the Debts view section: source-aggregated cards with creditor name, outstanding balance, currency, and progress bar
- [x] 5.3 Make each source card expandable (Alpine.js `x-show`) to reveal individual debt entries beneath
- [x] 5.4 Add "Add Debt" button in the Debts view header
- [x] 5.5 Add "Show paid" toggle that binds to `showPaidDebts` and filters paid debt entries into/out of the view
- [x] 5.6 Add empty state message for when `debts.length === 0`
- [x] 5.7 Render individual debt entries with: amount, outstanding balance, due date, notes, Edit button, Delete button, Pay button, and payment history toggle
- [x] 5.8 Add payment history sub-list per debt entry (hidden by default, shown via toggle) listing payments in reverse-chronological order
- [x] 5.9 Apply "Paid" visual treatment (badge or strikethrough) to debt entries where `outstandingBalance === 0`

## 6. UI — Debt Form Modal (index.html)

- [x] 6.1 Create debt form modal with fields: Source/Creditor (text, required), Amount (number, required), Currency (select, required), Due Date (date, optional), Notes (textarea, optional)
- [x] 6.2 Add Source autocomplete suggestions based on existing unique source names in `debts[]`
- [x] 6.3 Wire form validation (inline errors for missing required fields, non-positive amounts)
- [x] 6.4 Wire Save and Cancel buttons to `saveDebt()` and close modal

## 7. UI — Payment Form Modal (index.html)

- [x] 7.1 Create payment form modal with fields: Amount (number, required), Currency (select, defaults to debt currency), Date (date, required, defaults to today), Notes (textarea, optional)
- [x] 7.2 Show the debt's current outstanding balance in the payment modal as context
- [x] 7.3 Wire validation: amount must be > 0 and ≤ outstanding balance
- [x] 7.4 Wire Save and Cancel buttons to `savePayment()` and close modal

## 8. UI — Dashboard Widget (index.html)

- [x] 8.1 Add total outstanding debt summary widget to the dashboard, below or beside existing summary cards
- [x] 8.2 Render per-currency outstanding totals when debts span multiple currencies
- [x] 8.3 Add a "View Debts" link from the widget that navigates to the Debts view

## 9. Styling (css/app.css)

- [x] 9.1 Add styles for debt source cards (header, balance, progress bar, expand chevron)
- [x] 9.2 Add styles for individual debt entries within expanded source cards
- [x] 9.3 Add styles for payment history sub-list
- [x] 9.4 Add "Paid" badge style and strikethrough treatment for fully-paid debts
- [x] 9.5 Add progress bar component style (used in source cards to show paid vs. outstanding ratio)

## 10. End-to-End Verification

- [x] 10.1 Verify creating a debt writes a row to the "Debts" tab with correct columns
- [x] 10.2 Verify recording a payment decrements `outstandingBalance` in the "Debts" tab and writes to "Debt Payments" tab
- [x] 10.3 Verify a payment also creates an expense row in the correct monthly tab with category "Debt Payment"
- [x] 10.4 Verify the expense from the payment appears in the Expenses view and dashboard totals
- [x] 10.5 Verify debts with the same source aggregate correctly in the UI
- [x] 10.6 Verify paying off a debt fully marks it as paid and the source card updates
- [x] 10.7 Verify the Apps Script backend produces the same behavior as the Sheets API backend
