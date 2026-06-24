## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Locale selector renders without a duplicate dropdown arrow
The locale switcher `<select>` element SHALL suppress the browser's native dropdown arrow via `appearance: none` and `-webkit-appearance: none` so that only the custom SVG chevron is visible. The selector SHALL remain fully accessible (keyboard-navigable, correct role).

#### Scenario: Single arrow visible on iOS Safari
- **WHEN** the user opens the Settings screen on an iOS device
- **THEN** the locale `<select>` SHALL display exactly one chevron-down indicator (the custom SVG), with no native browser arrow alongside it

#### Scenario: Single arrow visible on Android Chrome
- **WHEN** the user opens the Settings screen on an Android device
- **THEN** the locale `<select>` SHALL display exactly one chevron-down indicator, with no native browser arrow alongside it
