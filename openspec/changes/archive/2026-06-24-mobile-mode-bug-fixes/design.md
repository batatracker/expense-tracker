## Context

The app is a single-file Vanilla JS / Alpine.js PWA (no build step). Locale state is currently driven purely by the `?lang=es` URL query parameter — by design (spec says "URL is sole source of truth"). This breaks PWA installs, which launch to the bare start URL with no query params, silently resetting the user's language preference to `en-GB` on every cold-start.

Additional runtime issues on narrow Android viewports (390–430 px, tested on Moto Edge 2024):
- The locale `<select>` in Settings shows the browser's native arrow AND a custom SVG chevron simultaneously, because the inline style lacks `appearance: none`.
- Dashboard right-side content clips because some flex children are missing `min-width: 0` or use `white-space: nowrap` without an overflow guard.
- The `_initPullToRefresh()` threshold (60 px) is low enough that normal top-of-page scrolling accidentally fires `refreshExpenses()`.
- Two interactive elements (income delete button 30×30 px, debt paid-toggle ≈28 px height) are below the 44 px touch target minimum.

## Goals / Non-Goals

**Goals:**
- Locale persists across PWA cold-starts via `localStorage` (URL param still takes precedence).
- Locale `<select>` shows exactly one arrow indicator on all mobile browsers.
- Dashboard renders without right-side overflow on 390–430 px viewports.
- Pull-to-refresh requires a deliberate 80 px drag; normal scrolling is unaffected.
- Income delete and debt paid-toggle touch targets meet the 44 px minimum.
- Remove dead `.ptr-indicator` CSS.

**Non-Goals:**
- Persisting any other settings (currency, theme) to localStorage — that's a separate change.
- Adding new PWA manifest or service worker changes.
- Changing locale detection architecture beyond the fallback chain (URL → localStorage → default).

## Decisions

### 1. localStorage key `et_locale` for locale persistence
**Decision:** Use `localStorage.setItem('et_locale', locale)` / `getItem('et_locale')`.  
**Why over alternatives:**
- *Cookie:* Requires `SameSite`/`Secure` handling; overkill for a client-only app.
- *URL param always:* Already used — the problem is PWA installs strip params at launch.
- *IndexedDB:* Async read would delay app init; localStorage is synchronous and appropriate for a single small string.

The existing `detectLocale()` function in `js/i18n.js` reads the URL param. We extend it to fall back to `localStorage` when the param is absent, and we write to localStorage in `switchLocale()` before the reload.

### 2. Fix locale `<select>` with inline style patch only (no CSS class refactor)
**Decision:** Add `appearance:none;-webkit-appearance:none;` to the existing inline `style` attribute on the Settings `<select>` element in `index.html`.  
**Why:** The surrounding markup already uses `.select-wrap` + a custom SVG chevron — it just forgot to suppress the native arrow. A one-attribute fix is the minimal correct change; refactoring to a CSS class is a separate concern.

### 3. Pull-to-refresh threshold raised to 80 px with `scrollTop === 0` guard preserved
**Decision:** Change `dy > 60` to `dy > 80` in `_initPullToRefresh()`.  
**Why:** 80 px is a deliberate drag distance that is uncomfortable to hit accidentally during a normal scroll bounce, while still being reachable for an intentional pull. No debounce is added at this time — the refresh is async and idempotent so a duplicate fire is low-risk.

### 4. Touch target fixes via CSS padding increases, not wrapper divs
**Decision:** Increase `.income-entry-delete` to `width: 44px; height: 44px;` and `.debt-paid-toggle` padding to `8px 16px` (approximate 44 px height).  
**Why:** Adding wrapper elements would require Alpine.js template changes and risk breaking the existing flex layouts. CSS-only size increases are contained and reversible.

### 5. Dashboard flex overflow: add `min-width: 0` to flex children
**Decision:** Audit `.debt-dash-strip-body` and any other flex children in the dashboard that lack `min-width: 0`, and add it.  
**Why:** The browser default `min-width: auto` on flex items allows them to grow wider than their container, causing overflow. Adding `min-width: 0` allows the flex algorithm to shrink the item and the text to ellipsize correctly. This is the standard CSS fix and requires no structural changes.

## Risks / Trade-offs

- **localStorage locale fallback vs. shared-URL scenario:** A shared URL with `?lang=es` still takes precedence (URL wins), so sharing is not broken. However, a user who visits a shared English URL while having Spanish stored will temporarily see English — this is the correct behavior.
- **Raising PTR threshold to 80 px:** Power users who expect a 60 px threshold will need a slightly longer drag. The benefit (eliminating accidental refreshes) outweighs this minor UX cost.
- **Inline style patch for `<select>`:** If the Settings markup is refactored in a future change, the inline style will need to be re-evaluated. Low risk.

## Migration Plan

1. Update `js/i18n.js`: extend `detectLocale()` to check `localStorage.getItem('et_locale')` as fallback; update `switchLocale()` to write to localStorage before reload.
2. Patch `index.html`: add `appearance:none;-webkit-appearance:none;` to the locale `<select>` inline style.
3. Update `css/app.css`: `.income-entry-delete` size, `.debt-paid-toggle` padding, `min-width: 0` on dashboard flex children, remove dead `.ptr-indicator` rules.
4. Update `js/app.js`: change pull-to-refresh threshold from 60 to 80.
5. Bump `APP_VERSION` in `config.js` and `?v=` in `index.html`.

No rollback needed — all changes are client-side and non-breaking. Old localStorage key simply won't exist for existing users (graceful default to `en-GB`).

## Open Questions

- Should the debt paid-toggle visual size increase be accompanied by a layout adjustment to avoid pushing the debt card height up noticeably? (Low risk — current padding is so small that going to 8 px adds only ~6 px per side.)
- Are there other small touch targets across the Income or Debts tabs beyond the two identified? (The codebase sweep found these two as the most egregious; others are at or above 40 px.)
