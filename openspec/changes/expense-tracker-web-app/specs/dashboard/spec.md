## ADDED Requirements

### Requirement: Dashboard displays a spending summary for the current month
The system SHALL show a summary card at the top of the Dashboard view with the total amount spent in the current calendar month across all categories.

#### Scenario: Monthly total shown
- **WHEN** the user navigates to the Dashboard
- **THEN** the app SHALL display "Spent this month: [amount] [currency]" computed from all expenses in the current month

#### Scenario: Month with no expenses
- **WHEN** there are no expenses in the current month
- **THEN** the total SHALL display as "0.00" with the default currency

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
