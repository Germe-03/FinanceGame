---
name: hci-ux-design
description: Enforce human-computer interaction and UX rules from the Mensch-Maschine-Interaktion course. Use when designing, implementing, reviewing, or testing any UI, frontend, game screen, learner journey, onboarding, interaction flow, feedback, error message, accessibility behavior, UX writing, visual design, critical user journey, UX metric, user research, evaluation method, or AI-assisted user-facing feature.
---

# HCI UX Design

## Overview

Use this skill to make FinanceGame usable, accessible, understandable, and measurable for real learners. User needs and learning goals come before technology, visual polish, or AI features.

## Mandatory Workflow

1. Start with the user problem.
   - Define the learner, goal, and task before designing UI or game mechanics.
   - Do not start with "How can we add AI?" or "Which cool feature can we build?"
   - For AI features, prove which human need is addressed: Wissen, Entscheiden, Machen, Lernen, Erstellen, Entdecken, Vernetzen, or Geniessen.
   - In FinanceGame, prefer Lernen, Wissen, and Entscheiden unless another need is explicit.

2. Define the Critical User Journey.
   - Express each important flow as `USER + GOAL + TASKS`.
   - Write the goal in user language: "Ich moechte...", not as a technical feature.
   - Keep the product focused on roughly 5-7 critical journeys, maximum 10.
   - Map every learner-facing feature to at least one CUJ or remove/defer it.

3. Apply User Centered Design.
   - Strategy: clarify product objectives and learner needs.
   - Scope: define what learners can do and which content is required.
   - Structure: organize information architecture, labels, and navigation.
   - Skeleton: design interactions, screens, navigation, and prototypes.
   - Surface: apply visual design only after the interaction concept works.

4. Implement with TDD and UX checks together.
   - Pair behavior tests with UI states, feedback, error handling, and accessibility expectations.
   - Add E2E tests for critical learner journeys.
   - Include manual visual/accessibility review only as a supplement to automated checks.

## Interaction Design Rules

Apply Don Norman's design factors:

- Affordance: controls must visually suggest how they are used.
- Constraints: make impossible or invalid actions hard to trigger.
- Mapping: labels, controls, and outcomes must have natural spatial/logical relationships.
- Feedback/causality: every action needs immediate, understandable system feedback.
- Transfer: reuse familiar patterns where they help learners.
- Stereotypes and habits: respect common conventions unless there is a tested reason not to.

Reduce Norman's gulfs:

- Gulf of Execution: learners must know what action is possible and how to do it.
- Gulf of Evaluation: learners must understand what happened, whether they progressed, and what to do next.

Prefer recognition over recall. Use visible options, examples, hints, and progressive disclosure instead of forcing learners to remember hidden commands.

## ISO-9241 Dialogue Principles

Every UI flow must support these seven principles:

- Aufgabenangemessenheit: show only relevant information and support the task efficiently.
- Selbstbeschreibungsfaehigkeit: every step explains itself through labels, state, and feedback.
- Steuerbarkeit: learners can control pace, navigate, cancel, undo, retry, or resume where appropriate.
- Erwartungskonformitaet: behavior matches platform, domain, and user expectations.
- Fehlertoleranz: errors are preventable, recoverable, and explained without blame.
- Individualisierbarkeit: support different needs such as language, zoom, pace, and input preferences.
- Lernfoerderlichkeit: the interface helps learners build understanding over time.

## Accessibility

Use WCAG's POUR model as the baseline:

- Perceivable: text alternatives for non-text content, sufficient contrast, readable text, no color-only meaning.
- Operable: keyboard access, visible focus, reachable controls, no mouse-only workflows.
- Understandable: clear labels, consistent navigation, predictable interactions, helpful errors.
- Robust: semantic HTML/components and compatibility with assistive technologies.

For FinanceGame specifically:

- Accounting tasks must remain solvable without relying only on color, sound, drag-and-drop, or timing.
- Provide labels for form fields, account choices, legal article references, buttons, and feedback messages.
- Keep focus order logical in exercises, modals, navigation, and game overlays.
- Support zoom and responsive layouts without clipped controls or hidden learning content.

## UX Writing With LAVA

Make all interface text:

- Lesbar: readable size, contrast, sentence length, and typography.
- Auffindbar/scannbar: clear headings, grouped content, lists, and emphasis.
- Verstaendlich: user vocabulary, explained technical terms, no unnecessary jargon.
- Anwendbar: text helps the learner complete the current task.

Rules:

- Use the learner's language, not internal implementation terms.
- Avoid blaming wording. Prefer "Bitte waehle ein gueltiges Konto" over "Fehlerhafte Eingabe".
- Error messages must explain what happened, why it matters, and how to fix it.
- Labels must stay consistent across forms, exercises, results, and feedback.

## Visual Design And Cognition

- Use Gestalt principles: proximity, similarity, common region, connection, closure, symmetry, common movement, and continuation.
- Design for attention limits: make the next important action visually clear.
- Avoid mode errors by making the current mode/status unmistakable.
- Use Fitts' Law pragmatically: primary actions should be large enough and easy to reach.
- Do not let aesthetics mask poor usability. Usability is a hygiene factor; aesthetics can motivate only after the flow works.
- Keep visual complexity appropriate for the learner's level and the current exercise.

## FinanceGame Learning UX

For every exercise or game mechanic:

- State or imply the learner goal clearly.
- Provide immediate, specific feedback after actions.
- Explain why an answer is correct or incorrect, especially for booking entries and OR articles.
- Offer hints that scaffold learning without solving the full task immediately.
- Preserve the learner's work when validation fails.
- Allow retry, undo, or correction where it supports learning.
- Increase difficulty gradually and make progress visible.
- Separate playful reward from actual mastery; points must not hide misunderstanding.

## Evaluation And Metrics

Before finishing major UI/game changes, choose an evaluation approach:

- Cognitive Walkthrough: for each step ask whether the learner knows what to do and whether feedback shows progress.
- Heuristic evaluation: inspect against this skill, ISO-9241, accessibility, and project conventions.
- Usability testing: observe representative users doing realistic tasks; use think-aloud when feasible.
- Prototype testing: validate interaction and wording before costly implementation.
- Analytics/benchmarking: measure behavior only when it informs product decisions.

Measure CUJs with both perception and behavior:

- CUJ Happiness: satisfaction for the specific goal, usually via short in-product survey.
- Task Health: task start, success, failure, termination, abandon, restart.
- HEART: Happiness, Engagement, Adoption, Retention, Task Success.
- Combine UX metrics with product and engineering metrics.
- Remember Goodhart's Law: once a metric becomes the target, it can stop being a good metric.

## Bias Countermeasures

Actively guard against product-development biases:

- Confirmation Bias: seek evidence that contradicts the preferred solution.
- Availability Heuristic: do not overreact to recent anecdotes; compare with broader data.
- Anchoring Bias: explore multiple alternatives before committing to the first idea.
- Sunk Cost Fallacy: stop or change features that do not serve learner goals.
- Curse of Knowledge: test with people who do not already understand accounting or the codebase.
- Bandwagon Effect: do not copy trends or AI features without a validated user need.

## Completion Checklist

Before handing off UI, game, or learner-facing work, report:

- Which CUJ or user need the change supports.
- Which ISO-9241, accessibility, and UX-writing checks were applied.
- Which tests, E2E flows, screenshots, or manual reviews verified the interaction.
- Which UX metrics or evaluation method should be used next if the change is significant.
- Any remaining accessibility, usability, or bias risks.