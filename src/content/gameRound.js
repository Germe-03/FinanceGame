import tasksData from "./tasks.json" with { type: "json" };
import { getAccountLedgerItems } from "../domain/ledger.js";

const accountTypes = Object.freeze({
  Bank: "active",
  Post: "active",
  Kasse: "active",
  "Forderungen LL": "active",
  Darlehensforderungen: "active",
  Warenbestand: "active",
  Maschinen: "active",
  Mobiliar: "active",
  Büromaschinen: "active",
  Fahrzeuge: "active",
  "Verbindlichkeiten LL": "passive",
  Bankdarlehen: "passive",
  Darlehen: "passive",
  Eigenkapital: "passive",
  Warenertrag: "revenue",
  Dienstleistungsertrag: "revenue",
  Produktionserlöse: "revenue",
  Warenaufwand: "expense",
  Materialaufwand: "expense",
  Raumaufwand: "expense",
  Fahrzeugaufwand: "expense",
  Versicherungsaufwand: "expense",
  Energieaufwand: "expense",
  Verwaltungsaufwand: "expense",
  Informatikaufwand: "expense",
  "Sonstiger Betriebsaufwand": "expense",
  Finanzaufwand: "expense",
  Finanzertrag: "revenue",
});

function toAccountPlanTask(task) {
  return Object.freeze({
    ...task,
    correctType: accountTypes[task.correctAccount],
    options: Object.freeze(task.options.map((account) => Object.freeze({ account, type: accountTypes[account] }))),
  });
}

function toInvoiceTask({ id, scenario, amount, debitAccount, creditAccount, explanation, image }) {
  return Object.freeze({
    id,
    scenario,
    amount,
    image: Object.freeze({
      src: `./assets/accounting/rechnungen/${image}`,
      alt: `Rechnung ${id.replace("RG-0", "")} zu ${scenario}`,
    }),
    debit: Object.freeze({ account: debitAccount, type: accountTypes[debitAccount] }),
    credit: Object.freeze({ account: creditAccount, type: accountTypes[creditAccount] }),
    explanation,
  });
}

const accountPlanSearch = Object.freeze({
  title: "Aufgabe 1: Kontenplan-Suchspiel",
  lead: "Wähle zu jedem Geschäftsfall das Konto, das im Schweizer KMU-Kontenplan am besten passt. Es geht noch nicht um vollständige Buchungssätze.",
  nextButtonLabel: "Weiter",
  tasks: Object.freeze(tasksData.accountPlan.map(toAccountPlanTask)),
});

const balanceOnlyTasks = Object.freeze({
  title: "Nur Aktiv- und Passivkonten",
  lead: "Löse diese 20 Geschäftsfälle. Jeder Buchungssatz enthält ausschliesslich Aktiv- und Passivkonten.",
  nextButtonLabel: "Weiter",
  tasks: Object.freeze(tasksData.balanceOnly),
});

const incomeStatementIntro = Object.freeze({
  title: "Aufwand und Ertrag kommen dazu",
  body: "Bis jetzt hast Du nur Bilanzkonten bewegt. Ab jetzt kommen Geschäftsfälle dazu, die den Gewinn verändern: Aufwand vermindert den Erfolg, Ertrag erhöht ihn. Du buchst weiterhin nach Soll und Haben, kombinierst nun aber Aktiv-, Passiv-, Aufwand- und Ertragskonten.",
  nextButtonLabel: "Weiter",
});

const mixedTasks = Object.freeze({
  title: "Gemischte Buchungssätze",
  lead: "Jetzt folgen 40 Geschäftsfälle mit Bilanzkonten sowie Aufwand und Ertrag. Die Beispiele sind ohne MWST formuliert, damit der Fokus auf Soll und Haben bleibt.",
  nextButtonLabel: "Weiter",
  tasks: Object.freeze(tasksData.mixed),
});

const bookingTask = Object.freeze({
  title: "Aufgabe 2: Buchungssätze",
  balanceOnlyTasks,
  incomeStatementIntro,
  mixedTasks,
});

const invoiceBooking = Object.freeze({
  title: "Aufgabe 3: Rechnung kontieren",
  lead: "Pruefe die abgebildete Rechnung und trage darunter den passenden Buchungssatz ein. Die Faelle sind vorerst ohne MWST formuliert.",
  tasks: Object.freeze(tasksData.invoices.map(toInvoiceTask)),
});

// Die T-Konto-Einträge werden aus den Aufgabe-2-Daten abgeleitet: Jeder neue
// Buchungssatz in tasks.json (balanceOnly/mixed) mit Konto Bank erscheint
// automatisch auch in Aufgabe 4.
const tKontoBank = Object.freeze({
  title: "Aufgabe 4: T-Konto Bank",
  accountName: "Bank",
  accountNumber: "1100",
  lead: "Ziehe jeden Betrag auf die richtige Seite des T-Kontos — Soll (links) oder Haben (rechts). Alle Buchungssätze aus Aufgabe 2, in denen das Konto Bank vorkommt, werden automatisch berücksichtigt.",
  items: Object.freeze(getAccountLedgerItems([...tasksData.balanceOnly, ...tasksData.mixed], "Bank")),
});

export const gameRound = Object.freeze({
  title: "FinanceGame Aufgaben",
  subtitle: "Konten finden, buchen, Rechnungen kontieren",
  task: "Du lernst zuerst den Kontenplan kennen, übst danach Buchungssätze und kontierst anschliessend einfache Rechnungen.",
  taskSequence: Object.freeze([
    Object.freeze({ id: "account-plan", title: accountPlanSearch.title, route: "spiel/kontenplan" }),
    Object.freeze({ id: "booking-balance", title: "Aufgabe 2: Nur Aktiv- und Passivkonten", route: "spiel/aktiv-passiv" }),
    Object.freeze({ id: "booking-income-intro", title: "Aufgabe 2: Aufwand und Ertrag kommen dazu", route: "spiel/aufwand-ertrag" }),
    Object.freeze({ id: "booking-mixed", title: "Aufgabe 2: Gemischte Buchungssätze", route: "spiel/gemischt" }),
    Object.freeze({ id: "invoice-booking", title: invoiceBooking.title, route: "spiel/rechnungen" }),
    Object.freeze({ id: "t-konto-bank", title: tKontoBank.title, route: "spiel/t-konto" }),
  ]),
  accountPlanSearch,
  bookingTask,
  balanceOnlyTasks,
  incomeStatementIntro,
  mixedTasks,
  invoiceBooking,
  tKontoBank,
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
