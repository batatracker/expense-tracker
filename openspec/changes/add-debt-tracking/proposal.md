## Why

Users often carry ongoing debts (credit cards, loans, friends) alongside regular expenses, but the app offers no way to track what is owed or to whom. Without this, users must maintain a separate record of debts and cannot see the full picture of their financial obligations alongside spending.

## What Changes

- Add a **Debts** section where users can create and manage debt records.
- Debts from the same source (creditor name) are unified into a single aggregated view showing total outstanding balance, with individual debt entries collapsible underneath.
- Recording a payment toward a debt automatically creates an expense entry with a dedicated "Debt Payment" category so payments appear in spending totals, budgets, and charts.
- A new **Debts** navigation item links to the debts view.
- The dashboard gains a summary widget showing total outstanding debt across all sources.

## Capabilities

### New Capabilities

- `debt-management`: Track individual debts by creditor/source, amount, currency, due date, and notes. Debts with the same source are aggregated into a unified card showing the combined outstanding balance and payment progress.
- `debt-payments`: Record partial or full payments against a debt entry. Each payment creates a linked expense (category: "Debt Payment") so it flows into expense totals, monthly tabs in Google Sheets, and dashboard charts.

### Modified Capabilities

<!-- No existing spec-level requirements change -->

## Impact

- **`js/app.js`**: New state for debts, debt form, debt list view, payment form. New DB methods for debt CRUD. Dashboard summary extended with debt totals.
- **`js/sheets.js`**: New dedicated sheet tab ("Debts") with debt rows; payment records written to monthly expense tabs as normal expense rows.
- **`js/appscript.js`**: Equivalent Debt CRUD operations for the Apps Script backend.
- **`config.js`**: New built-in category "Debt Payment" added to CATEGORIES.
- **`index.html`**: New Debts view template, navigation icon, debt form modal, payment modal.
- **`js/i18n.js`**: New translation keys for debt-related labels.
- **No breaking changes** to existing expense schema or monthly tab structure.
