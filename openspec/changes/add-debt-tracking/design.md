## Context

The app is a single-page Alpine.js application backed by Google Sheets. All data lives in a user-owned Google Sheets spreadsheet. Expenses are stored one-row-per-entry in monthly tabs ("Jun 2026", "Jul 2026", etc.). There is currently no concept of debts or ongoing liabilities.

The two backend modes (OAuth + Sheets API via `sheets.js`, and Apps Script via `appscript.js`) both need to support the new debt data. Both share the same adapter interface (`_dbRead`, `_dbAppend`, `_dbUpdate`, `_dbDelete`) in `app.js`.

## Goals / Non-Goals

**Goals:**
- Store debt records in a dedicated "Debts" sheet tab with columns for ID, Source, Total Amount, Outstanding Balance, Currency, Due Date, Notes, Status (open/paid), Created At.
- Store payment records in a dedicated "Debt Payments" sheet tab with columns for ID, Debt ID, Amount, Currency, Date, Notes, Created At.
- Aggregate debt cards by source name (case-insensitive) in the UI.
- Auto-create a standard expense row in the monthly tab whenever a payment is recorded, keeping payment spending visible in existing charts and totals.
- Add "Debt Payment" as a built-in category in `config.js`.

**Non-Goals:**
- Interest/amortization calculations.
- Shared debts or split payments between users.
- Currency conversion across multi-currency debts in a single aggregated total (show per-currency instead).
- Modifying existing monthly expense tab schema.

## Decisions

### Decision: Separate "Debts" and "Debt Payments" sheet tabs (not monthly tabs)

**Chosen**: Two permanent tabs — "Debts" and "Debt Payments" — alongside the monthly expense tabs.

**Rationale**: Debts are ongoing records that span months and don't belong in a monthly tab. Separating them keeps the expense tab schema untouched and avoids ambiguity. Payments, however, also write a row into the relevant monthly expense tab (via the existing `_dbAppend` flow) so they appear in spending totals — this dual-write is intentional.

**Alternative considered**: Storing debts in localStorage or a separate JSON blob in a Drive file. Rejected because the Sheets backend is the single source of truth; mixing storage backends would complicate sync and backup.

### Decision: Outstanding balance computed and stored, not always derived

**Chosen**: The "Debts" tab stores both `totalAmount` and `outstandingBalance` columns. Each payment update decrements `outstandingBalance` in place.

**Rationale**: Summing all payments on every read is possible but requires a full scan of the "Debt Payments" tab filtered by debt ID — expensive and slow with many records. Storing the running balance is an O(1) read at the cost of an extra write per payment.

**Alternative considered**: Derive balance by summing payments each time. Rejected for performance reasons and because the Sheets API charges per request.

### Decision: Source aggregation happens client-side in Alpine.js

**Chosen**: The "Debts" tab stores individual debt rows (one per debt entry). Alpine.js groups them by `source` (lowercased) using a computed getter before rendering.

**Rationale**: The Sheets API does not support `GROUP BY`. Client-side grouping is straightforward with `Array.reduce` and keeps the data model simple (flat list of debts).

### Decision: Payment creates an expense row via existing `_dbAppend`

**Chosen**: When a payment is saved, the code calls the existing `_dbAppend` flow with a synthesized expense object (category: "Debt Payment", merchant: debt source, etc.) in addition to writing a row to "Debt Payments" tab.

**Rationale**: Reuses the entire existing expense pipeline — monthly tab creation, column mapping, dashboard aggregation — with zero changes to expense logic. The payment naturally flows into charts, filters, and search.

### Decision: "Debt Payment" built-in category added to `config.js`

**Chosen**: Add a new entry to `CONFIG.CATEGORIES` with a dedicated icon (💳) and color.

**Rationale**: Ensures the category is always available in filters and the chart legend without requiring user setup. Keeping it in config.js makes it translatable and theme-aware.

## Risks / Trade-offs

- **Dual-write consistency**: A payment saves to "Debt Payments" tab AND writes an expense row. If one write succeeds and the other fails (network error), data is inconsistent. → Mitigation: Perform the expense write first (it's idempotent via ID), then update the debt balance. Display an error and allow retry if either step fails; do not decrement the UI balance until both writes confirm.
- **Sheets tab proliferation**: Adding "Debts" and "Debt Payments" tabs to existing spreadsheets requires auto-creation on first use, similar to how monthly tabs are created. → Mitigation: Follow the existing `_ensureMonthTab` pattern with `_ensureDebtsTabs()`.
- **Apps Script backend**: The Apps Script backend (`appscript.js`) requires equivalent server-side functions for debt/payment CRUD. This adds surface area to the user-deployed script. → Mitigation: Document clearly in the setup guide; provide the updated Apps Script code as a copy-paste block.
- **Source name normalization**: Two debts typed as "Bank of America" and "bank of america" will aggregate together. A typo creates a separate card. → Mitigation: Trim and lowercase for grouping only; display the original casing from the first-encountered entry. Consider a source autocomplete in the debt form.

## Migration Plan

1. On first debt creation (or first app load post-update), `_ensureDebtsTabs()` checks for "Debts" and "Debt Payments" tabs and creates them with headers if absent. No migration needed for existing data.
2. The new "Debt Payment" category is additive in `config.js` — no impact on existing expense rows.
3. No schema changes to monthly expense tabs.
4. Rollback: remove the two new tabs from the spreadsheet and revert the JS/HTML/config changes.

## Open Questions

- Should paid debts be permanently deletable, or only archivable? (Current proposal: deletable with confirmation.)
- Should the "Debt Payment" category be excluded from the default budget/spending limit calculations if those are added in future? (Punt to future change.)
- Should the payment form allow a currency different from the debt's currency (e.g., paying a USD debt with EUR)? (Current proposal: currency defaults to debt currency but is editable.)
