# CLAUDE.md — FinanceGame

Browserbasiertes Lernspiel zur Schweizer Finanzbuchhaltung (KMU, OR). Vanilla JS, ES Modules, keine externen Dependencies. Lies AGENTS.md für TDD- und Architektur-Pflichten.

## Befehle

| Befehl | Zweck |
|---|---|
| `npm start` | Statischer Server auf Port 4173 (`PORT` überschreibbar) |
| `npm test` | Alle Tests (`node --test`, tests/) |
| `npm run check` | Syntax-Check aller JS-Dateien (scripts/check.mjs, erfasst neue Dateien automatisch) |

## Wo ändere ich was?

| Aufgabe | Datei(en) |
|---|---|
| Neue/geänderte Übungsaufgaben (KP-, AP-, GE-, RG-Fälle) | `src/content/tasks.json` — reine Daten, kein Code |
| Aufgaben-Metadaten (Titel, Leads, Aufgabenreihenfolge, Kontoarten) | `src/content/gameRound.js` |
| Neue Route/Screen | `src/domain/navigation.js` (Route) + `src/ui/screens/<name>.js` (Screen) + Registrierung in `src/ui/app.js` |
| Lernmodul (Theorie-Text) | `lernmodule/<id>.md` + Eintrag in `src/content/theoryModules.js` |
| Styling | `src/ui/styles/` — base (Tokens/Buttons), screens (Intro/Fall/Konfiguration), game (Sidebar/Aufgaben-Cards), modals, t-konto |
| Geschäftslogik (rein, testbar) | `src/domain/` — immer mit Test in `tests/` |

## Struktur

```
src/
  content/    Spielinhalte: tasks.json (alle Übungsdaten), gameRound.js,
              gameDescription.js, caseBriefing.js, gameConfiguration.js,
              accountPlan.js (Kontenplan), theoryModules.js (Lernmodul-Liste)
  domain/     Reine Logik, keine DOM-/Fetch-Abhängigkeit, 1:1 testbar:
              navigation.js (Routen/Hashes), booking.js (Kontolisten/-filter),
              ledger.js (T-Konto: Einträge, Saldo, Kontrollsumme),
              calculator.js, configuration.js, learningModules.js (Suche)
  ui/         app.js (Einstieg: Route→Screen-Registrierung),
              router.js (Hash-Routing), dom.js (appRoot, escapeHtml),
              progress.js (localStorage), markdown.js,
              screens/ (1 Datei pro Screen), components/ (sidebar,
              supportModal, calculator, moduleModal, accountInput),
              styles/ (5 thematische CSS-Dateien, Reihenfolge = index.html)
tests/        node:test; serverSmoke prüft Verhalten (erreichbare Ressourcen),
              nicht Implementierungsdetails
```

## Konventionen

- **TDD ist Pflicht** (Details in AGENTS.md): Domain-Änderungen zuerst per Test in `tests/` absichern.
- Content-Objekte sind mit `Object.freeze` eingefroren; UI rendert über Template-Strings mit `escapeHtml` aus `src/ui/dom.js`.
- UI-Texte auf Deutsch (Schweiz): «ss» statt «ß»; Beträge im Format `CHF 1'234.50` (Formatierung: `formatSwissAmount` in `src/domain/ledger.js`).
- Die T-Konto-Aufgaben (4: Bank, 5: Geschuldete MWST) leiten ihre Einträge automatisch aus den Buchungsdaten ab (`getAccountLedgerItems`). Neue Buchungssätze mit dem jeweiligen Konto erscheinen dort ohne Zusatzaufwand. Der T-Konto-Screen (`screens/tKonto.js`) und der Zuordnungs-Screen (`screens/choiceTasks.js`) sind generisch — neue Instanzen brauchen nur Content-Konfiguration.
- Aufgabe 5 (MWST): Die ESTV-Verrechnungsbuchung MV-10 in tasks.json muss den Summen aller Vorsteuer-Buchungen (1170/1171) der MWST-Teilaufgaben entsprechen — tests/mwstContent.test.js erzwingt das. Wer MWST-Buchungssätze ändert, passt MV-10 an.
- Skonto ist Ertragsminderung (Dienstleistungsertrag im Soll), nicht Finanzaufwand.
- `index.html` lädt das Einstiegsmodul mit Cache-Buster `?v=...` — bei UI-Änderungen Version anpassen.
