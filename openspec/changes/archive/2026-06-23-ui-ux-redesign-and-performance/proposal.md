## Why

The dashboard summary card was designed for a simple "Total Spent" view and its purple-gradient background creates poor contrast when overlaid with semantic color values (green income, red expenses). Separately, the initial data load fires three sequential API calls — expenses, debts, income — each waiting for the prior one before starting, causing noticeable lag on every app open despite small data volumes. Both issues degrade the UX without technical justification.

## What Changes

- **Dashboard summary card redesigned**: Replace the single purple-gradient card with a set of distinct metric cards (or a neutral-surface card) that allow income, expenses, and net balance to render with their semantic colors (green / red / context-dependent) without clashing.
- **Parallel initial data load**: `loadExpenses()`, `loadDebts()`, and `loadIncome()` are currently awaited sequentially in both the AppScript and OAuth boot paths; change to `Promise.all([...])` so all three fire concurrently.
- **Desktop layout improvement**: The app caps content at 480px even on wide screens; introduce a responsive two-column or wider grid on `≥768px` viewports so desktop users get a better experience.
- **General visual polish**: Minor improvements to typography, spacing, and card hierarchy across the main views to lift overall finish quality.
- **README update**: Reflect current feature set (income, debts, reconciliation, two auth modes) and remove outdated sections.
- **Design skill documented in project config**: Add a `context` block to `openspec/config.yaml` noting that UI changes should use the `design-taste-frontend` skill, so contributors don't need to specify it per request.

## Capabilities

### New Capabilities

_(none — all changes are to existing capabilities)_

### Modified Capabilities

- `dashboard`: Visual redesign of the summary section — new card structure for Income / Expenses / Net Balance that uses semantic colors on a neutral surface instead of white-on-purple; improved layout on wider viewports.

## Impact

- **`css/app.css`**: `.summary-card`, `.summary-grid`, `.summary-grid-*`, `.summary-amount`, and related dashboard styles rewritten; new desktop breakpoints added.
- **`index.html`**: Dashboard summary markup adjusted to match the new card structure.
- **`js/app.js`**: `_setupSheetAndLoad()` and AppScript boot path changed from sequential awaits to `Promise.all()`.
- **`openspec/config.yaml`**: `context` block added.
- **`README.md`**: Updated to reflect current feature set.
- No breaking changes to data formats, APIs, or user settings.
