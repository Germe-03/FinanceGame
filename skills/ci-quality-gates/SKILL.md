---
name: ci-quality-gates
description: Define build, test, static analysis, CI/CD, review, and handoff quality gates for coding agents. Use before finishing a code change, preparing a PR, changing workflows, debugging CI, merging agent-generated code, or validating multi-agent work.
---

# CI Quality Gates

## Overview

Use this skill to finish changes with trustworthy automated feedback. The goal is fast local confirmation first, then broader validation before merge, PR, deployment, or handoff.

## Discover Project Commands

Before inventing commands, inspect the repository for existing instructions:

- `AGENTS.md`, `claude.md`, `CLAUDE.md`
- `README.md`, `Makefile`, `justfile`, `Taskfile.yml`
- `package.json`, `pyproject.toml`, `requirements.txt`, `tox.ini`, `pytest.ini`
- `.github/workflows/`, `.gitlab-ci.yml`, CI config files
- Dockerfiles, compose files, build scripts, test scripts

Use the project's configured commands when available. If none exist, choose the smallest ecosystem-standard command and explain the assumption.

## Gate Order

1. Run the narrow test that covers the change.
2. Run the relevant unit test suite.
3. Run integration tests for touched boundaries.
4. Run E2E/UI tests for user-facing workflows.
5. Run configured linting, formatting checks, type checks, and static analysis.
6. Run build or packaging commands when deployable artifacts are affected.
7. For UI/game/learner-facing changes, apply skills/hci-ux-design/SKILL.md checks for accessibility, interaction, wording, screenshots, and critical user journeys.
8. Check CI workflow validity when workflow files changed.

## Test Pyramid

- Keep most tests fast and local at unit level.
- Add integration tests for database, API, filesystem, adapters, and framework wiring.
- Add a small number of E2E tests for critical flows.
- Do not replace unit coverage with slow E2E tests.
- Do not claim confidence from manual inspection when automated checks exist.

## CI/CD Expectations

- CI should provide quick feedback, ideally under 15 minutes for normal PR checks.
- Every merge candidate should have green tests, build, and configured static checks.
- Deployment requires stronger confidence than local development: integration, E2E, build artifacts, and environment-specific checks where applicable.
- If a build or test is flaky, isolate it and report the evidence instead of re-running silently until it passes.

## Multi-Agent Integration

- Prefer short-lived branches and small pull requests.
- Rebase or update frequently when multiple agents edit nearby files.
- Use contract-first changes for shared APIs, schemas, events, and service boundaries.
- Add conflict detection or CI checks before merge when multiple agents work in parallel.
- Never merge or hand off code with unexplained failing gates.

## Failure Handling

- If a gate fails because of your change, fix it before finishing.
- If a gate fails because of unrelated existing breakage, capture the exact failure and explain why it is unrelated.
- If a command cannot run locally, state the missing dependency, unavailable service, permission issue, or environment limitation.
- Do not hide skipped tests. Skipped gates are part of the risk report.

## Completion Checklist

Every final handoff must include:

- Commands run and pass/fail result.
- Relevant failing output summarized when a command fails.
- Tests added or updated.
- Gates not run and the reason.
- Residual risk, especially around untested external integrations.
