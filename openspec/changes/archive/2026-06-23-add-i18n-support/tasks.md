## 1. Translation Module

- [x] 1.1 Create `js/i18n.js` with `LOCALES` dictionary containing all `en-GB` and `es-AR` string keys, including all category display names, UI labels, placeholders, toasts, error messages, navigation items, and empty-state strings
- [x] 1.2 Implement `detectLocale()` in `js/i18n.js` — reads `window.location.pathname`, returns `'es-AR'` if path starts with `/es`, otherwise `'en-GB'`
- [x] 1.3 Implement `t(key)` in `js/i18n.js` — looks up key in active locale dictionary, falls back to `en-GB` value if key missing in target locale
- [x] 1.4 Implement `switchLocale(targetLocale)` in `js/i18n.js` — rewrites `window.location.pathname` to prepend `/es/` or strip it, then reloads the page
- [x] 1.5 Load `js/i18n.js` in `index.html` as a plain `<script>` tag before the Alpine.js `defer` script

## 2. Locale Routing

- [x] 2.1 Add an init call in `index.html` or Alpine's `init()` to call `detectLocale()` on page load and store the result in a top-level variable accessible to `t()`
- [x] 2.2 Add a locale switcher UI element (flag emoji or `EN / ES` label) to the Settings view and/or persistent navigation area
- [x] 2.3 Wire the locale switcher to call `switchLocale()` with the opposite locale on tap

## 3. Translate `index.html` Strings

- [x] 3.1 Replace all hardcoded UI labels in the dashboard section of `index.html` with `t()` calls (Alpine `x-text` bindings or template expressions)
- [x] 3.2 Replace all hardcoded UI labels in the expense list section of `index.html` (search placeholder, filter panel labels, sort options, empty states, "Clear filters")
- [x] 3.3 Replace all hardcoded UI labels in the expense entry/edit form section of `index.html` (field labels, placeholders, Save/Cancel buttons, validation error texts)
- [x] 3.4 Replace bottom navigation labels with `t()` calls
- [x] 3.5 Replace settings view strings with `t()` calls
- [x] 3.6 Replace setup wizard strings with `t()` calls

## 4. Translate `js/app.js` Strings

- [x] 4.1 Replace hardcoded toast messages (`showToast('Expense saved')`, etc.) with `t()` calls
- [x] 4.2 Replace hardcoded validation error messages in `validateForm()` (or equivalent) with `t()` calls
- [x] 4.3 Replace any hardcoded empty-state or status strings generated in JS with `t()` calls
- [x] 4.4 Update category dropdown binding: ensure the `value` bound to the form model is always the English key from `CONFIG.CATEGORIES`, while the display label shown to the user is `t(category)`

## 5. Localised Date and Number Formatting

- [x] 5.1 Replace all direct date string constructions with `Intl.DateTimeFormat(activeLocale, options).format(date)` using the locale detected at init
- [x] 5.2 Replace currency/amount formatting with `Intl.NumberFormat(activeLocale, { ... }).format(amount)` throughout list cards, dashboard summary, and detail view

## 6. Dashboard Chart Labels

- [x] 6.1 Update the Chart.js donut/pie chart dataset to use `t(categoryKey)` for legend and tooltip labels
- [x] 6.2 Update the monthly trend bar chart to generate month labels using `Intl.DateTimeFormat(activeLocale, { month: 'short' })` so they appear in the active locale language

## 7. Expense List Search Fix

- [x] 7.1 Update the real-time search filter to match against both the stored English category key AND the translated display name for the active locale, so users can search in their language

## 8. Verification

- [ ] 8.1 Manually verify all screens in `en-GB` mode render correctly with no visible `t()` keys or untranslated strings
- [ ] 8.2 Manually verify all screens in `es-AR` mode (`/es/` URL prefix) render in Argentine Spanish with correct category translations
- [ ] 8.3 Verify switching locale rewrites the URL and reloads the app in the correct language
- [ ] 8.4 Verify saving an expense in `es-AR` mode writes the English category key to Google Sheets
- [ ] 8.5 Verify date and number formatting matches locale conventions in both modes

