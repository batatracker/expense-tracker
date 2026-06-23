## MODIFIED Requirements

### Requirement: Dashboard displays a spending summary for the current month
The system SHALL show a summary section at the top of the Dashboard view with: total income for the current month, total expenses for the current month, net balance for the current month (income − expenses + reconciliation), and the cumulative carry-over balance brought forward from all prior months. All amounts SHALL be formatted using `Intl.NumberFormat` with the active locale.

#### Scenario: Monthly total shown with income
- **WHEN** the user navigates to the Dashboard with both income and expense data in the current month
- **THEN** the app SHALL display separate cards or rows for: "Income this month", "Expenses this month", "Net this month", and "Total carry-over balance"

#### Scenario: Month with no income
- **WHEN** there is no income in the current month but expenses exist
- **THEN** "Income this month" SHALL display as 0.00 and "Net this month" SHALL be negative

#### Scenario: Month with no expenses
- **WHEN** there are no expenses in the current month
- **THEN** the total expenses card SHALL display as "0.00" formatted for the active locale with the default currency

#### Scenario: Carry-over balance reflects all prior months
- **WHEN** prior months have accumulated a net positive balance
- **THEN** "Total carry-over balance" SHALL display the cumulative net (all-time income + reconciliation − all-time expenses)
