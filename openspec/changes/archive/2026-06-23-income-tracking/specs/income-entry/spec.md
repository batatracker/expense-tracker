## ADDED Requirements

### Requirement: User can log an income entry
The system SHALL provide an income entry form accessible from the Income section, allowing users to record a positive cashflow event with: source name (required), amount (required, positive number), currency (required, defaults to configured default currency), date (required, defaults to today), and optional notes.

#### Scenario: Open income entry form
- **WHEN** the user taps the "+" button in the Income view
- **THEN** the app SHALL display the income entry form with source, amount, currency, date, and notes fields, all labels rendered in the active locale

#### Scenario: Save valid income entry
- **WHEN** the user fills in all required fields (source, amount, currency, date) and taps "Save"
- **THEN** the app SHALL generate a UUID, append the row to the Income sheet tab with `type=income`, add the entry to the in-memory income cache, show a success toast in the active locale, and return to the Income list view

#### Scenario: Save with missing required field
- **WHEN** the user taps "Save" with source or amount missing
- **THEN** the app SHALL highlight invalid fields with an error state and display inline error messages in the active locale without saving

#### Scenario: Amount must be positive
- **WHEN** the user enters zero, a negative value, or non-numeric text in the Amount field
- **THEN** the app SHALL display an inline error in the active locale and prevent saving

### Requirement: Income sheet tab is auto-created on first use
The system SHALL automatically create the Income sheet tab when it does not exist, using the same bootstrap pattern as the Debts tab.

#### Scenario: First income save on fresh sheet
- **WHEN** the user saves their first income entry and the Income tab does not exist in the spreadsheet
- **THEN** the app SHALL create the Income tab with columns: `id`, `type`, `source`, `amount`, `currency`, `date`, `notes`, then save the entry

#### Scenario: Subsequent saves with existing tab
- **WHEN** the Income tab already exists
- **THEN** the app SHALL append the row directly without re-creating the tab

### Requirement: Income entries are loaded into an in-memory cache on startup
The system SHALL load all rows from the Income sheet tab at startup alongside expenses and debts, populating an `income` array in app state.

#### Scenario: Income loaded at startup
- **WHEN** the app initializes and the Income tab exists
- **THEN** all income and reconciliation rows SHALL be loaded into the `income` array in app state before the dashboard renders

#### Scenario: Income tab missing at startup
- **WHEN** the app initializes and the Income tab does not exist
- **THEN** the `income` array SHALL be initialized as empty and the app SHALL continue loading normally
