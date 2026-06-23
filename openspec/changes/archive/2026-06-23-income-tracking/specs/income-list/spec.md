## ADDED Requirements

### Requirement: Income view displays all income entries grouped by month
The system SHALL display a dedicated Income view, accessible via the main navigation, showing income entries grouped by calendar month in reverse-chronological order. Each month group SHALL show the month label, total income for that month, and individual entries below it.

#### Scenario: Income entries exist
- **WHEN** the user navigates to the Income view with at least one income entry
- **THEN** the app SHALL display income entries grouped by month (most recent month first), with a month header showing the month name/year and the total income amount for that month

#### Scenario: No income entries
- **WHEN** the user navigates to the Income view with no entries
- **THEN** the app SHALL display an empty state prompt to add the first income entry

### Requirement: Income view shows cumulative carry-over balance per month
The system SHALL compute and display a running carry-over balance for each month group, representing the net amount (income − expenses + reconciliation adjustments) accumulated from all prior months through the end of that month.

#### Scenario: Carry-over shown in month header
- **WHEN** a month group is rendered
- **THEN** the month header SHALL display the carry-in balance (what was brought forward from previous months) and the closing balance (carry-in + this month's income − this month's expenses + this month's reconciliation)

#### Scenario: First-ever month has zero carry-in
- **WHEN** the month group is the oldest month with any income or expense data
- **THEN** carry-in SHALL be displayed as 0

#### Scenario: Carry-over accumulates across months
- **WHEN** January closing balance is 200 and February has 500 income and 300 expenses
- **THEN** February closing balance SHALL be 400 (200 carry-in + 500 income − 300 expenses)

### Requirement: User can delete an income entry
The system SHALL allow deleting an income entry from the Income view with a confirmation step.

#### Scenario: Delete income entry
- **WHEN** the user taps delete on an income entry and confirms
- **THEN** the app SHALL remove the row from the Income sheet tab, remove it from the in-memory cache, update the carry-over calculations, and show a success toast

#### Scenario: Delete cancelled
- **WHEN** the user taps delete on an income entry but dismisses the confirmation
- **THEN** the entry SHALL remain unchanged

### Requirement: Income list view adapts to the active locale
The system SHALL render all Income view labels, month names, amount formatting, and empty state messages using the active locale.

#### Scenario: Income view in Spanish
- **WHEN** the active locale is `es-AR`
- **THEN** all Income view UI strings (headers, button labels, empty state) SHALL render in Argentine Spanish and amounts SHALL be formatted with `Intl.NumberFormat` for `es-AR`
