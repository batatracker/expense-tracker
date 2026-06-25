## 1. Project Scaffolding

- [x] 1.1 Create `package.json` with `devDependencies`: `eslint`, `husky`, `lint-staged`, `@commitlint/cli`, `@commitlint/config-conventional`, `jest`; add `scripts`: `"test": "jest --coverage"`, `"lint": "eslint js/ config.js"`, `"prepare": "husky"`
- [x] 1.2 Run `npm install` to generate `package-lock.json` and verify clean install
- [x] 1.3 Add `node_modules/` and `coverage/` to `.gitignore`
- [x] 1.4 Create `.editorconfig` at repo root with `indent_style=space`, `indent_size=2`, `end_of_line=lf`, `trim_trailing_whitespace=true`, `insert_final_newline=true` for JS/CSS/HTML/Markdown

## 2. ESLint Setup

- [x] 2.1 Create `eslint.config.js` (flat config) with `eslint:recommended`, `env: { browser: true }`, declared globals for Alpine and app-level functions, and project rules: `no-unused-vars: error`, `no-undef: error`, `no-console: warn`, `eqeqeq: error`, `no-var: error`, `complexity: [warn, 15]`
- [x] 2.2 Run `npx eslint js/ config.js` and fix all resulting errors in the existing JS files (expect `no-var`, `no-unused-vars`); warnings may be left as-is
- [x] 2.3 Verify `npx eslint js/ config.js` exits with code 0 after fixes

## 3. Husky + lint-staged (Pre-commit Hook)

- [x] 3.1 Initialise Husky: run `npx husky init` — this creates `.husky/pre-commit` and adds the `prepare` script
- [x] 3.2 Add `lint-staged` config to `package.json`: `"lint-staged": { "js/**/*.js": "eslint --fix", "config.js": "eslint --fix" }`
- [x] 3.3 Update `.husky/pre-commit` to run `npx lint-staged`
- [x] 3.4 Make a test commit with a clean staged JS file and verify the hook runs without error
- [x] 3.5 Introduce a deliberate lint error, stage the file, and verify the commit is blocked

## 4. Conventional Commits (commit-msg Hook)

- [x] 4.1 Create `.commitlintrc.js` with `module.exports = { extends: ['@commitlint/config-conventional'] }`
- [x] 4.2 Create `.husky/commit-msg` file with content: `npx --no -- commitlint --edit "$1"`; make it executable (`chmod +x`)
- [x] 4.3 Verify a valid commit message (`feat: test message`) passes the hook
- [x] 4.4 Verify a non-conventional commit message (`wip: stuff`) is rejected with a clear error

## 5. Jest Unit Tests

- [x] 5.1 Add Jest config to `package.json`: `"jest": { "testEnvironment": "node", "collectCoverageFrom": ["js/i18n.js"], "coverageThreshold": { "global": { "statements": 30 } }, "coverageReporters": ["text", "lcov"] }`
- [x] 5.2 Create `js/__tests__/` directory and a `helpers/setup.js` shim that loads i18n.js into global context for Jest
- [x] 5.3 Write `js/__tests__/i18n.test.js`: test `t()` key lookup for `en-GB` and `es-AR` locales; test fallback for missing key
- [x] 5.4 Write `js/__tests__/currency.test.js`: test number-to-display-string formatting for at least 3 currency codes and edge cases (zero, negative, large numbers)
- [x] 5.5 Write `js/__tests__/balance.test.js`: test net balance arithmetic (income minus expenses minus debt payments) with known fixture data
- [x] 5.6 Run `npm test` and verify all tests pass and coverage report is printed; fix any import/require issues in the shim layer
- [x] 5.7 Verify `coverage/lcov.info` is created and `coverage/` is ignored by git

## 6. GitHub Actions CI Workflow

- [x] 6.1 Create `.github/workflows/ci.yml` with trigger `on: [pull_request]` plus `workflow_dispatch`; define two parallel jobs: `lint` and `test`, both on `ubuntu-latest` / `node 20`
- [x] 6.2 Add `lint` job steps: checkout, setup-node@v4 with cache npm, `npm ci`, `npm run lint`
- [x] 6.3 Add `test` job steps: checkout, setup-node@v4 with cache npm, `npm ci`, `npm test`, upload `coverage/` as artifact `coverage-report`, upload LCOV to Codecov via `codecov/codecov-action@v4` (token from `${{ secrets.CODECOV_TOKEN }}`)
- [ ] 6.4 Add `CODECOV_TOKEN` secret to the GitHub repository settings (obtain from codecov.io after connecting the repo)
- [ ] 6.5 Open a test PR (or push to a branch) and confirm both CI jobs appear and pass in GitHub Actions
- [ ] 6.6 Enable branch protection on `master`: require status checks `CI / lint` and `CI / test` to pass before merge (GitHub repository Settings → Branches → Add rule)

## 7. PR Template

- [x] 7.1 Create `.github/PULL_REQUEST_TEMPLATE.md` with sections: "## Description" (what changes and why), "## Testing" (how was it tested), "## Checklist" with items: lint passes locally, tests pass, commit messages follow Conventional Commits, no runtime files changed unintentionally

## 8. README Badges

- [x] 8.1 Add GitHub Actions CI badge (format: `[![CI](https://github.com/<owner>/expense-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/<owner>/expense-tracker/actions/workflows/ci.yml)`) to README immediately after the title block
- [x] 8.2 Add Codecov coverage badge (obtain URL from Codecov dashboard after first upload) to the same badge block
- [x] 8.3 Add Conventional Commits badge: `[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)` to the badge block
- [ ] 8.4 Verify badges render correctly on GitHub by pushing to master and viewing the README
- [x] 8.5 Add a "Contributing" section to README documenting: `npm install` to activate hooks, commit format requirement, and `npm test` / `npm run lint` commands
