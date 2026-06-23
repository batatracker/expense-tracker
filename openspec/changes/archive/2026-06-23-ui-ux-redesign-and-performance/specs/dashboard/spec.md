## MODIFIED Requirements

### Requirement: Dashboard displays a spending summary for the current month
The system SHALL show a summary section at the top of the Dashboard view with three stat cards: "Income this month" (value in success/green color), "Expenses this month" (value in danger/red color), and "Net balance" (value in success color when positive, danger color when negative). A fourth sub-line below the net balance SHALL show the cumulative carry-over balance from all prior months in muted text. When no income has ever been tracked, the system SHALL fall back to a single "Total Spent" stat card (no income/net split). All amounts SHALL be formatted using `Intl.NumberFormat` with the active locale. The stat cards SHALL be displayed on a neutral surface (`--clr-surface`) with a subtle border and shadow — NOT on a colored gradient background.

#### Scenario: Monthly totals shown with income tracked
- **WHEN** the user navigates to the Dashboard and income has been recorded (current month or historically)
- **THEN** the app SHALL display three stat cards — "Income this month" (green value), "Expenses this month" (red value), "Net balance" (green if positive, red if negative) — plus a muted carry-over sub-line beneath the net value

#### Scenario: Month with no income
- **WHEN** there is no income in the current month but expenses exist
- **THEN** "Income this month" SHALL display as 0.00 (green) and "Net balance" SHALL be negative (red)

#### Scenario: Month with no expenses
- **WHEN** there are no expenses in the current month
- **THEN** "Expenses this month" SHALL display as "0.00" formatted for the active locale with the default currency, and "Net balance" SHALL equal "Income this month" (positive, green)

#### Scenario: No income ever tracked — fallback to single card
- **WHEN** no income entries exist at all in the dataset
- **THEN** the summary section SHALL display a single "Total Spent" stat card (the legacy view), without the income/net split

#### Scenario: Carry-over balance reflects all prior months
- **WHEN** prior months have accumulated a net positive balance
- **THEN** a muted sub-line below the "Net balance" value SHALL display the cumulative net (all-time income + reconciliation − all-time expenses)

#### Scenario: Stat cards use neutral surface background
- **WHEN** the Dashboard summary is rendered
- **THEN** the stat cards SHALL use `--clr-surface` as their background (no purple or colored gradient) so that semantic color values (green/red) are clearly readable

### Requirement: Dashboard data load runs in parallel
The system SHALL load expenses, debts, and income concurrently during app initialisation. A failure in one data source SHALL NOT block the others from loading.

#### Scenario: All three data sources load concurrently
- **WHEN** the app boots (either AppScript mode or OAuth mode)
- **THEN** the three initial data fetches (expenses, debts, income) SHALL be initiated simultaneously, not sequentially

#### Scenario: Partial load on one source failure
- **WHEN** one data source fetch fails (e.g., income tab missing)
- **THEN** the other two data sources SHALL still render their data; the failed source SHALL log a warning but not block the UI

### Requirement: Dashboard layout adapts to desktop viewports
The system SHALL use a wider layout on viewports ≥768px, with a maximum content width of 960px and the two chart cards (category breakdown, monthly trend) displayed side by side in a two-column grid.

#### Scenario: Desktop chart layout
- **WHEN** the viewport is ≥768px wide
- **THEN** the category chart and trend chart SHALL be displayed in a two-column grid (side by side), each occupying approximately 50% of the container width

#### Scenario: Desktop stat cards layout
- **WHEN** the viewport is ≥768px wide
- **THEN** the stat cards (income, expenses, net balance) SHALL be displayed in a three-column row rather than stacked vertically

#### Scenario: Mobile layout unchanged
- **WHEN** the viewport is <768px
- **THEN** the Dashboard layout SHALL remain unchanged (vertical stacking, full-width cards, existing behaviour)
