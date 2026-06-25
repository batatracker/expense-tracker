## Context

The app is a no-build-step vanilla JS + Alpine.js project. All JS files are plain browser scripts loaded via `<script>` tags — no `import`/`export`, no bundler. Tooling must not alter the runtime delivery model; all new dependencies stay in `devDependencies` and are never shipped to the browser.

Current state: no linter, no tests, no commit gate, no CI, no standard commit format. Code is consistent in style but has no mechanical enforcement.

## Goals / Non-Goals

**Goals:**
- Automated pre-commit lint gate (blocks bad JS before it hits the repo)
- Enforced Conventional Commits format on every commit message
- Jest unit-test suite covering pure helper logic (i18n key resolution, currency formatting, date helpers, balance arithmetic)
- GitHub Actions CI that runs lint + tests on PRs and blocks merge on failure
- Lightweight static analysis (ESLint rules that double as a code-smell detector — `no-unused-vars`, `no-console` warnings, complexity thresholds)
- README badges showing live CI status, coverage %, and commit convention
- EditorConfig for whitespace consistency
- PR template with a pre-merge checklist

**Non-Goals:**
- End-to-end or browser integration tests (Alpine.js/Google Sheets API surface is too large and requires a live session)
- Changing the runtime delivery model (no bundler, no transpilation)
- Enforcing 100% coverage — only pure helpers are in scope for unit tests
- Automating releases or changelogs (commitlint enables this later; not in scope now)

## Decisions

### 1. ESLint flat config (`eslint.config.js`) over legacy `.eslintrc`
ESLint v9 ships flat config by default. The project has no existing config to migrate. Starting with flat config avoids a future migration.

**Alternative considered**: `.eslintrc.js` (legacy). Rejected because ESLint v9 deprecates it and support will be removed.

### 2. `env: browser + globals` approach for non-module scripts
Since files are plain `<script>` globals (no ES modules), ESLint must know about browser globals (`window`, `document`) and app globals (`Alpine`, `appData`, `CONFIG`). We declare these explicitly in the flat config rather than using `sourceType: module`.

**Alternative considered**: Wrapping files in IIFE or converting to ES modules. Rejected — changes runtime delivery, which is out of scope.

### 3. Jest with `testEnvironment: node` for pure helpers
The only testable units are side-effect-free helpers: i18n key resolution, currency/number formatting, date arithmetic, and balance calculation. These can be extracted (or referenced) without a DOM. Using `node` environment keeps Jest lightweight and avoids `jsdom` overhead.

**Alternative considered**: `jsdom` environment + testing full Alpine component state. Rejected — this couples tests to Alpine's internal behaviour, not business logic.

### 4. Jest via `--experimental-vm-modules` for ESM, or CommonJS wrapper
The source files use no module syntax, so they can be `require()`'d directly in Jest tests by wrapping them in a thin CommonJS shim. A `js/__tests__/helpers/` directory holds these shims.

**Alternative considered**: Babel transform to CommonJS. Adds a dependency and build step. Rejected in favour of direct `require` with a `global` injection pattern for the constants the files expect.

### 5. Husky v9 with `lint-staged`
Husky v9 uses a `.husky/` directory with executable hook scripts. `lint-staged` ensures ESLint only runs on staged JS files, keeping the pre-commit hook fast.

**Alternative considered**: `simple-git-hooks`. Lighter, but less ecosystem support. Husky is more widely understood by contributors.

### 6. `@commitlint/config-conventional` (Angular preset)
The Angular preset maps directly to the commit types the project already uses (`feat`, `fix`, `chore`, `refactor`, `docs`). No custom type list needed.

### 7. GitHub Actions: single `ci.yml` workflow, two jobs (`lint`, `test`)
Separating lint and test as parallel jobs gives faster feedback — lint failures surface without waiting for tests. A third job (`coverage-report`) uploads the Jest coverage artifact.

**Alternative considered**: One combined job. Rejected — parallel jobs give clearer failure attribution.

### 8. Codecov for coverage badge (free for public repos)
Codecov integrates with GitHub Actions via `codecov/codecov-action` and generates the coverage badge URL automatically.

**Alternative considered**: Coveralls. Both are equivalent; Codecov has better GitHub Actions UX.

## Risks / Trade-offs

- **[Risk] Global shim pattern in tests is fragile** → Mitigation: document the shim pattern in a `js/__tests__/README.md`; confine shims to one helper directory so contributors know where the coupling lives.
- **[Risk] Husky hooks only run after `npm install`** → Mitigation: document `npm install` as a first-time contributor step in README; add a `postinstall` script that prints a reminder.
- **[Risk] ESLint flat config is unfamiliar to some contributors** → Mitigation: keep `eslint.config.js` minimal (< 40 lines) with comments.
- **[Risk] Coverage % badge starts low** → Mitigation: set initial threshold at 30% so CI doesn't fail immediately; raise incrementally as tests grow.
- **[Trade-off] No E2E tests** → The Google Sheets API and OAuth flow cannot be tested without live credentials. Accepted gap documented in README.

## Migration Plan

1. Add `package.json` with devDependencies; run `npm install` locally to verify lockfile
2. Add ESLint config; fix any lint errors in existing JS files (expect mostly `no-unused-vars` and `no-console`)
3. Add Husky + lint-staged; verify pre-commit hook fires on a test commit
4. Add commitlint + commit-msg hook; verify a non-conventional commit is rejected
5. Add Jest + first test file; verify `npm test` passes
6. Add GitHub Actions workflow; open a test PR to verify CI triggers
7. Add Codecov token to repo secrets; verify coverage badge resolves
8. Update README with badges and contributor setup instructions

**Rollback**: All changes are additive (new files + devDependencies). Removing the tooling is `rm -rf .husky node_modules package*.json .eslintrc.js .commitlintrc.js .editorconfig .github/workflows/ci.yml` — no runtime code is modified.

## Open Questions

- *(none — all decisions made above)*
