# Buchungssätze

## Was ist ein Buchungssatz?

Ein Buchungssatz beschreibt einen Geschäftsfall vollständig: welches Konto wird belastet (Soll), welches erkannt (Haben) und wie hoch ist der Betrag.

## Aufbau eines Buchungssatzes

**Sollkonto / Habenkonto    Betrag**

Der Buchungssatz wird immer von **Soll nach Haben** gelesen.

## Einfacher Buchungssatz

Ein Soll-Konto, ein Haben-Konto.

Beispiel — Miete per Bank bezahlt:
`Raumaufwand / Bank    CHF 2'800.00`

## Zusammengesetzter Buchungssatz

Mehrere Konten auf Soll- oder Haben-Seite (oder beides).

Beispiel — Rechnung (CHF 1'450) bezahlt mit Rabatt (CHF 145) und Skonto (CHF 26.10):
- `Kasse / Forderungen LL    CHF 1'278.90`
- `Dienstleistungsertrag / Forderungen LL    CHF 145.00`
- `Dienstleistungsertrag / Forderungen LL    CHF 26.10`

## Buchungsregeln (Soll und Haben)

- Aktivkonto **steigt** → Soll
- Aktivkonto **sinkt** → Haben
- Passivkonto **steigt** → Haben
- Passivkonto **sinkt** → Soll
- Aufwand **entsteht** → Soll
- Aufwand **sinkt** → Haben
- Ertrag **entsteht** → Haben
- Ertrag **sinkt** → Soll

### Warum sind soll und haben so gesetzt?
- Aktivkonto: ist so weil ist so
- Passivkonto: ist so weil ist so
- Ertrag: Muss so sein da wenn es anders herum wäre der Buchungssatz:
    Bank / Finanzertrag 10
    aussagen würde Das Bankguthaben steigt obwohl der ertrag abgenommen hat, was defakto keinen sinn machen würde.
- Aufwand: Muss so sein da wenn es anders herum wäre der Buchungssatz:
    Handelswarenaufwand / Bank 1000
    aussagen würde dass wir einem Lieferanten geld überweisen aber obwohl wir einen geringeren aufwand haben.

## Typische Beispiele

- Lieferantenrechnung erhalten: `Materialaufwand / Verbindlichkeiten LL`
- Kundenrechnung gestellt: `Forderungen LL / Dienstleistungsertrag`
- Rechnung bezahlt: `Verbindlichkeiten LL / Bank`
- Lohn ausbezahlt: `Lohnaufwand / Bank`
