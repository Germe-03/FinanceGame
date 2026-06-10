---
name: agentic-clean-architecture
description: Guide coding agents to design testable software with Clean Architecture, Ports and Adapters, dependency inversion, and dependency injection. Use when adding modules, refactoring, introducing services, repositories, controllers, adapters, framework code, database access, APIs, or other architectural boundaries.
---

# Agentic Clean Architecture

## Overview

Use this skill to keep agent-generated code testable, replaceable, and resistant to framework coupling. Architecture should make TDD easier by allowing most behavior to be tested without UI, database, network, or external services.

## Dependency Rule

Maintain inward dependencies:

```text
Domain <- Application <- Interfaces <- Infrastructure
```

- Domain contains business entities, value objects, rules, and invariants. It has no dependency on frameworks, databases, UI, HTTP, or infrastructure.
- Application contains use cases and ports. It orchestrates domain behavior and depends only inward.
- Interfaces adapts external input/output into application calls, such as controllers, presenters, API schemas, CLI handlers, or view models.
- Infrastructure contains concrete adapters, database access, external APIs, file systems, SMTP, queues, framework wiring, and runtime configuration.

## Design Workflow

1. Identify the use case and business rule before choosing technology.
2. Define the port or interface needed by the use case before writing a concrete adapter.
3. Write unit tests against domain/application behavior using fakes for ports.
4. Implement the application logic until tests pass.
5. Implement infrastructure adapters behind the ports.
6. Add integration tests for adapter behavior and framework wiring.
7. Verify imports and dependencies still point inward.

## Dependency Injection

- Inject dependencies from the outside instead of constructing concrete services inside business logic.
- Do not create database clients, HTTP clients, SMTP clients, file handles, or framework globals inside domain/application objects.
- Wire concrete dependencies at the composition root, such as app startup, CLI main, test fixture, or dependency container.
- Prefer constructor or function parameter injection for clarity.

## TDD-Friendly Boundaries

- Put calculations and business decisions in domain/application code so they can be unit tested quickly.
- Put slow or fragile concerns behind ports: database, network, time, randomness, filesystem, UI, and third-party APIs.
- Use fakes for unit tests and real adapters for integration tests.
- Keep framework decorators, ORM models, and transport schemas outside inner layers unless the existing project intentionally uses a simpler pattern.

## Refactoring Rules

- Preserve behavior with characterization tests before moving legacy code.
- Move code inward when it is business logic hidden in controllers, views, routes, scripts, or database adapters.
- Move code outward when it is framework, IO, persistence, or transport detail leaking into domain/application.
- Avoid large architecture rewrites unless the change needs them. Match the existing repository style when it is coherent and testable.

## Anti-Patterns

- Domain objects importing database, HTTP, UI, or framework modules.
- Services instantiating concrete external clients internally.
- Tests that require a database for pure business rules.
- Hidden global state that makes tests order-dependent.
- Test-only branches in production code.
- Abstractions added only because an agent expects a pattern, not because the code needs a boundary.

## Completion Checklist

- Inner layers are independent of external systems.
- Use cases are testable with fakes.
- Concrete adapters are covered by integration tests when behavior matters.
- Dependency injection is explicit.
- The final response notes any architectural tradeoffs or remaining coupling.
