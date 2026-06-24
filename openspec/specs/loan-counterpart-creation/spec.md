# Capability: Loan Counterpart Creation

## Purpose

Handles the creation of paired debt+income record sets when a user marks a new debt or income entry as loan-derived. Both records are linked via a shared `loanId` UUID and displayed with a loan badge in their respective detail views.

## Requirements

### Requirement: Loan toggle on debt creation form
The system SHALL display a "This is a loan" toggle on the debt creation form (new records only). When enabled, the form SHALL show an inline confirmation panel listing both records that will be saved: the debt entry and a paired income entry with the same source, amount, currency, and date.

#### Scenario: User enables loan toggle on debt form
- **WHEN** the user enables the loan toggle while filling out a new debt entry
- **THEN** the form SHALL display an inline confirmation panel showing: "You are about to create: (1) a debt of [amount] [currency] from [source], and (2) an income entry of [amount] [currency] from [source] on [date]"
- **AND** the submit button label SHALL change to "Save debt + income"

#### Scenario: User saves debt with loan toggle enabled
- **WHEN** the user submits a valid new debt form with the loan toggle enabled
- **THEN** the system SHALL generate a shared `loanId` UUID
- **AND** save the debt record (with `loanId`) to the Debts sheet tab
- **AND** save a paired income record (with the same `loanId`, `source`, `amount`, `currency`, `date`) to the Income sheet tab
- **AND** add both records to the in-memory state (`debts` and `income` arrays)
- **AND** show a success toast in the active locale confirming both records were created

#### Scenario: User disables loan toggle before submitting
- **WHEN** the user enables the loan toggle and then disables it before submitting
- **THEN** the confirmation panel SHALL hide
- **AND** submitting the form creates only the debt record (no income counterpart, no `loanId`)

#### Scenario: Second write fails after first succeeds
- **WHEN** the debt record saves successfully but the income counterpart write fails
- **THEN** the system SHALL show an error toast: "Debt saved. Income entry could not be created — please add it manually."
- **AND** the debt record SHALL remain in state (not rolled back)

### Requirement: Loan toggle on income creation form
The system SHALL display a "This is a loan" toggle on the income creation form (new records only). When enabled, the form SHALL show an inline confirmation panel listing both records that will be saved: the income entry and a paired debt entry with the same source, amount, currency, and date.

#### Scenario: User enables loan toggle on income form
- **WHEN** the user enables the loan toggle while filling out a new income entry
- **THEN** the form SHALL display an inline confirmation panel showing: "You are about to create: (1) an income entry of [amount] [currency] from [source], and (2) a debt of [amount] [currency] from [source] on [date]"
- **AND** the submit button label SHALL change to "Save income + debt"

#### Scenario: User saves income with loan toggle enabled
- **WHEN** the user submits a valid new income form with the loan toggle enabled
- **THEN** the system SHALL generate a shared `loanId` UUID
- **AND** save the income record (with `loanId`) to the Income sheet tab
- **AND** save a paired debt record (with the same `loanId`, `source`, `totalAmount = amount`, `outstandingBalance = amount`, `currency`, `date`) to the Debts sheet tab
- **AND** add both records to the in-memory state (`income` and `debts` arrays)
- **AND** show a success toast in the active locale confirming both records were created

#### Scenario: Second write fails after first succeeds
- **WHEN** the income record saves successfully but the debt counterpart write fails
- **THEN** the system SHALL show an error toast: "Income saved. Debt entry could not be created — please add it manually."
- **AND** the income record SHALL remain in state (not rolled back)

### Requirement: Linked counterpart label on debt and income detail views
The system SHALL display a read-only "Linked income" or "Linked debt" label on any debt or income record that carries a `loanId`, identifying it as loan-derived.

#### Scenario: Debt record has a loanId
- **WHEN** the user views or expands a debt record that has a `loanId`
- **THEN** the system SHALL display a badge or label reading "Loan — paired with an income entry"

#### Scenario: Income record has a loanId
- **WHEN** the user views or expands an income record that has a `loanId`
- **THEN** the system SHALL display a badge or label reading "Loan — paired with a debt entry"

#### Scenario: Record has no loanId
- **WHEN** the user views a debt or income record without a `loanId`
- **THEN** no loan badge or label is shown

### Requirement: `loanId` field persisted on both sheet tabs
The system SHALL persist a `loanId` field on debt records written to the Debts sheet tab and on income records written to the Income sheet tab. Existing rows without this field SHALL continue to function normally (treated as having no linked counterpart).

#### Scenario: New loan-linked records written to sheet
- **WHEN** a debt-loan or income-loan pair is saved
- **THEN** both rows in their respective sheet tabs SHALL contain the same `loanId` value in the `loanId` column

#### Scenario: Existing rows without loanId column
- **WHEN** the app reads existing rows that predate the `loanId` column
- **THEN** the `loanId` field SHALL be `undefined` or empty string, and the app SHALL not show a loan badge for those records
