## Purpose

Defines how the app determines the active locale and switches between locales. The URL query parameter is the sole source of truth for locale state — no localStorage or cookie persistence.
## Requirements
### Requirement: Locale is determined from the URL query parameter
The system SHALL read the active locale from the `lang` query parameter on page load. A `lang=es` query parameter SHALL activate the `es-AR` locale. Any other value or absence of the parameter SHALL activate the `en-GB` locale.

#### Scenario: Spanish locale activated via URL
- **WHEN** the user navigates to a URL with `?lang=es` in the query string
- **THEN** the app SHALL initialise with the `es-AR` locale and render all UI strings in Argentine Spanish

#### Scenario: English locale activated by default
- **WHEN** the user navigates to a URL without a `lang` query parameter
- **THEN** the app SHALL initialise with the `en-GB` locale and render all UI strings in English

#### Scenario: No locale param — defaults to English
- **WHEN** the user navigates to the bare root URL (e.g., `/` or `/index.html`)
- **THEN** the app SHALL activate the `en-GB` locale without any redirect

### Requirement: Locale switcher rewrites the URL query parameter
The system SHALL provide a locale switcher UI element. Activating it SHALL update the `lang` query parameter and reload the page, so the new locale is reflected in the URL. Other query parameters (e.g., `cfg=`) SHALL be preserved during the switch.

#### Scenario: Switch from English to Spanish
- **WHEN** the user selects `es-AR` from the locale switcher while on a URL without `lang=es`
- **THEN** the app SHALL navigate to the equivalent URL with `?lang=es` added and reload

#### Scenario: Switch from Spanish to English
- **WHEN** the user selects `en-GB` from the locale switcher while on a URL with `lang=es`
- **THEN** the app SHALL navigate to the equivalent URL with the `lang` parameter removed and reload

#### Scenario: Locale switcher visible in the UI
- **WHEN** the user views the Settings screen
- **THEN** a locale switcher `<select>` element SHALL be visible showing the current language and allowing selection of the other language

### Requirement: URL is the sole locale state — no persistence to localStorage or Google Sheets
The system SHALL treat the `lang` URL query parameter as the highest-priority locale signal. When the parameter is absent, the system SHALL fall back to the value stored in `localStorage` under `et_locale`. Only if both are absent SHALL the system default to `en-GB`. The system SHALL NOT store locale in cookies or the Google Sheet.

#### Scenario: URL param takes precedence over stored locale
- **WHEN** the URL contains `?lang=es` and `localStorage` contains `et_locale=en-GB`
- **THEN** the app SHALL activate `es-AR` (URL wins)

#### Scenario: localStorage fallback when no URL param
- **WHEN** the URL has no `lang` param and `localStorage` contains `et_locale=es-AR`
- **THEN** the app SHALL activate `es-AR`

#### Scenario: Default to English when both absent
- **WHEN** no `lang` URL param is present and `localStorage` has no `et_locale` entry
- **THEN** the app SHALL activate `en-GB`

#### Scenario: Shared URL preserves locale for recipient
- **WHEN** a user shares a URL with `?lang=es` with another user who opens it
- **THEN** the recipient SHALL see the app in the `es-AR` locale regardless of their stored preference

### Requirement: Locale selector renders without a duplicate dropdown arrow
The locale switcher `<select>` element SHALL suppress the browser's native dropdown arrow via `appearance: none` and `-webkit-appearance: none` so that only the custom SVG chevron is visible. The selector SHALL remain fully accessible (keyboard-navigable, correct role).

#### Scenario: Single arrow visible on iOS Safari
- **WHEN** the user opens the Settings screen on an iOS device
- **THEN** the locale `<select>` SHALL display exactly one chevron-down indicator (the custom SVG), with no native browser arrow alongside it

#### Scenario: Single arrow visible on Android Chrome
- **WHEN** the user opens the Settings screen on an Android device
- **THEN** the locale `<select>` SHALL display exactly one chevron-down indicator, with no native browser arrow alongside it

