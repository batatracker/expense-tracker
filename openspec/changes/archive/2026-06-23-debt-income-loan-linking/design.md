## Context

The app tracks debts and income as independent record types stored in separate sheet tabs (Debts, Income). A loan is a dual-sided event: taking a loan creates both a debt (obligation to repay) and income (cash received). Currently users must create both records manually with no linkage between them. This leads to records that drift out of sync (different amounts, dates) and no way to identify which income entries correspond to loan proceeds vs. earned income.

Current data shapes:
- Debt record: `{ id, type: 'debt', source, totalAmount, outstandingBalance, currency, date, notes }`
- Income record: `{ id, type: 'income', source, amount, currency, date, notes }`

## Goals / Non-Goals

**Goals:**
- Add an optional "Is this a loan?" toggle to both the debt creation form and the income creation form.
- When the toggle is on, auto-create the counterpart record (income for a new debt-loan; debt for a new income-loan) with matching source, amount, currency, and date.
- Link both records with a shared `loanId` UUID so either side can reference its counterpart.
- Show a clear two-record confirmation summary before saving, so the user knows exactly what two rows will be written.
- Surface the linked counterpart in the debt detail / income detail views (read-only label + link).
- Support both auth modes (sheets.js + appscript.js).

**Non-Goals:**
- Editing a loan record does not cascade updates to its counterpart (keep it simple; the link is informational).
- Deleting a loan record does not auto-delete its counterpart.
- Repayment tracking for loan-income counterparts (out of scope; handled by debt-payments).
- Lending money outward (expense-side loans) — only debt↔income linking for this iteration.

## Decisions

### Decision: `loanId` as a shared UUID on both records
Both records receive the same `loanId` value generated at save time. This is a single nullable field appended to each row. No join table or separate tab is needed.

**Alternative considered**: A separate "Loans" tab with foreign keys. Rejected — adds complexity, a new tab bootstrap flow, and a new data type for what is essentially a UI convenience linking two existing record types.

### Decision: Sequential writes (debt first, then income, or vice versa)
The two records are written one after the other in the same save handler, not in a single batch. If the second write fails, the first record exists without its counterpart — but this is the same failure mode as the existing save handlers and is acceptable for this app's scale. A toast warns the user on partial failure.

**Alternative considered**: Atomic batch write via Sheets batchUpdate. Too complex for marginal gain; appscript mode has no batch primitive.

### Decision: Loan toggle is on the creation form only (not edit)
Editing an existing record to retroactively add a counterpart is complex (what if the counterpart already exists?). The loan toggle only appears when `debtForm.id` / `incomeForm.id` is null (new record mode).

### Decision: Confirmation panel inline in the form (not a separate modal)
A collapsible/animated inline summary appears below the form when the loan toggle is on, showing both records that will be created. This avoids a modal stack and keeps context clear on mobile.

**Alternative considered**: A full confirmation modal before submit. Rejected — adds a step and hides form context.

### Decision: `loanId` field appended to existing sheet columns
Both the Debts and Income sheet tabs gain an optional `loanId` column. Because the app reads columns by header name (not positional index), adding a new column to the right is backwards-compatible with existing rows.

## Risks / Trade-offs

- **Partial write failure** → One record saved, counterpart missing. Mitigation: toast error message "Debt saved but income counterpart failed — please add it manually." User retains the first record.
- **loanId column missing on old sheets** → Old rows simply have no `loanId` value; the app treats `undefined`/empty as "no linked counterpart". No migration needed.
- **Appscript backend column support** → AppScript handler must be updated to accept and persist `loanId`. Mitigation: Add `loanId` parameter to `appendDebt` and `appendIncome` calls; default to `''` if not provided.
- **User confusion about what "loan toggle" means** → Mitigation: label reads "This is a loan (creates a paired [income/debt] entry)" with a brief inline explanation. The confirmation panel reinforces the action before submit.

## Migration Plan

1. No data migration required for existing records — `loanId` is additive and optional.
2. Sheet column bootstrap: `loanId` is appended when a new row is written; existing rows are untouched.
3. Deploy: bump `APP_VERSION` in config.js and update `?v=` cache-busting suffix in index.html.
4. Rollback: revert JS/HTML/CSS changes; existing sheet data remains valid.

## Open Questions

- Should the income counterpart for a debt-loan default `type: 'income'` (standard income) or a new `type: 'loan-income'`? **Leaning toward `type: 'income'`** to keep it consistent with existing income records and avoid filtering complexity — the `loanId` field is enough to identify it as loan-derived.
