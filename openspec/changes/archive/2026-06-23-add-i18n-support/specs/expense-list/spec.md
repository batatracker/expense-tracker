## MODIFIED Requirements

### Requirement: User can view all expenses in a list
The system SHALL display all expenses in reverse-chronological order (newest first) in a scrollable list view, accessible via the bottom navigation bar.

#### Scenario: Expense list populated
- **WHEN** the user navigates to the Expenses view
- **THEN** the app SHALL render each expense card with the category name translated to the active locale, and the date formatted using `Intl.DateTimeFormat` with the active locale

#### Scenario: Empty expense list
- **WHEN** there are no expenses in the sheet
- **THEN** the app SHALL display the empty state message translated to the active locale

### Requirement: User can search expenses by text
The system SHALL provide a search input that filters the visible expense list in real time by matching against merchant, notes, and category fields.

#### Scenario: Search filters list
- **WHEN** the user types in the search field
- **THEN** the expense list SHALL update in real time; search SHALL match against both the English category key stored in the sheet AND the translated category name in the active locale, so the user can search in either language

#### Scenario: No search results
- **WHEN** the search string matches no expenses
- **THEN** the app SHALL display the "no results" message translated to the active locale

### Requirement: Filter panel UI text adapts to the active locale
The system SHALL render all filter panel labels, buttons, and category option names in the active locale.

#### Scenario: Filter panel labels translated
- **WHEN** the active locale is `es-AR` and the user opens the filter panel
- **THEN** all labels (date range, category filter heading, "Clear filters" button) SHALL be displayed in Argentine Spanish

#### Scenario: Category filter options show translated names
- **WHEN** the active locale is `es-AR`
- **THEN** the category filter options SHALL display translated category names; selecting one SHALL filter by the underlying English key stored in the sheet

### Requirement: Sort options and navigation text adapt to the active locale
The system SHALL render sort option labels and list view navigation elements in the active locale.

#### Scenario: Sort options translated
- **WHEN** the active locale is `es-AR`
- **THEN** sort options (e.g., "Newest first", "Oldest first", "Highest amount") SHALL be displayed in Argentine Spanish
