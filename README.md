# FinanceGame

FinanceGame ist ein interaktives Lernspiel, das die Grundlagen der Finanzbuchhaltung anhand einer erfundenen Schweizer Beispielfirma vermittelt. Ziel ist es, Buchhaltung nicht nur theoretisch zu erklären, sondern spielerisch erfahrbar zu machen: mit konkreten Geschäftsfällen, Rechnungen, Lieferanten, Kunden, Kontierungsaufgaben und Bezug zum Schweizer Obligationenrecht (OR).

## Projektziel

Das Projekt soll ein unterhaltsames, praxisnahes Game werden, das Lernende Schritt für Schritt an zentrale Themen der Finanzbuchhaltung heranführt. Die Spielerinnen und Spieler übernehmen Aufgaben in einer fiktiven Firma und müssen geschäftliche Situationen korrekt beurteilen, buchen und rechtlich einordnen.

Im Zentrum stehen:

- Buchungssätze verstehen und korrekt bilden
- Rechnungen lesen, prüfen und kontieren
- passende Konten auswählen
- Geschäftsfälle einer fiktiven Firma bearbeiten
- relevante Gesetzesartikel im Schweizer Obligationenrecht finden
- finanzielle Zusammenhänge spielerisch begreifen

## Lernidee

Statt isolierter Theorie arbeitet das Spiel mit einer erfundenen Beispielwelt. Die Firma, ihre Lieferanten, Kunden, Rechnungen und Geschäftsfälle sind fiktiv, aber realistisch aufgebaut. Dadurch können typische Situationen aus dem Schweizer Geschäftsalltag geübt werden, ohne echte Firmendaten zu verwenden.

Mögliche Spielsituationen:

- Eine Lieferantenrechnung kommt an und muss kontiert werden.
- Ein Kunde bezahlt eine offene Rechnung.
- Material wird eingekauft und korrekt verbucht.
- Ein Geschäftsfall muss dem passenden OR-Artikel zugeordnet werden.
- Fehlerhafte Buchungen müssen erkannt und korrigiert werden.

## Inhaltliche Schwerpunkte

### Finanzbuchhaltung

- Soll und Haben
- Aktiv-, Passiv-, Aufwand- und Ertragskonten
- einfache und zusammengesetzte Buchungssätze
- Kontierung von Rechnungen
- typische Geschäftsfälle einer Unternehmung
- Zusammenhang zwischen Beleg, Buchung und Abschluss

### Schweizer Recht

- Orientierung im Obligationenrecht
- Finden relevanter Gesetzesartikel
- Verbindung zwischen rechtlicher Grundlage und buchhalterischer Behandlung
- praxisnahe Anwendung anhand fiktiver Fälle

## Referenzmaterial

Für spätere Umsetzungen sind lokale Ablageorte vorbereitet:

- OR-PDF: `assets/legal/or/or.pdf`
- KMU-Kontenplan: `assets/accounting/kmu-kontenplan/kmu-kontenplan.pdf`

## Spielwelt

Das Spiel basiert auf einer erfundenen Schweizer Beispielfirma. Alle Namen, Lieferanten, Kunden, Rechnungen und Geschäftsdaten sind frei erfunden. Sie dienen ausschließlich dem Lernen und der Simulation realitätsnaher Geschäftsfälle.

## Geplante Funktionen

- interaktive Aufgaben zu Buchungssätzen
- Übungen zum Kontieren von Rechnungen
- Suche und Auswahl passender OR-Artikel
- Feedback zu richtigen und falschen Antworten
- Lernfortschritt und Punktesystem
- Level oder Kapitel mit steigender Schwierigkeit
- fiktive Belege, Rechnungen und Geschäftsdokumente
- spielerische Szenarien aus dem Unternehmensalltag

## Zielgruppe

FinanceGame richtet sich an Lernende, Studierende und alle Personen, die einen praxisnahen Einstieg in Finanzbuchhaltung nach Schweizer Kontext suchen. Das Spiel soll besonders für Personen geeignet sein, die Buchhaltung besser verstehen wollen, indem sie konkrete Fälle aktiv lösen.

## Hinweis

Dieses Projekt ist ein Lern- und Simulationsprojekt. Die Inhalte ersetzen keine professionelle Rechts-, Steuer- oder Buchhaltungsberatung. Gesetzliche Grundlagen und buchhalterische Regeln müssen bei produktiver Anwendung immer anhand aktueller offizieller Quellen geprüft werden.

## Status

Das Projekt befindet sich in einer frühen Konzept- und Entwicklungsphase.
## Lokaler KI-Tutor (Ollama)

Der KI-Tutor besteht aus zwei Prozessen:

1. App starten:

```powershell
npm start
```

2. Python-Tutor-API in einem zweiten Terminal starten:

```powershell
py -3 tutor_server.py
```

Standardwerte:

- App: `http://127.0.0.1:4173`
- Tutor-API: `http://127.0.0.1:8766`
- Ollama: `http://127.0.0.1:11434`
- Modell: `llama3.2:3b`

Das Modell kann per Umgebung gesetzt werden:

```powershell
$env:OLLAMA_MODEL = "llama3.1:8b"
py -3 tutor_server.py
```

Alle LLM-Aufrufe und der Systemprompt liegen in Python unter `llm/`. Die JavaScript-App rendert nur das Tutor-Widget und ruft die lokale Python-API auf.
