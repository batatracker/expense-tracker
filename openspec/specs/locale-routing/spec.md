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
The system SHALL NOT store the selected locale in `localStorage`, cookies, or the Google Sheet. The URL is the single source of truth.

#### Scenario: Reload preserves locale from URL
- **WHEN** the user reloads the page on a URL with `?lang=es`
- **THEN** the app SHALL re-activate the `es-AR` locale from the URL without any stored state

#### Scenario: Shared URL preserves locale for recipient
- **WHEN** a user shares a URL with `?lang=es` with another user who opens it
- **THEN** the recipient SHALL see the app in the `es-AR` locale without any prior setup
