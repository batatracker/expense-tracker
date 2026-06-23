## Context

The app started with a single "Total Spent" hero card on the dashboard — a purple gradient with one large white number. Subsequent features (income tracking, debts, reconciliation) layered `text-success` (green) and `text-danger` (red) values on top of that purple background, creating poor contrast and visual incoherence. The purple gradient is no longer the right primitive.

On the performance side, `_setupSheetAndLoad()` chains three `await` calls sequentially:
```js
await this.loadExpenses();
await this.loadDebts();
await this.loadIncome();
```
With network RTTs of 200-500ms each, this easily adds 600-1500ms of extra load time. The calls are completely independent and could run in parallel. Both the AppScript boot path and the OAuth boot path have the same problem.

On desktop, `--content-max: 480px` caps layout width for all screen sizes. Desktop users see a narrow column with wasted whitespace on both sides.

## Goals / Non-Goals

**Goals:**
- Remove the purple gradient card in favor of metric cards that render semantic colors cleanly
- Make the three initial data loads run concurrently via `Promise.all`
- Introduce a responsive layout for desktop (`≥768px`) that uses the extra horizontal space
- Polish card hierarchy, typography, and spacing across main views (dashboard, expense list, income list)
- Update `openspec/config.yaml` to document the `design-taste-frontend` skill requirement for future UI changes
- Update README to reflect current feature set

**Non-Goals:**
- Changes to the Apps Script server-side code (no new `readAll` batch action — that's a separate server-side change and would require users to redeploy their script)
- Dark mode redesign (existing dark mode tokens remain unchanged)
- Changing any data models, API contracts, or localStorage keys
- Redesigning the wizard / setup screen
- Redesigning the expense list or forms (unless incidental to desktop layout)

## Decisions

### Decision 1: Dashboard summary card → stat cards on neutral surface

**Chosen**: Replace `.summary-card` (purple gradient) with a set of 3 separate stat cards (`.stat-card`) on `var(--clr-surface)` with a subtle border and shadow. Each stat card contains a small label and a large value in the appropriate semantic color. The net balance card spans full width and adapts its accent color (success/danger) based on sign.

**Why**: The root issue is that `color: white` (from the gradient parent) fights with `text-success` and `text-danger`. Putting each metric on a neutral surface eliminates the conflict entirely and aligns with current design-system conventions (the rest of the app uses `--clr-surface` cards).

**Alternatives considered**:
- *Keep gradient, use always-white values*: Loses the semantic color signal entirely. Users can't glance and know green/red.
- *Muted dark overlay card*: Achieves contrast, but still feels heavy for secondary metrics.

### Decision 2: Parallel initial data load via `Promise.all`

**Chosen**: Replace the three sequential awaits in both boot paths with:
```js
await Promise.all([
  this.loadExpenses(),
  this.loadDebts(),
  this.loadIncome(),
]);
```

Each load function already handles its own errors independently. Using `Promise.allSettled` would be safer (one failure doesn't block the others); use that instead of `Promise.all` so a failed income fetch doesn't block expenses from rendering.

**Why**: The three data sources are independent — there is no ordering constraint. Running them in parallel cuts perceived load time from ~3× RTT to ~1× RTT with zero server-side changes.

**Alternatives considered**:
- *Add a batch `readAll` action to the Apps Script*: Faster still (one network round-trip), but requires users to redeploy their script. Deferred to a future change.

### Decision 3: Responsive layout with desktop breakpoint at 768px

**Chosen**: At `≥768px`, increase `--content-max` to 960px and apply a 2-column grid to the main dashboard (charts side by side) and a wider layout with a right sidebar or multi-column nav on the app shell.

**Why**: The current 480px max leaves ~50% of desktop viewport unused. Modern practice is to design mobile-first and then extend layouts responsively. The existing CSS variables make this a clean addition without touching mobile styles.

**Alternatives considered**:
- *No desktop changes*: Acceptable for a mobile PWA, but the user explicitly requested desktop improvement.
- *Full two-pane layout with always-visible sidebar*: Too complex for this change; the sidebar already collapses cleanly on mobile.

### Decision 4: Document design-taste-frontend skill in openspec config

**Chosen**: Add a `context` block to `openspec/config.yaml` that explicitly states: "For any UI or visual change, invoke the `design-taste-frontend` skill."

**Why**: The user should not need to mention this per request. Documenting it in the project config makes it discoverable and persistent across all future changes.

## Risks / Trade-offs

- **`Promise.allSettled` vs `Promise.all`**: Using `allSettled` means a partial load is possible — expenses render but income fails silently. Mitigation: each `load*` function already sets error state internally; add a console warning on rejection so failures are visible in dev tools.
- **Desktop layout regressions**: Changing `--content-max` or grid structure on desktop could break forms or modals that were only tested at mobile widths. Mitigation: keep all breakpoint changes additive (`@media (min-width: 768px)` only) so mobile styles are never touched.
- **Stat card visual change**: The new dashboard won't have the gradient hero. Some users may prefer the old look. Mitigation: the change is a clear improvement in usability; no toggle needed.

## Migration Plan

1. Deploy updated `css/app.css` and `index.html` — the stat cards render correctly regardless of data state.
2. Deploy updated `js/app.js` — the parallel load is backward-compatible; no new APIs used.
3. Update `openspec/config.yaml` — affects only future AI-assisted planning, not the running app.
4. Update `README.md`.

No rollback strategy needed — all changes are frontend-only and stateless. Reverting is a one-commit git revert.

## Open Questions

- Should the "carry-over balance" row appear inside the net balance stat card as a sub-line, or remain as a separate fourth card? (Proposed: sub-line below the net value, styled in muted text.)
- Should the desktop layout apply to the expense list and income list views as well, or only the dashboard? (Proposed: apply a wider container everywhere, let the list naturally fill the space.)
