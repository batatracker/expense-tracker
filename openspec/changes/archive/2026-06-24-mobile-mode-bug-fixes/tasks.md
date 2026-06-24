## 1. Locale Persistence (PWA cold-start fix)

- [x] 1.1 In `js/i18n.js` `detectLocale()`: after checking the URL `lang` param, add a fallback to `localStorage.getItem('et_locale')` before defaulting to `en-GB`
- [x] 1.2 In `js/i18n.js` `switchLocale()` (or equivalent locale-switch handler): write `localStorage.setItem('et_locale', locale)` before triggering the page reload so the chosen locale survives the next cold-start

## 2. Locale Selector — Remove Duplicate Arrow

- [x] 2.1 In `index.html`, find the Settings locale `<select>` inline style and add `appearance:none;-webkit-appearance:none;` to suppress the browser-native dropdown arrow, leaving only the custom SVG chevron visible

## 3. Dashboard — Fix Right-Side Cropping on Narrow Viewports

- [x] 3.1 In `css/app.css`, locate `.debt-dash-strip-body` (or whichever flex child wraps the debt strip label + amount) and ensure it has `min-width: 0` so the flex algorithm can shrink it
- [x] 3.2 Audit all other direct flex children in the dashboard card and strip layouts (stat cards, recent-expenses list, chart containers) for missing `min-width: 0`; add where absent
- [x] 3.3 Verify at 390 px viewport width (browser DevTools responsive mode) that no horizontal overflow exists on the Dashboard

## 4. Pull-to-Refresh — Raise Accidental-Trigger Threshold

- [x] 4.1 In `js/app.js` `_initPullToRefresh()`, change the drag-distance guard from `dy > 60` to `dy > 80` to prevent normal top-of-page scrolling from firing `refreshExpenses()`

## 5. Touch Target Fixes

- [x] 5.1 In `css/app.css`, update `.income-entry-delete` to `width: 44px; height: 44px` (up from 30×30 px) so the delete button meets the 44 px minimum touch target
- [x] 5.2 In `css/app.css`, update `.debt-paid-toggle` padding to `8px 16px` (up from `5px 12px`) to bring the effective tappable area to ~44 px height

## 6. CSS Cleanup

- [x] 6.1 In `css/app.css`, remove the unused `.ptr-indicator` and `.ptr-indicator.pulling` rule blocks (no corresponding HTML element exists)

## 7. Version Bump & Verification

- [x] 7.1 Bump `APP_VERSION` in `config.js` and update the `?v=` cache-busting suffix on all `<link>` and `<script>` tags in `index.html`
- [x] 7.2 Open the app on a real or simulated 390 px viewport and confirm: (a) locale persists after reload with no URL param, (b) Settings shows one arrow on the locale selector, (c) Dashboard has no right-side clip, (d) scrolling down does not trigger a refresh, (e) income delete and debt toggle are comfortably tappable
