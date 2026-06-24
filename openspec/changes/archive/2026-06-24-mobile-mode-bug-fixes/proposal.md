## Why

Several runtime bugs degrade the experience when using the app on mobile (especially on narrower Android devices like the Moto Edge 2024) and as a PWA install. These include data loss (locale reset on PWA launch), visual glitches (duplicate select arrow), layout cropping, and an unintended pull-to-refresh that fires during normal scrolling.

## What Changes

- **Locale persistence via localStorage** — Save and restore locale choice so PWA installs don't lose the user's setting on every launch.
- **Fix duplicate/ghost arrow on locale selector** — Add `appearance: none` / `-webkit-appearance: none` to the inline `<select>` in Settings so the browser's native arrow is suppressed and only the custom SVG chevron is shown.
- **Fix dashboard right-side cropping** — Audit and correct any `min-width`, `white-space: nowrap`, or missing `overflow: hidden` / `min-width: 0` on flex children that cause content to bleed beyond the viewport on ≤ 430 px screens.
- **Fix accidental pull-to-refresh on scroll** — Raise the pull threshold and/or add a guard so normal downward scrolling from the top of a view doesn't fire `refreshExpenses()`.
- **Raise touch targets for small interactive elements** — Income delete button (30 px) and debt paid-toggle (≈ 28 px) are below the 44 px minimum; fix both.
- **Remove unused `.ptr-indicator` CSS** — Dead CSS that has no corresponding HTML element.

## Capabilities

### New Capabilities
- `locale-persistence`: Persisting locale selection to localStorage so it survives page reload and PWA cold-start.

### Modified Capabilities
- `locale-routing`: Locale detection now falls back to localStorage before defaulting to `en-GB`; URL param still takes precedence.
- `dashboard`: Layout must not crop on viewports ≤ 430 px wide.

## Impact

- `js/i18n.js` — `detectLocale()` and locale-switch logic updated to read/write `localStorage`.
- `index.html` — Locale `<select>` inline style patched; no structural HTML changes.
- `css/app.css` — Touch-target sizes for `.income-entry-delete` and `.debt-paid-toggle`; dashboard/flex layout overflow fixes; pull-to-refresh indicator dead CSS removed.
- `js/app.js` — `_initPullToRefresh()` threshold and guard logic adjusted.
- No API, backend, or dependency changes.
