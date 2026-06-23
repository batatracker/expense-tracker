## Why

The app currently tracks expenses and debts but has no visibility into income, making it impossible to understand net cashflow or financial health. Adding income tracking closes the loop — users can see what they earn, what they owe, and what truly remains.

## What Changes

- New **Income** section in the app for logging positive cashflow entries (salary, freelance, transfers in, etc.)
- Income entries carry over month-to-month additively — unspent income accumulates into the next month's starting balance
- A **Balance Reconciliation** mechanism lets users correct discrepancies between tracked balance and real cash on hand (implemented as a signed adjustment entry, negative = shortfall, positive = surplus)
- Dashboard updated to reflect net balance: income − expenses − debt payments ± reconciliation adjustments
- UI follows the existing design language with design-taste-frontend quality standards

## Capabilities

### New Capabilities

- `income-entry`: Log a positive cashflow record (source, amount, date, optional note); entries are month-scoped but carry forward cumulatively
- `income-list`: View, filter, and delete income entries; monthly summary with carry-over balance shown
- `balance-reconciliation`: Add a reconciliation adjustment to align tracked balance with real-world cash; stored as a special signed entry and surfaced in the dashboard

### Modified Capabilities

- `dashboard`: Net balance widget updated to incorporate total income, carry-over, and reconciliation adjustments alongside existing expense/debt data

## Impact

- `js/sheets.js` and `js/appscript.js` — new tab/sheet for income entries + reconciliation entries; new API methods for CRUD on both
- `index.html` — new Income section nav + view
- `css/` — styling for income cards and reconciliation panel
- Dashboard summary card updated (existing `dashboard` spec behavior extended)
- No breaking changes to existing expense or debt data structures
