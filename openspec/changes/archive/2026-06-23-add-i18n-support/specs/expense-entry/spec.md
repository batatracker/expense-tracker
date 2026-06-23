## MODIFIED Requirements

### Requirement: User can add a new expense
The system SHALL provide an expense entry form accessible from the bottom navigation bar and from a prominent FAB (floating action button) on the expense list and dashboard views.

#### Scenario: Open add expense form
- **WHEN** the user taps the "+" FAB or the Add tab in the bottom nav
- **THEN** the app SHALL display the expense entry form with all labels, placeholders, and buttons rendered in the active locale

#### Scenario: Save valid expense
- **WHEN** the user fills in all required fields and taps "Save" (or its translation)
- **THEN** the app SHALL generate a UUID for the expense, append the row to the Google Sheet with the English category key, add the expense to the in-memory cache, show a success toast translated to the active locale, and return to the previous view

#### Scenario: Save with validation error
- **WHEN** the user taps "Save" with a missing required field (Amount or Category)
- **THEN** the app SHALL highlight the invalid fields with an error state and display inline error messages translated to the active locale

#### Scenario: Amount field validation
- **WHEN** the user enters a non-numeric or negative value in the Amount field
- **THEN** the app SHALL show an inline error translated to the active locale

### Requirement: Category selection stores English key to sheet
The system SHALL always write the English category key to the Google Sheet `Category` column, regardless of the active locale. The category dropdown SHALL display translated labels while binding the English key as the submitted value.

#### Scenario: Category dropdown displays translated label
- **WHEN** the active locale is `es-AR` and the user opens the category dropdown
- **THEN** each option SHALL display its `es-AR` translated name but submit the English key on save

#### Scenario: Translated label does not affect sheet value
- **WHEN** the user saves an expense after selecting a category in `es-AR` mode
- **THEN** the `Category` column in Google Sheets SHALL contain the English key (e.g., `Food & Dining`)
