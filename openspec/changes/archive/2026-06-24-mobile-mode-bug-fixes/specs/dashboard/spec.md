## ADDED Requirements

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
