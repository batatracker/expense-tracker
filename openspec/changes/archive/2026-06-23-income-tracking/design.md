## Context

The app is a vanilla JS / Alpine.js single-page app backed by Google Sheets (two modes: OAuth via `sheets.js`, and Apps Script via `appscript.js`). Existing features (expenses, debts, debt payments) each get their own sheet tab and an in-memory cache populated at load time. The dashboard computes everything client-side from those caches.

Income tracking needs to fit the same pattern: a dedicated sheet tab, an in-memory cache, and client-side computations for the dashboard. Balance reconciliation shares the same sheet tab as income, distinguished by a `type` column.

## Goals / Non-Goals

**Goals:**
- Log positive cashflow entries (source, amount, currency, date, optional note)
- Compute cumulative carry-over balance: income accumulated minus expenses, rolled forward each month
- Provide a balance reconciliation mechanism: a signed adjustment entry that corrects the tracked balance to match real cash on hand
- Surface net balance and income summary on the dashboard
- Support both OAuth and Apps Script backend modes

**Non-Goals:**
- Income categories / recurring income scheduling
- Multi-currency conversion (use amounts as-is, same as expenses)
- Budget planning or projections
- Editing income or reconciliation entries (delete + re-add is sufficient for v1)

## Decisions

### D1: Single "Income" sheet tab for both income and reconciliation entries

Both entry types live in one tab with a `type` column (`income` | `reconciliation`). Reconciliation entries carry a signed amount (negative = cash is less than tracked, positive = more).

**Why**: Keeps the sheet structure minimal and the backend API surface small. Reconciliation is semantically an income-side adjustment. Avoids a third tab that would be sparsely populated.

**Alternative considered**: Separate "Reconciliation" tab — rejected because it adds backend complexity for minimal gain.

### D2: Carry-over computed entirely client-side

The carry-over balance is calculated at render time by:
1. Sorting all months from oldest to newest
2. For each month: `carryIn + income - expenses + reconciliation = closing balance = next month's carryIn`

**Why**: Consistent with how the dashboard works today — no extra API calls after initial load. The full income and expense caches are already in memory.

**Alternative considered**: Storing carry-over in the sheet — rejected because it creates a derived-data synchronization problem.

### D3: Reconciliation entry is a signed amount, not a "target balance"

The user enters the *difference* (or uses a helper that computes `realCash - trackedBalance`). The entry is stored as a signed amount.

**Why**: Simpler storage. The UI can provide a "current tracked balance" readout so users can compute the delta visually. A "set to target" UX risks confusion if the user enters the wrong number.

### D4: Net balance on dashboard = cumulative carry-over through end of current month

`netBalance = sum(all income entries) + sum(all reconciliation entries) - sum(all expenses)`

This is the single source of truth. The per-month breakdown is shown in the Income view.

**Why**: Avoids re-implementing month-boundary logic in the dashboard; the scalar is sufficient for the summary card.

### D5: Income view is a new top-level section (nav item)

A dedicated "Income" section appears in the bottom navigation alongside Expenses and Debts.

**Why**: Income is conceptually distinct from expenses. Putting it in a modal or sidebar would bury it. The app already has 5 nav slots (Dashboard, Expenses, Add, Debts, Settings) — Income can replace or sit alongside these (exact nav layout is a UI decision for implementation).

## Risks / Trade-offs

- **Carry-over accuracy depends on complete history**: If the user's sheet has gaps (entries deleted outside the app), carry-over will be wrong. → Mitigation: reconciliation entries exist precisely to correct this.
- **No multi-currency income**: If income and expenses use different currencies, the net balance is meaningless. → Mitigation: out of scope for v1; document the assumption that all amounts share a base currency.
- **Sheet tab bootstrap**: New users won't have the Income tab; the app must create it on first use (same pattern as Debts). → Mitigation: `_ensureIncomeTabs()` method added to both `sheets.js` and `appscript.js`.

## Migration Plan

1. Existing users: on first Income tab interaction the app auto-creates the Income tab (no data migration needed).
2. Apps Script users: a new version of the deployed script is required to handle income CRUD. Existing `scriptOutdated` banner will prompt users to redeploy.
3. No rollback concerns — adding a sheet tab is non-destructive to existing data.

## Open Questions

- Should the bottom nav be reorganized (e.g., merge Add Expense FAB into a global Add button that contextually adds income or expense)? Deferred to implementation — keep separate FABs for v1.
- Locale/translation strings for income UI — will need keys added to `i18n.js` for all supported locales.
