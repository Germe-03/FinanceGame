# AGENTS.md

Diese Datei gilt fuer alle Coding-Agenten, die in diesem Projekt arbeiten: Codex, Claude, Copilot, Cursor, Windsurf, Cline, Gemini CLI, OpenCode und vergleichbare Tools.

## Pflicht vor jeder Arbeit

1. Wenn eine `claude.md` oder `CLAUDE.md` im aktuellen Ordner oder in einem uebergeordneten Projektordner existiert, lies sie zuerst und befolge sie zusaetzlich.
2. Lies diese `AGENTS.md` vor jeder Codeaenderung.
3. Lade die passenden lokalen Skills aus `skills/`, bevor du handelst:
   - Fuer jede Codeaenderung, jeden Bugfix und jedes Feature: `skills/ai-sdlc-tdd/SKILL.md`.
   - Fuer neue Module, Refactorings, Architekturentscheidungen oder Abhaengigkeiten: `skills/agentic-clean-architecture/SKILL.md`.
   - Fuer UI, Frontend, Game-Screens, Lernflows, UX-Writing, Accessibility, Metriken, Evaluation oder KI-Features mit Benutzerkontakt: `skills/hci-ux-design/SKILL.md`.
   - Vor Abschluss, Merge, PR, CI-Aenderungen oder Release-Vorbereitung: `skills/ci-quality-gates/SKILL.md`.
4. Falls ein Skill nicht gelesen werden kann, stoppe nicht stillschweigend. Melde den Grund und arbeite nur mit expliziter Begruendung weiter.

## Projektprinzip

Dieses Projekt folgt Agentic Coding nach dem AI-SDLC aus den Kursunterlagen:

1. Specify: Verhalten, Akzeptanzkriterien, Risiken und Teststrategie klaeren.
2. Design: Architektur, Ports, Schnittstellen und Testgrenzen festlegen.
3. Develop: Integrationstests definieren, Unit Tests test-first schreiben, Code minimal implementieren.
4. Validate: Unit-, Integration-, E2E-, Build- und statische Checks ausfuehren.
5. Deploy/Operate: Nur mit gruenen Qualitaetsgates weitergeben; Ergebnisse dokumentieren.

## TDD ist verpflichtend

- Schreibe oder aendere zuerst einen Test, der das gewuenschte Verhalten oder den Bug reproduziert.
- Fuehre den Test aus und bestaetige, dass er aus dem erwarteten Grund fehlschlaegt.
- Implementiere danach nur so viel Produktionscode, wie noetig ist, damit der Test besteht.
- Refactore erst nach gruenem Testlauf.
- Fuehre nach dem Refactoring die relevanten Tests erneut aus.
- Wenn ein sinnvoller Test nicht moeglich ist, dokumentiere konkret warum und welche alternative Validierung durchgefuehrt wurde. Das ist eine Ausnahme, kein Standardweg.

## Testpyramide

- Viele schnelle Unit Tests fuer Domain, Use Cases, reine Funktionen und Regeln.
- Weniger Integrationstests fuer Ports, Adapter, Datenbank, API und externe Grenzen.
- Wenige, gezielte E2E/UI-Tests fuer kritische Nutzerfluesse.
- Manuelle Pruefung ersetzt keine automatisierten Tests, ausser bei klar begruendeten Randfaellen.

## Architekturregeln

- Bevorzuge testbare Clean-Architecture-/Ports-and-Adapters-Strukturen, wenn das Projekt mehr als triviale Skripte enthaelt.
- Abhaengigkeiten zeigen nach innen: Domain <- Application <- Interfaces <- Infrastructure.
- Domain und Application kennen keine UI, Datenbank, HTTP-Clients, Frameworks oder konkreten externen Services.
- Nutze Dependency Injection: Services erhalten ihre Abhaengigkeiten von aussen, statt sie intern hart zu erzeugen.
- Verwende Fakes oder Mocks fuer externe Grenzen in Unit Tests.

## MMI-/UX-Regeln

- Jede benutzer- oder lernerseitige Funktion muss aus einem echten Nutzerproblem oder Lernziel abgeleitet sein. Starte nicht technology-first und fuege KI nur hinzu, wenn sie ein konkretes Nutzerbeduerfnis loest.
- Kritische Nutzerreisen werden als `USER + GOAL + TASKS` beschrieben. Fuer FinanceGame sind besonders Lernreisen zu Buchungssaetzen, Rechnungskontierung, OR-Artikel-Suche, Feedback und Fortschritt relevant.
- UI- und Game-Design folgen User Centered Design: Strategy, Scope, Structure, Skeleton, Surface. Visuelle Oberflaeche kommt erst nach geklaertem Nutzerziel, Inhalt und Interaktionsstruktur.
- Wende Don Normans Prinzipien an: Affordance, Constraints, Mapping, Feedback/Kausalitaet, Transfer sowie Stereotypen und Gewohnheiten.
- Wende ISO-9241 an: Aufgabenangemessenheit, Selbstbeschreibungsfaehigkeit, Steuerbarkeit, Erwartungskonformitaet, Fehlertoleranz, Individualisierbarkeit und Lernfoerderlichkeit.
- Accessibility ist Pflicht. Orientiere dich an WCAG/POUR: wahrnehmbar, bedienbar, verstaendlich und robust. Aufgaben muessen ohne reine Farb-, Maus-, Sound- oder Timing-Abhaengigkeit loesbar sein.
- UX-Texte folgen LAVA: lesbar, auffindbar/scannbar, verstaendlich und anwendbar. Fehlermeldungen erklaeren Ursache und konkrete naechste Handlung ohne Schuldzuweisung.
- Major UI- oder Lernflow-Aenderungen brauchen Evaluation: Cognitive Walkthrough, heuristische Evaluation, Usability-Test, Prototypentest oder begruendete Alternative.
- UX-Metriken duerfen nicht nur Klicks zaehlen. Verwende bei kritischen Flows CUJ Happiness, Task Health oder HEART und beachte Goodhart's Law.
- Hinterfrage Biases: Confirmation Bias, Availability Heuristic, Anchoring, Sunk Cost Fallacy, Curse of Knowledge und Bandwagon Effect.
## Multi-Agent-Regeln

- Halte Aenderungen klein, fokussiert und nachvollziehbar.
- Arbeite nicht ueber fremde Aenderungen hinweg. Wenn der Arbeitsbaum bereits geaendert ist, lies die betroffenen Dateien und respektiere vorhandene Arbeit.
- Nutze kurzlebige Branches oder klar abgegrenzte Changesets, wenn mehrere Agenten parallel arbeiten.
- Keine Umgehung roter Tests, Lints oder Buildfehler. Fixe sie oder dokumentiere den Blocker exakt.
- Schreibe am Ende auf, welche Tests und Checks gelaufen sind und welche nicht.

## Abschlussbericht jedes Agenten

Jeder Abschluss muss enthalten:

- Was wurde geaendert.
- Welche Tests/Checks wurden ausgefuehrt, inklusive Ergebnis.
- Welche Tests/Checks konnten nicht ausgefuehrt werden und warum.
- Welche Risiken oder offenen Punkte bleiben.

