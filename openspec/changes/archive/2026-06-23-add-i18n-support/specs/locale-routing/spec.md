## ADDED Requirements

### Requirement: Locale is determined from the URL path prefix
The system SHALL read the active locale from `window.location.pathname` on page load. A pathname starting with `/es` (or `/es/`) SHALL activate the `es-AR` locale. Any other pathname SHALL activate the `en-GB` locale.

#### Scenario: Spanish locale activated via URL
- **WHEN** the user navigates to a URL whose pathname starts with `/es`
- **THEN** the app SHALL initialise with the `es-AR` locale and render all UI strings in Argentine Spanish

#### Scenario: English locale activated by default
- **WHEN** the user navigates to a URL whose pathname does not start with `/es`
- **THEN** the app SHALL initialise with the `en-GB` locale and render all UI strings in English

#### Scenario: No locale prefix — defaults to English
- **WHEN** the user navigates to the bare root URL (e.g., `/` or `/index.html`)
- **THEN** the app SHALL activate the `en-GB` locale without any redirect

### Requirement: Locale switcher rewrites the URL path
The system SHALL provide a locale switcher UI element. Activating it SHALL rewrite `window.location.pathname` to include or remove the locale prefix and reload the page, so the new locale is reflected in the URL.

#### Scenario: Switch from English to Spanish
- **WHEN** the user activates the locale switcher while on a URL without `/es` prefix
- **THEN** the app SHALL navigate to the equivalent URL with `/es/` prepended and reload

#### Scenario: Switch from Spanish to English
- **WHEN** the user activates the locale switcher while on a URL with `/es` prefix
- **THEN** the app SHALL navigate to the equivalent URL with the `/es` prefix removed and reload

#### Scenario: Locale switcher visible in the UI
- **WHEN** the user views any screen of the app
- **THEN** a locale switcher element (flag or language label) SHALL be visible and tappable in the settings view or persistent navigation area

### Requirement: URL is the sole locale state — no persistence to localStorage or Google Sheets
The system SHALL NOT store the selected locale in `localStorage`, cookies, or the Google Sheet. The URL is the single source of truth.

#### Scenario: Reload preserves locale from URL
- **WHEN** the user reloads the page on a `/es/` URL
- **THEN** the app SHALL re-activate the `es-AR` locale from the URL without any stored state

#### Scenario: Shared URL preserves locale for recipient
- **WHEN** a user shares a `/es/` URL with another user who opens it
- **THEN** the recipient SHALL see the app in the `es-AR` locale without any prior setup
