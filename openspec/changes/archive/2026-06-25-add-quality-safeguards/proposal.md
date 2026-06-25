## Why

The project ships working features but has no automated gates to catch regressions, style drift, or logic bugs before they land in `master`. Adding standard quality safeguards — linting, tests, commit conventions, and CI — establishes a baseline of code hygiene and makes the project credible to contributors and users alike.

## What Changes

- Add **ESLint** (with a sensible JS config) as a dev dependency; enforce it as a pre-commit hook via **Husky + lint-staged**
- Add **commitlint** to enforce the **Conventional Commits** standard on every commit message (also via Husky)
- Add a **Jest** unit-test suite covering pure-logic helpers (currency formatting, i18n key lookup, date utilities, balance calculations)
- Add a **GitHub Actions CI workflow** that runs on every PR: lint check, unit tests with coverage, and a lightweight static code-smell scan
- Add a **`package.json`** (devDependencies only, no build step changes) to host all tooling
- Update **`README.md`** with status badges (CI passing, test coverage, conventional commits)
- Add **`.editorconfig`** for consistent whitespace across editors
- Add a **PR template** (`.github/PULL_REQUEST_TEMPLATE.md`) enforcing a checklist before merge

## Capabilities

### New Capabilities

- `linting`: ESLint configuration, lint-staged integration, pre-commit Husky hook — catches syntax errors, unused vars, and style violations before commit
- `unit-testing`: Jest test suite for pure JS helpers; coverage report generated on CI
- `conventional-commits`: commitlint config + Husky commit-msg hook enforcing Conventional Commits; allows automated changelog generation in future
- `github-actions-ci`: `.github/workflows/ci.yml` running lint + tests on every PR; blocks merge on failure
- `readme-badges`: CI status, coverage, and conventional-commits badges added to `README.md`

### Modified Capabilities

*(none — no existing spec-level behavior changes)*

## Impact

- **New files**: `package.json`, `.eslintrc.js`, `.commitlintrc.js`, `.editorconfig`, `.husky/pre-commit`, `.husky/commit-msg`, `.github/workflows/ci.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `js/__tests__/` directory
- **Modified files**: `README.md` (badges), `.gitignore` (add `node_modules/`, `coverage/`)
- **No runtime changes**: all tooling is dev-only; `index.html`, `js/*.js`, and `css/app.css` are unchanged at runtime
- **Dependencies**: all in `devDependencies` — `eslint`, `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`, `jest`
- **Contributors**: first-time contributors will need to run `npm install` to activate hooks; documented in README setup section
