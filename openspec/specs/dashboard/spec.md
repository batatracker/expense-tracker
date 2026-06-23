## Purpose

Provides the home/dashboard view with spending summaries, category breakdown charts, monthly trend charts, and a recent expenses list. All computations are performed client-side from the cached expense data.

## Requirements

### Requirement: Dashboard displays a spending summary for the current month
The system SHALL show a summary section at the top of the Dashboard view with: total income for the current month, total expenses for the current month, net balance for the current month (income − expenses + reconciliation), and the cumulative carry-over balance brought forward from all prior months. All amounts SHALL be formatted using `Intl.NumberFormat` with the active locale.

#### Scenario: Monthly total shown
- **WHEN** the user navigates to the Dashboard
- **THEN** the app SHALL display the spending summary label and amount formatted using `Intl.NumberFormat` with the active locale

#### Scenario: Monthly total shown with income
- **WHEN** the user navigates to the Dashboard with both income and expense data in the current month
- **THEN** the app SHALL display separate cards or rows for: "Income this month", "Expenses this month", "Net this month", and "Total carry-over balance"

#### Scenario: Month with no income
- **WHEN** there is no income in the current month but expenses exist
- **THEN** "Income this month" SHALL display as 0.00 and "Net this month" SHALL be negative

#### Scenario: Month with no expenses
- **WHEN** there are no expenses in the current month
- **THEN** the total SHALL display as "0.00" formatted for the active locale with the default currency

#### Scenario: Carry-over balance reflects all prior months
- **WHEN** prior months have accumulated a net positive balance
- **THEN** "Total carry-over balance" SHALL display the cumulative net (all-time income + reconciliation − all-time expenses)

### Requirement: Dashboard displays a category breakdown chart
The system SHALL render a donut/pie chart showing spending by category for the current month (or selected period).

#### Scenario: Category breakdown chart rendered
- **WHEN** the user views the Dashboard with expenses in the current month
- **THEN** the app SHALL display a Chart.js donut chart where each segment represents a category, with a legend showing category name and percentage

#### Scenario: Chart with single category
- **WHEN** all expenses in the period belong to one category
- **THEN** the chart SHALL render as a single full-circle segment

### Requirement: Dashboard displays a monthly trend chart
The system SHALL render a bar chart showing total spending per month for the last 6 months.

#### Scenario: Monthly trend bar chart
- **WHEN** the user views the Dashboard
- **THEN** the app SHALL display a Chart.js bar chart with one bar per month for the last 6 calendar months (including the current month), with the y-axis showing the total spend amount

#### Scenario: Months with no spending shown as zero
- **WHEN** a month in the 6-month window has no expenses
- **THEN** that month's bar SHALL be rendered with height 0 (not omitted)

### Requirement: Dashboard displays recent expenses
The system SHALL show the 5 most recent expenses below the charts as a quick-reference list.

#### Scenario: Recent expenses list
- **WHEN** the user views the Dashboard
- **THEN** the app SHALL display the 5 most recent expenses (by date) showing merchant/category, amount, and date, with a "View all" link to the Expenses view

### Requirement: Dashboard chart labels adapt to the active locale
The system SHALL render all chart labels (category names, month labels, axis labels) using the active locale translation.

#### Scenario: Category chart labels in Spanish
- **WHEN** the active locale is `es-AR`
- **THEN** the donut/pie chart legend SHALL display translated category names instead of English keys

#### Scenario: Month labels in Spanish
- **WHEN** the active locale is `es-AR`
- **THEN** the monthly trend bar chart x-axis SHALL display month names in Argentine Spanish (e.g., "ene", "feb", "mar")

#### Scenario: Chart labels in English
- **WHEN** the active locale is `en-GB`
- **THEN** all chart labels SHALL display in English (existing behaviour)

### Requirement: Dashboard period selector and UI text adapt to the active locale
The system SHALL render period selector options, section headings, and all other Dashboard UI strings via the active locale translation.

#### Scenario: Period selector options translated
- **WHEN** the active locale is `es-AR`
- **THEN** period options (e.g., "This month", "Last month", "Last 3 months") SHALL be rendered in Argentine Spanish

#### Scenario: Empty state message translated
- **WHEN** the Dashboard has no data for the selected period and locale is `es-AR`
- **THEN** the empty state message SHALL be displayed in Argentine Spanish

### Requirement: Dashboard period selector allows viewing other time ranges
The system SHALL provide a period selector (This Month, Last Month, Last 3 Months, This Year, All Time) that updates all summary and chart data.

#### Scenario: Period selector changes dashboard data
- **WHEN** the user selects a different period from the period selector
- **THEN** all summary figures and charts on the Dashboard SHALL recalculate using only expenses within that period

### Requirement: Dashboard data is computed client-side from cached expenses
All Dashboard computations SHALL be performed in-memory from the cached expense list — no additional API calls are required to render the dashboard after the initial load.

#### Scenario: Dashboard renders from cache
- **WHEN** the expense cache is populated (from sheet load)
- **THEN** the Dashboard SHALL render immediately without making additional Sheets API calls

#### Scenario: Dashboard updates after new expense
- **WHEN** the user adds a new expense and returns to the Dashboard
- **THEN** the Dashboard SHALL reflect the new expense in all summaries and charts
