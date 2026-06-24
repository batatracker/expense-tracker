## MODIFIED Requirements

### Requirement: Create debt record
The system SHALL allow users to create a debt record with the following fields: source/creditor name (required), total amount (required), currency (required), due date (optional), notes (optional), and an optional "This is a loan" toggle. When the loan toggle is enabled, the system SHALL also create a paired income record with the same source, amount, currency, and date, linking both via a shared `loanId`.

#### Scenario: User creates a new debt (no loan toggle)
- **WHEN** the user submits the debt form with a valid source, amount, and currency and the loan toggle is off
- **THEN** the system saves the debt record and displays it in the debts list
- **AND** no income counterpart is created

#### Scenario: User creates a new debt with loan toggle enabled
- **WHEN** the user submits the debt form with the loan toggle enabled
- **THEN** the system saves the debt record with a `loanId` and a paired income record with the same `loanId`
- **AND** both records appear in their respective lists

#### Scenario: User omits required fields
- **WHEN** the user submits the debt form without a source or amount
- **THEN** the system displays inline validation errors and does not save
