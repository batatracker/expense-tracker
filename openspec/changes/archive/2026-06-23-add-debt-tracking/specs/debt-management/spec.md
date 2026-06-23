## ADDED Requirements

### Requirement: Create debt record
The system SHALL allow users to create a debt record with the following fields: source/creditor name (required), total amount (required), currency (required), due date (optional), and notes (optional).

#### Scenario: User creates a new debt
- **WHEN** user submits the debt form with a valid source, amount, and currency
- **THEN** system saves the debt record and displays it in the debts list

#### Scenario: User omits required fields
- **WHEN** user submits the debt form without a source or amount
- **THEN** system displays inline validation errors and does not save

### Requirement: Aggregate debts by source
The system SHALL group all debt records with the same source name (case-insensitive) into a single aggregated entry, displaying the combined outstanding balance and count of individual debts.

#### Scenario: Multiple debts from the same source
- **WHEN** two or more debt records share the same source name
- **THEN** the debts view shows one unified card for that source with the sum of outstanding balances
- **AND** the card is expandable to reveal individual debt entries beneath it

#### Scenario: Debts from different sources
- **WHEN** debt records have different source names
- **THEN** each source appears as a separate card in the debts view

### Requirement: View debt list
The system SHALL display all debts in a dedicated Debts view, accessible via the main navigation. Each source card SHALL show the creditor name, total outstanding balance, currency, and a visual progress indicator of amount paid vs. original total.

#### Scenario: No debts exist
- **WHEN** the user has no debt records
- **THEN** the Debts view shows an empty state prompt to add the first debt

#### Scenario: Debts exist
- **WHEN** the user navigates to the Debts view
- **THEN** system displays source-aggregated debt cards sorted by total outstanding balance descending

### Requirement: Edit debt record
The system SHALL allow users to edit any individual debt record's fields (source, amount, currency, due date, notes).

#### Scenario: User edits a debt
- **WHEN** user opens an individual debt entry and updates fields
- **THEN** system saves changes and recalculates the aggregated source balance

### Requirement: Delete debt record
The system SHALL allow users to delete an individual debt record after confirming the action. If the source has no remaining debts after deletion, the source card is removed from the view.

#### Scenario: User deletes the only debt for a source
- **WHEN** user confirms deletion of the last debt under a given source
- **THEN** system removes the debt record and the source card disappears from the debts view

#### Scenario: User deletes one of multiple debts for a source
- **WHEN** user confirms deletion of one debt among multiple for the same source
- **THEN** system removes that debt and the source card updates its aggregated balance

### Requirement: Dashboard debt summary
The system SHALL display a total outstanding debt widget on the dashboard summarizing the sum of all outstanding balances, grouped by currency when debts span multiple currencies.

#### Scenario: Single-currency debts
- **WHEN** all debts share the same currency
- **THEN** dashboard shows one total outstanding debt amount in that currency

#### Scenario: Multi-currency debts
- **WHEN** debts span multiple currencies
- **THEN** dashboard shows outstanding balances per currency (e.g., "$500 · €200")
