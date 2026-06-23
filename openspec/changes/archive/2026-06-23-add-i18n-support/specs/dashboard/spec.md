## MODIFIED Requirements

### Requirement: Dashboard displays a spending summary for the current month
The system SHALL show a summary card at the top of the Dashboard view with the total amount spent in the current calendar month across all categories.

#### Scenario: Monthly total shown
- **WHEN** the user navigates to the Dashboard
- **THEN** the app SHALL display the spending summary label and amount formatted using `Intl.NumberFormat` with the active locale

#### Scenario: Month with no expenses
- **WHEN** there are no expenses in the current month
- **THEN** the total SHALL display as "0.00" formatted for the active locale with the default currency

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
