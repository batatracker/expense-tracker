## MODIFIED Requirements

### Requirement: User can log an income entry
The system SHALL provide an income entry form accessible from the Income section, allowing users to record a positive cashflow event with: source name (required), amount (required, positive number), currency (required, defaults to configured default currency), date (required, defaults to today), optional notes, and an optional "This is a loan" toggle. When the loan toggle is enabled, the system SHALL also create a paired debt record with the same source, amount, currency, and date, linking both via a shared `loanId`.

#### Scenario: Open income entry form
- **WHEN** the user taps the "+" button in the Income view
- **THEN** the app SHALL display the income entry form with source, amount, currency, date, notes fields, and a loan toggle, all labels rendered in the active locale

#### Scenario: Save valid income entry (no loan toggle)
- **WHEN** the user fills in all required fields and taps "Save" with the loan toggle off
- **THEN** the app SHALL generate a UUID, append the row to the Income sheet tab with `type=income`, add the entry to the in-memory income cache, show a success toast in the active locale, and return to the Income list view
- **AND** no debt counterpart is created

#### Scenario: Save valid income entry with loan toggle enabled
- **WHEN** the user fills in all required fields and taps "Save income + debt" with the loan toggle on
- **THEN** the app SHALL generate a shared `loanId` UUID, save the income record (with `loanId`) to the Income sheet tab, save a paired debt record (with the same `loanId`) to the Debts sheet tab, update both in-memory caches, show a success toast confirming both records, and return to the Income list view

#### Scenario: Save with missing required field
- **WHEN** the user taps "Save" with source or amount missing
- **THEN** the app SHALL highlight invalid fields with an error state and display inline error messages in the active locale without saving

#### Scenario: Amount must be positive
- **WHEN** the user enters zero, a negative value, or non-numeric text in the Amount field
- **THEN** the app SHALL display an inline error in the active locale and prevent saving
