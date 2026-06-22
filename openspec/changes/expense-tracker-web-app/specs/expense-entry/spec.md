## ADDED Requirements

### Requirement: User can add a new expense
The system SHALL provide an expense entry form accessible from the bottom navigation bar and from a prominent FAB (floating action button) on the expense list and dashboard views.

#### Scenario: Open add expense form
- **WHEN** the user taps the "+" FAB or the Add tab in the bottom nav
- **THEN** the app SHALL display the expense entry form with fields: Amount (required), Currency (defaults to user's configured default), Date (defaults to today), Category (required, dropdown), Merchant (optional, text), Notes (optional, textarea), and a receipt attachment section

#### Scenario: Save valid expense
- **WHEN** the user fills in all required fields and taps "Save"
- **THEN** the app SHALL generate a UUID for the expense, append the row to the Google Sheet, add the expense to the in-memory cache, show a success toast ("Expense saved"), and return to the previous view

#### Scenario: Save with validation error
- **WHEN** the user taps "Save" with a missing required field (Amount or Category)
- **THEN** the app SHALL highlight the invalid fields with an error state, display inline error messages, and NOT submit to the sheet

#### Scenario: Amount field validation
- **WHEN** the user enters a non-numeric or negative value in the Amount field
- **THEN** the app SHALL show an inline error: "Please enter a valid positive amount"

### Requirement: User can edit an existing expense
The system SHALL allow editing any field of an existing expense from the expense detail view.

#### Scenario: Open edit form
- **WHEN** the user taps "Edit" on an expense detail view
- **THEN** the app SHALL display the expense entry form pre-populated with the existing expense values

#### Scenario: Save edited expense
- **WHEN** the user modifies fields and taps "Save"
- **THEN** the app SHALL update the corresponding row in the Google Sheet, update the in-memory cache, and show a success toast ("Expense updated")

### Requirement: Expense categories are predefined with an "Other" option
The system SHALL provide a fixed list of expense categories and an "Other / Custom" option.

#### Scenario: Category dropdown contents
- **WHEN** the user opens the Category dropdown
- **THEN** they SHALL see at minimum: Food & Dining, Transportation, Shopping, Entertainment, Health & Fitness, Housing & Utilities, Travel, Education, Personal Care, Business, Other

#### Scenario: "Other" category
- **WHEN** the user selects "Other"
- **THEN** a text field SHALL appear allowing them to type a custom category name, which is saved as the Category value

### Requirement: Currency defaults to user-configured preference
The system SHALL use a configurable default currency code for new expenses.

#### Scenario: Default currency applied
- **WHEN** the user opens the add expense form
- **THEN** the Currency field SHALL be pre-filled with the default currency from Settings (default: USD)

#### Scenario: Override currency per expense
- **WHEN** the user changes the Currency field on the form
- **THEN** the expense SHALL be saved with the specified currency code, not the default
