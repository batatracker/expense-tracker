## ADDED Requirements

### Requirement: User can view all expenses in a list
The system SHALL display all expenses in reverse-chronological order (newest first) in a scrollable list view, accessible via the bottom navigation bar.

#### Scenario: Expense list populated
- **WHEN** the user navigates to the Expenses view
- **THEN** the app SHALL render each expense as a card showing: date, merchant (or category if no merchant), amount with currency, and a category icon/badge

#### Scenario: Empty expense list
- **WHEN** there are no expenses in the sheet
- **THEN** the app SHALL display an empty state illustration and the message "No expenses yet — tap + to add one"

### Requirement: User can search expenses by text
The system SHALL provide a search input that filters the visible expense list in real time by matching against merchant, notes, and category fields.

#### Scenario: Search filters list
- **WHEN** the user types in the search field
- **THEN** the expense list SHALL update in real time to show only expenses where the merchant, notes, or category contains the search string (case-insensitive)

#### Scenario: No search results
- **WHEN** the search string matches no expenses
- **THEN** the app SHALL display "No expenses match your search"

### Requirement: User can filter expenses by category and date range
The system SHALL provide filter controls to narrow the expense list by one or more categories and/or a date range.

#### Scenario: Filter by category
- **WHEN** the user selects one or more categories from the filter panel
- **THEN** only expenses matching those categories SHALL be shown

#### Scenario: Filter by date range
- **WHEN** the user sets a start date and/or end date in the filter panel
- **THEN** only expenses with a date within that range SHALL be shown

#### Scenario: Combined filters
- **WHEN** the user applies both a category filter and a date range
- **THEN** only expenses matching ALL active filters SHALL be shown

#### Scenario: Clear filters
- **WHEN** the user taps "Clear filters"
- **THEN** all filters SHALL be reset and the full expense list SHALL be shown

### Requirement: User can sort the expense list
The system SHALL allow the user to sort expenses by date (newest first, oldest first) or by amount (highest first, lowest first).

#### Scenario: Sort by amount
- **WHEN** the user selects "Amount: High to Low" from the sort control
- **THEN** the expense list SHALL re-order with the highest-amount expense at the top

### Requirement: User can view expense details
The system SHALL display a detail view for each expense showing all fields including a clickable receipt link if present.

#### Scenario: Open expense detail
- **WHEN** the user taps an expense card
- **THEN** the app SHALL display a detail sheet/modal with all expense fields: amount, currency, date, category, merchant, notes, and a thumbnail or link for the receipt if one exists

### Requirement: User can delete an expense
The system SHALL allow the user to delete an expense from the detail view with a confirmation step.

#### Scenario: Delete with confirmation
- **WHEN** the user taps "Delete" on an expense detail and confirms the confirmation dialog
- **THEN** the app SHALL delete the row from the Google Sheet, remove it from the in-memory cache, show a success toast ("Expense deleted"), and close the detail view

#### Scenario: Cancel deletion
- **WHEN** the user taps "Delete" but then taps "Cancel" on the confirmation dialog
- **THEN** no deletion SHALL occur and the detail view SHALL remain open
