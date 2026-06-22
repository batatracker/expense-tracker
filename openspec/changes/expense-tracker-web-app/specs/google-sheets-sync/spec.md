## ADDED Requirements

### Requirement: App auto-creates the ExpenseTracker sheet on first use
On first successful sign-in, the system SHALL check whether a Google Sheet named `ExpenseTracker` exists in the user's Drive. If it does not exist, the app SHALL create it and write a formatted header row.

#### Scenario: Sheet does not exist
- **WHEN** the user signs in for the first time and no sheet named `ExpenseTracker` exists
- **THEN** the app SHALL create a new Google Sheet named `ExpenseTracker`, write a bold, frozen header row with columns: `ID | Date | Amount | Currency | Category | Merchant | Notes | Receipt URL | Created At`, and store the Sheet ID in localStorage for future sessions

#### Scenario: Sheet already exists
- **WHEN** the user signs in and a Sheet ID is already stored in localStorage
- **THEN** the app SHALL use the stored Sheet ID without creating a new sheet

#### Scenario: Sheet ID in localStorage but sheet deleted
- **WHEN** the stored Sheet ID returns a 404 from the Sheets API
- **THEN** the app SHALL treat this as a first-use scenario, create a new sheet, and update the stored Sheet ID

### Requirement: Expense rows follow a fixed column schema
The system SHALL write each expense as a single row with columns in a defined order that is human-readable without the app.

#### Scenario: New expense written to sheet
- **WHEN** the user saves a new expense
- **THEN** the app SHALL append a row with values: UUID (ID), ISO date string (Date), numeric amount (Amount), currency code (Currency), category string (Category), merchant string (Merchant), notes string (Notes), receipt URL or empty string (Receipt URL), ISO timestamp (Created At)

#### Scenario: Sheet column order is resilient
- **WHEN** the app reads expense data
- **THEN** it SHALL locate columns by reading the header row (row 1) and matching by name (case-insensitive), NOT by fixed column index, so manually reordered columns do not cause data corruption

### Requirement: App reads all expenses from the sheet
The system SHALL fetch all expense rows from the sheet on load (after authentication) and on explicit user refresh.

#### Scenario: Load expenses on sign-in
- **WHEN** the user signs in successfully
- **THEN** the app SHALL fetch all rows from the `ExpenseTracker` sheet, parse them into expense objects, and cache them in sessionStorage

#### Scenario: Empty sheet
- **WHEN** the sheet has only the header row (no expense rows)
- **THEN** the app SHALL display an empty state message ("No expenses yet") rather than an error

### Requirement: App updates expense rows in-place
The system SHALL support editing an existing expense by locating its row by ID and updating only that row.

#### Scenario: Edit existing expense
- **WHEN** the user saves an edited expense
- **THEN** the app SHALL find the row whose ID column matches the expense ID and update that row's values via a Sheets API batchUpdate call

### Requirement: App deletes expense rows
The system SHALL support deleting an expense by removing its row from the sheet.

#### Scenario: Delete expense
- **WHEN** the user confirms deletion of an expense
- **THEN** the app SHALL delete the corresponding row from the sheet and remove it from the in-memory cache

### Requirement: Sheet is independently usable
The Google Sheet MUST be structured so that a user can open it directly in Google Sheets and understand, filter, and edit their expenses without the app.

#### Scenario: Human-readable sheet structure
- **WHEN** a user opens the sheet in Google Sheets
- **THEN** they SHALL see labeled column headers in row 1 (frozen), one expense per row with human-readable dates and amounts, and the Receipt URL column SHALL contain clickable hyperlinks to any attached files
