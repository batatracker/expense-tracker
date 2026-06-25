## Purpose

Defines requirements for code style enforcement via ESLint, pre-commit hooks, and EditorConfig to keep the JS codebase consistent and error-free.

## Requirements

### Requirement: ESLint enforces code style on all JS files
The project SHALL have an `eslint.config.js` (flat config) that lints every file under `js/` and `config.js` using `eslint:recommended` plus a set of project-specific rules.

Rules SHALL include at minimum:
- `no-unused-vars`: error
- `no-undef`: error (with browser globals and app globals declared)
- `no-console`: warn
- `eqeqeq`: error
- `complexity`: warn at threshold 15
- `no-var`: error (enforce `const`/`let`)

#### Scenario: Clean file passes lint
- **WHEN** `npx eslint js/i18n.js` is run on a file with no violations
- **THEN** the command exits with code 0 and no output

#### Scenario: Unused variable is flagged
- **WHEN** a JS file contains a declared but never-used variable
- **THEN** ESLint exits with code 1 and reports a `no-unused-vars` error on the offending line

#### Scenario: `var` keyword is rejected
- **WHEN** a JS file uses `var` instead of `const` or `let`
- **THEN** ESLint exits with code 1 and reports a `no-var` error

### Requirement: Pre-commit hook runs ESLint on staged JS files
The project SHALL use Husky + lint-staged so that ESLint runs automatically on every `git commit` against only the staged `.js` files.

#### Scenario: Commit with clean staged JS succeeds
- **WHEN** all staged `.js` files pass ESLint
- **THEN** the commit proceeds normally

#### Scenario: Commit with lint errors is blocked
- **WHEN** a staged `.js` file has an ESLint error
- **THEN** the commit is aborted, the error is printed to the terminal, and no commit object is created

#### Scenario: Non-JS staged files are unaffected
- **WHEN** only `.md` or `.css` files are staged
- **THEN** ESLint does not run and the commit proceeds without delay

### Requirement: EditorConfig enforces consistent whitespace
The project SHALL have an `.editorconfig` file specifying: `indent_style = space`, `indent_size = 2`, `end_of_line = lf`, `trim_trailing_whitespace = true`, `insert_final_newline = true` for all JS, CSS, HTML, and Markdown files.

#### Scenario: Editor respects EditorConfig
- **WHEN** a developer opens a JS file in an EditorConfig-aware editor
- **THEN** the editor uses 2-space indentation and LF line endings automatically

#### Scenario: EditorConfig file is present at repo root
- **WHEN** the repository is cloned
- **THEN** `.editorconfig` exists at the root and is parseable by the `editorconfig` CLI
