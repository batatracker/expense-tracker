## 1. Data & State

- [x] 1.1 Add `loanId` field to the debt form state object (`debtForm`) and income form state object (`incomeForm`) in `js/app.js`, defaulting to `null`
- [x] 1.2 Add `isLoan` boolean to both form state objects (`debtForm.isLoan`, `incomeForm.isLoan`), defaulting to `false`

## 2. i18n Keys

- [x] 2.1 Add i18n keys for loan toggle label, confirmation panel copy, submit button variants, success toast (both records), and partial-failure error toasts to `js/i18n.js` for both `en-GB` and `es-AR` locales

## 3. Backend — sheets.js (OAuth mode)

- [x] 3.1 Update `Sheets.appendDebt()` in `js/sheets.js` to accept and persist the `loanId` field (append as an additional column to the Debts sheet tab)
- [x] 3.2 Update `Sheets.appendIncome()` in `js/sheets.js` to accept and persist the `loanId` field (append as an additional column to the Income sheet tab)

## 4. Backend — appscript.js (no-OAuth mode)

- [x] 4.1 Update `AppScript.appendDebt()` in `js/appscript.js` to pass `loanId` in the request payload
- [x] 4.2 Update `AppScript.appendIncome()` in `js/appscript.js` to pass `loanId` in the request payload

## 5. Save Logic — app.js

- [x] 5.1 Update `saveDebt()` in `js/app.js`: when `debtForm.isLoan` is true, generate a shared `loanId` UUID, save the debt record with it, then save a paired income record (same source, amount, currency, date, loanId) and push it to `this.income`; show combined success toast or partial-failure toast
- [x] 5.2 Update `saveIncome()` in `js/app.js`: when `incomeForm.isLoan` is true, generate a shared `loanId` UUID, save the income record with it, then save a paired debt record (source, totalAmount = amount, outstandingBalance = amount, currency, date, loanId) and push it to `this.debts`; show combined success toast or partial-failure toast

## 6. HTML — Debt Form UI

- [x] 6.1 Add "This is a loan" toggle to the debt entry form in `index.html` (new record mode only, hidden when editing an existing debt), wired to `debtForm.isLoan`
- [x] 6.2 Add an inline confirmation panel below the debt form that shows when `debtForm.isLoan` is true, summarising both records (debt + paired income) that will be saved, using live form values
- [x] 6.3 Update the debt form submit button label to switch between "Save debt" and "Save debt + income" based on `debtForm.isLoan`

## 7. HTML — Income Form UI

- [x] 7.1 Add "This is a loan" toggle to the income entry form in `index.html` (new record mode only, hidden when editing an existing income), wired to `incomeForm.isLoan`
- [x] 7.2 Add an inline confirmation panel below the income form that shows when `incomeForm.isLoan` is true, summarising both records (income + paired debt) that will be saved, using live form values
- [x] 7.3 Update the income form submit button label to switch between "Save" and "Save income + debt" based on `incomeForm.isLoan`

## 8. HTML — Loan Badge on Detail Views

- [x] 8.1 Add a read-only "Loan — paired with an income entry" badge on debt detail/expand views in `index.html`, shown only when the debt record has a non-empty `loanId`
- [x] 8.2 Add a read-only "Loan — paired with a debt entry" badge on income entry cards/detail views in `index.html`, shown only when the income record has a non-empty `loanId`

## 9. Styles

- [x] 9.1 Add CSS for the inline loan confirmation panel and loan badge in `css/app.css`, using existing design tokens (`--clr-*`, `--sp-*`, `--r-*`, `--shadow-*`)

## 10. Version Bump

- [x] 10.1 Bump `APP_VERSION` in `js/config.js` and update the `?v=` cache-busting suffix for JS and CSS includes in `index.html`
