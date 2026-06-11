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
  nextRoute: "spiel/mwst/zuordnen",
  nextLabel: "Weiter zu Aufgabe 5: Mehrwertsteuer",
});

const mwst = Object.freeze({
  title: "Aufgabe 5: Mehrwertsteuer",
  classification: Object.freeze({
    title: "Aufgabe 5: Vorsteuer oder geschuldete MWST?",
    lead: "Entscheide bei jedem Geschäftsfall: Entsteht Vorsteuer (wir haben eingekauft), geschuldete MWST (wir haben verkauft) — oder gar keine MWST? Achtung, einige Fälle sehen nach MWST aus, lösen aber keine aus.",
    nextButtonLabel: "Weiter",
    choiceOptions: Object.freeze([
      Object.freeze({ id: "vorsteuer", label: "Vorsteuer", hint: "Wir haben eingekauft — Guthaben gegenüber der ESTV" }),
      Object.freeze({ id: "geschuldet", label: "Geschuldete MWST", hint: "Wir haben verkauft — Schuld gegenüber der ESTV" }),
      Object.freeze({ id: "keine", label: "Keine MWST", hint: "Geschäftsfall ohne MWST-Folge" }),
    ]),
    tasks: Object.freeze(tasksData.mwstClassification),
  }),
  bookingsBasic: Object.freeze({
    title: "Aufgabe 5: Buchen mit MWST",
    lead: "Buche die Geschäftsfälle inklusive MWST. Verwende für die Vorsteuer vorerst nur das Konto 1170 — die Unterscheidung 1170/1171 folgt im nächsten Schritt. Nicht jeder Fall enthält MWST!",
    nextButtonLabel: "Weiter",
    tasks: Object.freeze(tasksData.mwstBookingsBasic),
  }),
  vorsteuerSplit: Object.freeze({
    title: "Aufgabe 5: Vorsteuer 1170 oder 1171?",
    lead: "Die Vorsteuer wird auf zwei Konten geführt: 1170 für Material, Waren, Dienstleistungen und Energie — 1171 für Investitionen und übrigen Betriebsaufwand. Ordne jeden Einkauf dem richtigen Konto zu.",
    nextButtonLabel: "Weiter",
    choiceOptions: Object.freeze([
      Object.freeze({ id: "1170", label: "1170 Vorsteuer", hint: "Material, Waren, Dienstleistungen, Energie" }),
      Object.freeze({ id: "1171", label: "1171 Vorsteuer", hint: "Investitionen und übriger Betriebsaufwand" }),
      Object.freeze({ id: "keine", label: "Kein Vorsteuerabzug", hint: "Hier wurde gar keine MWST bezahlt" }),
    ]),
    tasks: Object.freeze(tasksData.mwstVorsteuerSplit),
  }),
  bookingsAdvanced: Object.freeze({
    title: "Aufgabe 5: Buchen mit 1170 und 1171",
    lead: "Buche mit den richtigen Vorsteuerkonten 1170 und 1171. Achtung: Einige Fälle enthalten gar keine MWST — und bei der Verpflegung musst Du den richtigen Satz wählen (8.1 % normal, 2.6 % reduziert für Takeaway).",
    nextButtonLabel: "Weiter zum T-Konto",
    tasks: Object.freeze(tasksData.mwstBookingsAdvanced),
  }),
  tKonto: Object.freeze({
    title: "Aufgabe 5: T-Konto Geschuldete MWST",
    accountName: "Geschuldete MWST",
    accountNumber: "2200",
    lead: "Führe das Konto Geschuldete MWST: Ziehe alle MWST-Buchungen aus den beiden Buchungs-Teilaufgaben auf die richtige Seite. Der Saldo zeigt am Schluss die Zahllast — den Betrag, den die Firma der ESTV überweisen muss.",
    items: Object.freeze(getAccountLedgerItems([...tasksData.mwstBookingsBasic, ...tasksData.mwstBookingsAdvanced], "Geschuldete MWST")),
  }),
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
    Object.freeze({ id: "mwst-classify", title: mwst.classification.title, route: "spiel/mwst/zuordnen" }),
    Object.freeze({ id: "mwst-booking-basic", title: mwst.bookingsBasic.title, route: "spiel/mwst/buchen" }),
    Object.freeze({ id: "mwst-vorsteuer-split", title: mwst.vorsteuerSplit.title, route: "spiel/mwst/vorsteuer-konten" }),
    Object.freeze({ id: "mwst-booking-advanced", title: mwst.bookingsAdvanced.title, route: "spiel/mwst/buchen-vertieft" }),
    Object.freeze({ id: "mwst-t-konto", title: mwst.tKonto.title, route: "spiel/mwst/t-konto" }),
  ]),
  accountPlanSearch,
  bookingTask,
  balanceOnlyTasks,
  incomeStatementIntro,
  mixedTasks,
  invoiceBooking,
  tKontoBank,
  mwst,
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
