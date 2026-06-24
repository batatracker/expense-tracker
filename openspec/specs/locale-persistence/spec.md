# locale-persistence Specification

## Purpose
TBD - created by archiving change mobile-mode-bug-fixes. Update Purpose after archive.
## Requirements
### Requirement: Locale selection is persisted to localStorage
The system SHALL write the active locale key (`en-GB` or `es-AR`) to `localStorage` under the key `et_locale` whenever the user switches locale. On page load, if no `lang` URL query parameter is present, the system SHALL read `et_locale` from localStorage and activate that locale. The URL query parameter SHALL take precedence over the stored value when both are present.

#### Scenario: Locale persists across page reload without URL param
- **WHEN** the user switches to `es-AR` and then reloads the page without a `lang` param in the URL
- **THEN** the app SHALL initialise with the `es-AR` locale, reading the value from `localStorage`

#### Scenario: URL param overrides stored locale
- **WHEN** `localStorage` contains `et_locale=es-AR` but the URL includes `?lang=` absent (or a different value)
- **THEN** the URL param SHALL take precedence; if absent, the stored locale is used

#### Scenario: PWA cold-start respects stored locale
- **WHEN** the user installs the app as a PWA and launches it from the home screen without a `lang` param
- **THEN** the app SHALL restore the last-used locale from `localStorage` rather than defaulting to `en-GB`

#### Scenario: First-time launch with no stored locale
- **WHEN** no `lang` URL param is present and `et_locale` is absent from localStorage
- **THEN** the app SHALL default to `en-GB`

#### Scenario: Locale switcher writes to localStorage
- **WHEN** the user selects a locale from the Settings locale selector
- **THEN** the chosen locale SHALL be written to `localStorage` under `et_locale` before the page reloads

