import tasksData from "./tasks.json" with { type: "json" };

export const gameRound = Object.freeze({
  title: "Aufgabe 1: Buchungssätze",
  subtitle: "Buchungssätze trainieren",
  task: "Du startest mit einfachen Geschäftsfällen aus Bilanzkonten. Danach kommen Aufwand und Ertrag dazu, damit Du den Schritt in die Erfolgsrechnung bewusst nachvollziehst.",
  balanceOnlyTasks: Object.freeze({
    title: "Nur Aktiv- und Passivkonten",
    lead: "Löse zuerst diese 20 Geschäftsfälle. Jeder Buchungssatz enthält ausschliesslich Aktiv- und Passivkonten.",
    nextButtonLabel: "Weiter",
    tasks: Object.freeze(tasksData.balanceOnly),
  }),
  incomeStatementIntro: Object.freeze({
    title: "Aufwand und Ertrag kommen dazu",
    body: "Bis jetzt hast Du nur Bilanzkonten bewegt. Ab jetzt kommen Geschäftsfälle dazu, die den Gewinn verändern: Aufwand vermindert den Erfolg, Ertrag erhöht ihn. Du buchst weiterhin nach Soll und Haben, kombinierst nun aber Aktiv-, Passiv-, Aufwand- und Ertragskonten.",
    nextButtonLabel: "Weiter",
  }),
  mixedTasks: Object.freeze({
    title: "Gemischte Buchungssätze",
    lead: "Jetzt folgen 40 Geschäftsfälle mit Bilanzkonten sowie Aufwand und Ertrag. Die Beispiele sind ohne MWST formuliert, damit der Fokus auf Soll und Haben bleibt.",
    tasks: Object.freeze(tasksData.mixed),
  }),
  referenceActions: Object.freeze([
    Object.freeze({ id: "kmu-chart", label: "KMU-Kontenplan", href: "./assets/accounting/kmu-kontenplan/Schweizer-Kontenrahmen-KMU.pdf" }),
    Object.freeze({ id: "or-law", label: "OR", href: "./assets/legal/or/or.pdf" }),
  ]),
  buddyAction: Object.freeze({
    label: "KI-Buddy",
    enabled: false,
    hint: "Der KI-Buddy wird später ergänzt.",
  }),
});
