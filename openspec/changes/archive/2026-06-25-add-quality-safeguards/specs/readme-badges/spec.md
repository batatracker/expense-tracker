## ADDED Requirements

### Requirement: README displays CI status badge
The `README.md` SHALL include a GitHub Actions badge that reflects the current status of the `CI` workflow on the `master` branch. The badge SHALL appear near the top of the README, below the title and live-demo line.

#### Scenario: Badge shows passing when CI is green
- **WHEN** the last CI run on `master` passed
- **THEN** the badge displays "passing" in green

#### Scenario: Badge shows failing when CI is red
- **WHEN** the last CI run on `master` failed
- **THEN** the badge displays "failing" in red

#### Scenario: Badge is a valid Markdown image with link
- **WHEN** the README is rendered on GitHub
- **THEN** clicking the badge navigates to the Actions run history page for the CI workflow

### Requirement: README displays test coverage badge
The `README.md` SHALL include a Codecov badge showing the current test coverage percentage for the `master` branch.

#### Scenario: Coverage badge reflects current coverage
- **WHEN** coverage is uploaded to Codecov after a CI run
- **THEN** the badge percentage matches the Jest coverage report

#### Scenario: Badge links to Codecov dashboard
- **WHEN** the user clicks the coverage badge
- **THEN** they are taken to the Codecov project page for this repository

### Requirement: README displays Conventional Commits badge
The `README.md` SHALL include the standard Conventional Commits badge (`conventionalcommits.org`) to signal to contributors that the project uses the standard.

#### Scenario: Conventional Commits badge is rendered
- **WHEN** the README is viewed on GitHub
- **THEN** the orange "Conventional Commits" badge is visible and links to `https://conventionalcommits.org`

### Requirement: Badges are grouped together at the top of README
All badges (CI, coverage, conventional commits, and any others added) SHALL be grouped on a single line or consecutive lines immediately after the project title and one-line description, before the Features section.

#### Scenario: Badge block position in README
- **WHEN** the README is rendered
- **THEN** badges appear in the first visible section, above the Features heading
