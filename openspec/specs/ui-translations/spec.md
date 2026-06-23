## Purpose

Defines the translation system for the app's UI layer. Covers the `t(key)` translation function, locale-aware date/number formatting, and the requirement that category keys stored in Google Sheets always remain as English strings.

## Requirements

### Requirement: All visible UI strings are translated for the active locale
The system SHALL provide a translation function `t(key)` that returns the localised string for the given key in the active locale (`en-GB` or `es-AR`). Every user-visible string in the app (labels, placeholders, toasts, error messages, navigation items, empty states) SHALL be rendered via `t()` rather than hardcoded.

#### Scenario: English locale renders English strings
- **WHEN** the active locale is `en-GB`
- **THEN** all UI labels, placeholders, buttons, toasts, and messages SHALL be rendered in English (British spelling)

#### Scenario: Spanish locale renders Argentine Spanish strings
- **WHEN** the active locale is `es-AR`
- **THEN** all UI labels, placeholders, buttons, toasts, and messages SHALL be rendered in Argentine Spanish

#### Scenario: Missing translation key falls back to English
- **WHEN** a translation key exists in `en-GB` but is absent from `es-AR`
- **THEN** the system SHALL render the `en-GB` value as a fallback (never an empty string or raw key)

### Requirement: Category display names are translated without altering stored keys
The system SHALL translate category display names from their English key (as stored in Google Sheets) to the active locale using the translation dictionary. The English key SHALL always be the value submitted to and read from Google Sheets.

#### Scenario: Category dropdown shows translated names
- **WHEN** the active locale is `es-AR` and the user opens the category dropdown in the expense form
- **THEN** each category option SHALL display its Argentine Spanish name (e.g., "Food & Dining" → "Comida y Restaurantes")

#### Scenario: Category badge on expense card shows translated name
- **WHEN** the active locale is `es-AR` and the expense list renders a category badge
- **THEN** the badge SHALL show the translated category name

#### Scenario: Sheet value is always the English key
- **WHEN** the user saves or edits an expense in any locale
- **THEN** the `Category` column in Google Sheets SHALL contain the English key (e.g., `Food & Dining`), not the translated display name

### Requirement: Dates and numbers are formatted according to the active locale
The system SHALL use `Intl.DateTimeFormat` and `Intl.NumberFormat` with the active locale tag to format dates and currency amounts in all views.

#### Scenario: Date formatted for English locale
- **WHEN** the active locale is `en-GB`
- **THEN** dates SHALL be formatted as `DD/MM/YYYY` or the equivalent locale-appropriate short date string

#### Scenario: Date formatted for Spanish locale
- **WHEN** the active locale is `es-AR`
- **THEN** dates SHALL be formatted using the `es-AR` locale tag via `Intl.DateTimeFormat`

#### Scenario: Currency amounts formatted for Spanish locale
- **WHEN** the active locale is `es-AR`
- **THEN** currency amounts SHALL use period as the thousands separator and comma as the decimal separator (standard es-AR number formatting via `Intl.NumberFormat`)
