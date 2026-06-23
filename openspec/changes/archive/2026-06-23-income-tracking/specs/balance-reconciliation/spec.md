## ADDED Requirements

### Requirement: User can add a balance reconciliation adjustment
The system SHALL provide a reconciliation entry form within the Income view that allows the user to record a signed adjustment correcting the tracked balance to match real cash on hand. The form SHALL show the current tracked net balance as a reference, accept a signed adjustment amount (positive if real cash exceeds tracked, negative if less), and require a date and optional note.

#### Scenario: Open reconciliation form
- **WHEN** the user taps "Reconcile Balance" in the Income view
- **THEN** the app SHALL display the reconciliation form showing the current tracked net balance, a signed adjustment amount field (with +/− toggle or signed number input), a date field defaulting to today, and an optional notes field

#### Scenario: Save reconciliation with positive adjustment
- **WHEN** the user enters a positive adjustment (e.g., +50, meaning real cash is 50 more than tracked) and saves
- **THEN** the app SHALL append a row to the Income sheet tab with `type=reconciliation` and the signed amount (+50), update the in-memory cache, and show a success toast

#### Scenario: Save reconciliation with negative adjustment
- **WHEN** the user enters a negative adjustment (e.g., −30, meaning real cash is 30 less than tracked) and saves
- **THEN** the app SHALL append a row to the Income sheet tab with `type=reconciliation` and the signed amount (−30), update the in-memory cache, and show a success toast

#### Scenario: Reconciliation amount of zero rejected
- **WHEN** the user enters 0 as the adjustment amount
- **THEN** the app SHALL display an inline error indicating the adjustment must be non-zero and prevent saving

### Requirement: Reconciliation entries appear in the Income view with distinct styling
The system SHALL display reconciliation entries in the Income list within their respective month group, visually differentiated from regular income entries (e.g., different icon, label "Balance adjustment", signed amount with +/− prefix).

#### Scenario: Reconciliation entry displayed in month group
- **WHEN** the Income view renders a month that contains a reconciliation entry
- **THEN** the entry SHALL appear in the month's entry list with a distinct visual style, the label "Balance adjustment" (translated), and the signed amount formatted with an explicit +/− sign

#### Scenario: Reconciliation entry affects carry-over
- **WHEN** a reconciliation entry of −30 exists in March
- **THEN** March's closing balance and April's carry-in SHALL both reflect the −30 adjustment

### Requirement: User can delete a reconciliation entry
The system SHALL allow deleting a reconciliation entry from the Income view using the same delete mechanism as income entries.

#### Scenario: Delete reconciliation entry
- **WHEN** the user deletes a reconciliation entry and confirms
- **THEN** the app SHALL remove the row from the Income sheet tab, remove it from the in-memory cache, recalculate carry-over, and show a success toast
