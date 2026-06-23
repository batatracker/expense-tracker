## 1. Data Layer — Backend API (sheets.js & appscript.js)

- [x] 1.1 Add `_ensureIncomeTabs()` to `sheets.js` that creates the Income tab with columns `id, type, source, amount, currency, date, notes` if it doesn't exist
- [x] 1.2 Add `loadIncome()` to `sheets.js` that fetches all rows from the Income tab and returns them as an array of objects
- [x] 1.3 Add `addIncomeEntry(entry)` to `sheets.js` that appends a row with `type=income`
- [x] 1.4 Add `addReconciliationEntry(entry)` to `sheets.js` that appends a row with `type=reconciliation`
- [x] 1.5 Add `deleteIncomeEntry(id)` to `sheets.js` that finds and deletes the row by UUID
- [x] 1.6 Mirror all five methods in `appscript.js` (Apps Script backend path)
- [x] 1.7 Update the Apps Script server-side code (if maintained in repo) to handle income tab CRUD and bump `CONFIG.SCRIPT_VERSION`

## 2. App State — Alpine.js (app.js)

- [x] 2.1 Add `income: []` array to app state (alongside `expenses` and `debts`)
- [x] 2.2 Add income form state: `incomeForm: { id, source, amount, currency, date, notes }` and `incomeFormErrors: {}`
- [x] 2.3 Add reconciliation form state: `reconcileForm: { amount, date, notes }` and `reconcileFormErrors: {}`
- [x] 2.4 Add `showIncomeForm`, `showReconcileForm`, `isSavingIncome`, `isDeletingIncome` boolean flags
- [x] 2.5 Call `loadIncome()` during app initialization (after auth), populate `income` array; handle missing tab gracefully
- [x] 2.6 Implement `openAddIncome()` — resets incomeForm, defaults currency and date, shows form
- [x] 2.7 Implement `saveIncome()` — validates required fields, calls `addIncomeEntry()`, pushes to cache, shows toast, closes form
- [x] 2.8 Implement `openReconcile()` — computes current tracked net balance for display, resets reconcileForm, shows form
- [x] 2.9 Implement `saveReconciliation()` — validates non-zero amount, calls `addReconciliationEntry()`, pushes to cache, shows toast, closes form
- [x] 2.10 Implement `deleteIncomeEntry(entry)` — confirms, calls backend delete, removes from cache, shows toast
- [x] 2.11 Add computed `incomeByMonth` getter that groups `income` array by calendar month (YYYY-MM key), sorted newest first
- [x] 2.12 Add computed `carryOverByMonth` getter that calculates cumulative carry-over per month using income, reconciliation entries, and cached expenses
- [x] 2.13 Add computed `totalNetBalance` getter: sum(all income amounts) + sum(all reconciliation amounts) − sum(all expense amounts)
- [x] 2.14 Add computed `currentMonthIncome` and `currentMonthReconciliation` for dashboard summary

## 3. Backend Sync — i18n Strings (i18n.js)

- [x] 3.1 Add translation keys for Income view: `income`, `add_income`, `income_source`, `income_notes`, `no_income_yet`, `income_added`, `income_deleted`, `carry_in`, `closing_balance`
- [x] 3.2 Add translation keys for Reconciliation: `reconcile_balance`, `balance_adjustment`, `current_tracked_balance`, `adjustment_amount`, `reconciliation_saved`
- [x] 3.3 Add translation keys for Dashboard: `income_this_month`, `expenses_this_month`, `net_this_month`, `total_carry_over`
- [x] 3.4 Provide translations for all new keys in `es-AR` locale (in addition to `en-GB` defaults)

## 4. UI — Income View (index.html)

- [x] 4.1 Add `icon-income` SVG symbol to the inline SVG sprite (use a trending-up / arrow-up icon)
- [x] 4.2 Add "Income" nav item to the bottom navigation bar with `icon-income`, linking to `currentView = 'income'`
- [x] 4.3 Create the Income list view section (`x-show="currentView === 'income'"`) with:
  - Month group headers showing month label, total income, carry-in, and closing balance
  - Income entry cards: source name, amount + currency, date, notes (if any), delete button
  - Reconciliation entry cards: distinct styling, "Balance adjustment" label, signed amount, date, delete button
  - Empty state when `income.length === 0`
- [x] 4.4 Add "+" FAB in the Income view that calls `openAddIncome()`
- [x] 4.5 Add "Reconcile" button (secondary, below the month list or in a header) that calls `openReconcile()`
- [x] 4.6 Create the income entry form panel/modal (`x-show="showIncomeForm"`) with fields: source (text, required), amount (number, required), currency (select), date (date, required), notes (textarea, optional); Save and Cancel buttons
- [x] 4.7 Create the reconciliation form panel/modal (`x-show="showReconcileForm"`) showing current tracked net balance as read-only reference, signed adjustment amount field, date field, notes; Save and Cancel buttons

## 5. UI — Dashboard Updates (index.html)

- [x] 5.1 Replace (or expand) the existing spending summary card to show four rows: Income this month, Expenses this month, Net this month, Total carry-over balance
- [x] 5.2 Ensure all new dashboard amounts use `Intl.NumberFormat` with the active locale and currency

## 6. UI/UX Polish — design-taste-frontend

- [x] 6.1 Apply design-taste-frontend skill to the Income view: typography hierarchy, card visual language consistent with Expenses/Debts, carry-over balance displayed with clear visual weight
- [x] 6.2 Style reconciliation entries with a distinct accent (e.g., amber/warning tone) and explicit +/− sign prefix on amounts
- [x] 6.3 Style the income entry cards with a green accent to signal positive cashflow
- [x] 6.4 Ensure the updated dashboard summary card has clear visual separation between income, expenses, net, and carry-over rows
- [x] 6.5 Verify dark-mode compatibility for all new UI elements

## 7. Testing & Verification

- [ ] 7.1 Manually test: add income entry in OAuth mode → verify row appears in Google Sheet Income tab
- [ ] 7.2 Manually test: carry-over calculation across 3+ months with mixed income, expenses, and one reconciliation entry
- [ ] 7.3 Manually test: negative reconciliation entry correctly reduces carry-over balance
- [ ] 7.4 Manually test: delete income entry and reconciliation entry, verify cache and carry-over update
- [ ] 7.5 Manually test: Apps Script mode — income CRUD works end-to-end
- [ ] 7.6 Verify `scriptOutdated` banner appears for Apps Script users with old deployment
- [ ] 7.7 Test both `en-GB` and `es-AR` locales — all new strings rendered correctly
- [ ] 7.8 Test dark mode — all new components render correctly
<!-- Tasks 7.x require live Google credentials and manual testing by the user -->
