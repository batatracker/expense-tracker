## 1. CSS — Dashboard Stat Cards

- [x] 1.1 Remove `.summary-card` gradient background and replace with neutral-surface stat card styles (`.stat-card`) using `--clr-surface`, border, and shadow
- [x] 1.2 Add `.stat-card` layout: flex column, label in muted small text, value in large bold font inheriting semantic color
- [x] 1.3 Add `.stat-cards-row` grid: 1-column on mobile, 3-column (`repeat(3, 1fr)`) at `≥768px`
- [x] 1.4 Add `.stat-card--net` variant: full-width on mobile, spans all 3 columns as a subtle accent row on desktop
- [x] 1.5 Add `.stat-card-sublabel` style for the carry-over sub-line (muted, smaller, sits below the net value)
- [x] 1.6 Remove now-unused `.summary-grid`, `.summary-grid-item`, `.summary-grid-label`, `.summary-grid-value`, `.summary-net-row`, `.summary-net-value`, `.summary-label`, `.summary-amount` rules (or consolidate if the fallback "Total Spent" view still uses them)

## 2. CSS — Desktop Responsive Layout

- [x] 2.1 Add `@media (min-width: 768px)` block that raises `--content-max` to 960px (or sets it via a media-scoped override on `.dashboard-scroll` and the main content wrapper)
- [x] 2.2 At `≥768px`, render the two chart cards (category breakdown + trend) side by side in a 2-column grid using CSS Grid
- [x] 2.3 At `≥768px`, give the sidebar permanent visibility (no hamburger needed) if not already handled, or ensure the layout doesn't break with a fixed sidebar

## 3. HTML — Dashboard Summary Markup

- [x] 3.1 Replace the `<div class="summary-card">` block in `index.html` with a `<div class="stat-cards-row">` containing three `.stat-card` divs: Income, Expenses, Net balance
- [x] 3.2 On the Net balance card, add a `.stat-card-sublabel` sub-line for carry-over balance (the existing `total_carry_over` translation key)
- [x] 3.3 Preserve the fallback `<template x-if="income.length === 0 && currentMonthIncome === 0">` block but update its markup to use a single `.stat-card` instead of `.summary-card`
- [x] 3.4 Verify the `text-success` / `text-danger` classes still apply correctly to income/expense/net values in the new structure

## 4. JS — Parallel Data Load

- [x] 4.1 In `_setupSheetAndLoad()` (`js/app.js`), replace the three sequential `await` calls with `await Promise.allSettled([this.loadExpenses(), this.loadDebts(), this.loadIncome()])`
- [x] 4.2 In the AppScript boot path (`init()` method, appscript branch), apply the same `Promise.allSettled` change to the three sequential load calls
- [x] 4.3 Add a `console.warn` in each `load*` function's catch block (or after `allSettled`) to log any rejected source without re-throwing

## 5. Project Config — Document Design Skill

- [x] 5.1 Add a `context` block to `openspec/config.yaml` with the following note: for any UI or visual change, invoke the `design-taste-frontend` skill before proposing or implementing

## 6. README Update

- [x] 6.1 Update `README.md` to reflect current feature set: income tracking, debt management, balance reconciliation, two auth modes (OAuth and Apps Script / no-OAuth)
- [x] 6.2 Remove or update any outdated sections that reference the old "Total Spent only" design or missing features
- [x] 6.3 Add a brief "Tech stack" section noting: Vanilla JS, Alpine.js, Google Sheets / Apps Script backend, no build step

## 7. Visual QA

- [x] 7.1 Open the app in a mobile viewport (375px) and verify the stat cards stack vertically and all three values are legible
- [x] 7.2 Open the app in a desktop viewport (1280px) and verify the stat cards form a 3-column row and the charts sit side by side
- [x] 7.3 Verify light mode and dark mode both look correct (check `data-theme="dark"` in dev tools)
- [x] 7.4 Verify the fallback "Total Spent" view still renders correctly when no income is tracked
