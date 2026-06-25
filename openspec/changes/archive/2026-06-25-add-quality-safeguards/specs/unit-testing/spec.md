## ADDED Requirements

### Requirement: Jest test suite runs pure helper logic
The project SHALL have a Jest test suite under `js/__tests__/` that covers pure, side-effect-free helper functions. The test command SHALL be `npm test`. Tests SHALL run in the `node` environment (no DOM required).

Covered helpers at minimum:
- **i18n key resolution** (`t()` in `js/i18n.js`): correct key lookup for both locales, fallback for missing keys
- **Currency formatting**: number-to-display-string formatting used across the app
- **Date utilities**: month/year label generation, period filter boundaries
- **Balance arithmetic**: net balance calculation (income − expenses − debt payments)

#### Scenario: All tests pass on clean code
- **WHEN** `npm test` is run on the unmodified codebase
- **THEN** Jest exits with code 0 and prints a passing summary

#### Scenario: A failing assertion causes non-zero exit
- **WHEN** a helper function returns a wrong value for a known input
- **THEN** Jest exits with code 1 and reports the failing test name and expected vs. received values

### Requirement: Coverage report is generated on every test run
The project SHALL configure Jest to collect coverage from `js/*.js` and output an LCOV report to `coverage/lcov.info` and a text summary to stdout. An initial coverage threshold of 30% SHALL be set; CI fails if coverage drops below.

#### Scenario: Coverage summary printed after tests
- **WHEN** `npm test` completes
- **THEN** Jest prints a per-file coverage table (statements, branches, functions, lines) to stdout

#### Scenario: LCOV artifact produced
- **WHEN** `npm test` completes
- **THEN** `coverage/lcov.info` exists and is non-empty

#### Scenario: Coverage below threshold fails CI
- **WHEN** total statement coverage falls below 30%
- **THEN** Jest exits with a non-zero code and prints the threshold violation

### Requirement: `coverage/` directory is excluded from version control
The project's `.gitignore` SHALL include `coverage/` and `node_modules/` so generated artifacts are never committed.

#### Scenario: Coverage directory not tracked by git
- **WHEN** `git status` is run after `npm test`
- **THEN** the `coverage/` directory does not appear in untracked or modified files
