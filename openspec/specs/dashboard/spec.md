## Purpose

Provides the home/dashboard view with spending summaries, category breakdown charts, monthly trend charts, and a recent expenses list. All computations are performed client-side from the cached expense data.
## Requirements
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

### Requirement: Dashboard layout does not crop content on narrow mobile viewports
On viewports narrower than 480 px (e.g., 390–430 px), all dashboard content SHALL remain fully visible within the viewport. No flex child SHALL overflow the right edge of the screen. Elements that previously used `white-space: nowrap` or lacked `min-width: 0` on flex containers SHALL be corrected so text truncates or wraps within bounds rather than pushing the layout wider than the viewport.

#### Scenario: No horizontal scroll on 390 px viewport
- **WHEN** the Dashboard is rendered on a viewport 390 px wide
- **THEN** the page SHALL have no horizontal overflow and all content SHALL be fully visible without scrolling right

#### Scenario: Debt strip amounts do not overflow on small screen
- **WHEN** a debt entry with a long amount string is displayed on the Dashboard debt strip at 390 px width
- **THEN** the amount SHALL truncate with an ellipsis within the available space rather than extending beyond the viewport edge

### Requirement: Pull-to-refresh does not trigger on normal downward scrolling
The pull-to-refresh gesture SHALL only activate when the user intentionally pulls the view container down from the very top, with a minimum drag distance of 80 px. Normal scrolling from the top of the page SHALL NOT trigger a data refresh.

#### Scenario: Scrolling down does not refresh
- **WHEN** the user scrolls down on the Dashboard from the top position with a downward drag of less than 80 px
- **THEN** the app SHALL NOT call `refreshExpenses()`

#### Scenario: Intentional pull refresh triggers reload
- **WHEN** the user pulls down more than 80 px from the top of the Dashboard view
- **THEN** the app SHALL call `refreshExpenses()` and reload the data

