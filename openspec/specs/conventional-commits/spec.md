## Purpose

Defines requirements for enforcing the Conventional Commits 1.0.0 specification via commitlint and Husky, ensuring all commit messages follow a consistent, machine-readable format.

## Requirements

### Requirement: Commit messages conform to Conventional Commits
The project SHALL enforce the Conventional Commits 1.0.0 specification via `commitlint` with `@commitlint/config-conventional` on every `git commit`. The allowed types are: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`, `revert`.

#### Scenario: Valid conventional commit is accepted
- **WHEN** a developer runs `git commit -m "feat: add dark mode toggle"`
- **THEN** the commit-msg hook passes and the commit is created

#### Scenario: Non-conventional commit is rejected
- **WHEN** a developer runs `git commit -m "added new button"`
- **THEN** the commit-msg hook fails, the error message explains the expected format, and no commit object is created

#### Scenario: Commit with scope is accepted
- **WHEN** a developer runs `git commit -m "fix(i18n): correct es-AR currency label"`
- **THEN** the commit-msg hook passes and the commit is created

#### Scenario: Commit with breaking change footer is accepted
- **WHEN** a commit message includes a `BREAKING CHANGE:` footer
- **THEN** the commit-msg hook passes and the commit is created

### Requirement: Husky commit-msg hook is installed automatically
The project SHALL configure Husky so that the commitlint check runs as a `commit-msg` hook. Running `npm install` in a fresh clone SHALL activate the hook without any manual `husky install` step (via `prepare` script in `package.json`).

#### Scenario: Hook active after fresh clone + npm install
- **WHEN** a developer clones the repo and runs `npm install`
- **THEN** `.husky/commit-msg` exists and is executable

#### Scenario: Hook is skipped in CI environments
- **WHEN** `npm install` is run in a GitHub Actions environment (`CI=true`)
- **THEN** Husky's `prepare` script does not error (Husky v9 skips installation when `CI` env var is set)
