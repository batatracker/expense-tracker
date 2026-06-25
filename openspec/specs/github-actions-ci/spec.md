## Purpose

Defines requirements for the GitHub Actions CI pipeline, including workflow triggers, parallel lint and test jobs, coverage artifact uploads, branch protection rules, and PR templates.

## Requirements

### Requirement: CI workflow runs on every pull request
The project SHALL have a GitHub Actions workflow at `.github/workflows/ci.yml` that triggers on `pull_request` events targeting `master`. The workflow SHALL also be triggerable manually via `workflow_dispatch`.

#### Scenario: Workflow triggered on PR open
- **WHEN** a pull request is opened against `master`
- **THEN** the `CI` workflow starts automatically in GitHub Actions

#### Scenario: Workflow triggered on PR update
- **WHEN** new commits are pushed to an open PR branch
- **THEN** the `CI` workflow re-runs on the latest commit

### Requirement: CI runs lint job and test job in parallel
The workflow SHALL have two parallel jobs: `lint` and `test`. Both SHALL use `ubuntu-latest` and `node 20`. The workflow fails if either job fails.

The `lint` job SHALL:
1. Check out the repo
2. Set up Node 20
3. Run `npm ci`
4. Run `npx eslint js/ config.js`

The `test` job SHALL:
1. Check out the repo
2. Set up Node 20
3. Run `npm ci`
4. Run `npm test`
5. Upload the `coverage/` directory as a workflow artifact
6. Upload LCOV to Codecov via `codecov/codecov-action@v4`

#### Scenario: Both jobs pass on clean PR
- **WHEN** a PR has no lint errors and all tests pass
- **THEN** both jobs show a green checkmark and the PR status check passes

#### Scenario: Lint failure blocks merge
- **WHEN** the `lint` job exits with a non-zero code
- **THEN** the PR status check fails and GitHub marks the PR as not mergeable (when branch protection is enabled)

#### Scenario: Test failure blocks merge
- **WHEN** the `test` job exits with a non-zero code
- **THEN** the PR status check fails and the coverage artifact is still uploaded for inspection

#### Scenario: Coverage artifact is accessible
- **WHEN** the `test` job completes (pass or fail)
- **THEN** a `coverage-report` artifact is available for download from the GitHub Actions run summary

### Requirement: Branch protection requires CI to pass before merge
The repository's `master` branch SHALL have a branch-protection rule requiring the `CI / lint` and `CI / test` status checks to pass before a PR can be merged. This is a repository settings configuration, not a file change.

#### Scenario: PR blocked without passing CI
- **WHEN** CI has not yet run or has failed on a PR
- **THEN** the "Merge pull request" button is disabled (or requires an admin override)

### Requirement: PR template guides contributors
The project SHALL have a `.github/PULL_REQUEST_TEMPLATE.md` with a checklist that includes: description of changes, testing done, lint check passed locally, commit messages follow Conventional Commits.

#### Scenario: PR template auto-populates on new PR
- **WHEN** a developer opens a new PR on GitHub
- **THEN** the PR description field is pre-filled with the template content
