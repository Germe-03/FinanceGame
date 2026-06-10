---
name: ai-sdlc-tdd
description: Enforce AI-SDLC test-driven development for coding agents. Use when implementing features, fixing bugs, changing behavior, refactoring code, adding tests, or deciding how to validate code changes with Red-Green-Refactor, unit tests, integration tests, and E2E tests.
---

# AI-SDLC TDD

## Overview

Use this skill to turn every code change into a verified Red-Green-Refactor loop. The goal is explicit expected behavior before implementation, fast feedback during development, and a clear validation record before handoff.

## Mandatory Workflow

1. Specify the behavior.
   - Restate the requested behavior or bug in concrete terms.
   - Identify acceptance criteria before editing production code.
   - Decide the smallest meaningful test level: unit, integration, or E2E.

2. Red: create the failing test first.
   - Add or update the test that proves the requested behavior.
   - For a bugfix, reproduce the bug with a regression test.
   - Run the narrowest relevant test command.
   - Confirm the failure is caused by the expected missing or broken behavior.

3. Green: implement the smallest production change.
   - Keep the implementation scoped to the failing test and acceptance criteria.
   - Prefer simple code over abstractions until duplication or complexity justifies one.
   - Do not change unrelated behavior to make tests pass.

4. Refactor after green.
   - Clean naming, structure, duplication, and boundaries only after tests pass.
   - Keep behavior unchanged during refactoring.
   - Re-run the affected tests after every meaningful refactor.

5. Validate broadly enough.
   - Run the targeted test first, then the relevant surrounding suite.
   - Add integration or E2E coverage when behavior crosses a real boundary.
   - Record every command and result in the final response.

## Test Selection

- Use unit tests for domain entities, pure functions, calculations, validation rules, and application use cases.
- Use integration tests for repositories, database mappings, HTTP/API adapters, file IO, message queues, and framework wiring.
- Use E2E/UI tests for critical user journeys and workflows that must prove the system works from the outside.
- Use characterization tests before refactoring unclear legacy behavior.
- Use contract tests when multiple agents or services work against shared APIs.

## Agent Rules

- Never implement a behavior change without first creating or identifying the test that will verify it.
- Never declare success only from code inspection when executable validation is available.
- Prefer fakes for external systems in unit tests; use real adapters only in integration tests.
- Do not mock the class or function under test.
- Keep tests deterministic, isolated, and fast unless they are intentionally integration or E2E tests.
- If there is no test framework, add the smallest appropriate test setup or state why that is out of scope.
- If a test cannot be written, document the blocker and use the strongest available alternative validation.

## Completion Checklist

Before finishing, ensure these are true:

- A relevant test was added or updated before production code, unless explicitly justified.
- The failing test was observed before the implementation or the existing test failure was documented.
- The final relevant test command passed, or the remaining failure is reported as a blocker.
- Refactoring, if any, happened after a green test run.
- The final response includes test commands, results, and gaps.
