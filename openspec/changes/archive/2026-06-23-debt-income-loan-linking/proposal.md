## Why

A loan is fundamentally a two-sided event: when a user takes out a loan, they incur a debt (obligation to repay) and simultaneously receive income (cash in hand). Today the app forces users to record these two entries separately, with no linkage between them, leading to double-entry confusion and no visibility into which income entries are loan proceeds vs. earned income. The same applies in reverse: a user lending money records an expense/outflow and could track repayments as income. Introducing a "loan" flag with automatic counterpart creation keeps both records consistent and communicates clearly to the user what is being created.

## What Changes

- **Debt creation form**: Add an optional "This is a loan" toggle. When enabled, a corresponding income entry (same amount, currency, date, and source) is auto-created and saved alongside the debt.
- **Income creation form**: Add an optional "This is a loan" toggle. When enabled, a corresponding debt entry (same amount, currency, date, and source) is auto-created and saved alongside the income.
- Both auto-created counterpart entries are linked to their origin via a shared `loanId` UUID, surfaced in the UI so the user can see the paired record.
- A clear, visible confirmation UI communicates exactly what two records will be saved before the user commits, with no guesswork.

## Capabilities

### New Capabilities
- `loan-counterpart-creation`: When a debt or income entry is flagged as a loan, the system simultaneously creates the counterpart entry (income for a new debt-loan; debt for a new income-loan), linking both records via a shared `loanId`. The user sees a clear summary of both records before saving.

### Modified Capabilities
- `debt-management`: Debt creation form gains a loan toggle; debt records may carry a `loanId` field linking to a paired income entry.
- `income-entry`: Income creation form gains a loan toggle; income records may carry a `loanId` field linking to a paired debt entry.

## Impact

- **js/app.js**: Debt and income form submit handlers updated to conditionally create a counterpart record.
- **js/sheets.js / js/appscript.js**: Both backends must support writing two records atomically (or sequentially) in a single save action. The `loanId` field is appended to both the Debts and Income sheet tabs.
- **js/i18n.js**: New i18n keys for loan toggle label, confirmation copy, and linked-record tooltip (en-GB + es-AR).
- **index.html**: UI additions for the loan toggle and two-record confirmation summary in the debt and income entry forms.
- **css/app.css**: Minor styling for the loan confirmation panel (uses existing design tokens).
- No breaking changes to existing records — `loanId` is an optional field; existing rows without it continue to work normally.
