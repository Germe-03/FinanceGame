import kontenplanData from "./tasks/kontenplan.json" with { type: "json" };
import buchungssaetzeData from "./tasks/buchungssaetze.json" with { type: "json" };
import rechnungenData from "./tasks/rechnungen.json" with { type: "json" };
import tKontoData from "./tasks/t-konto.json" with { type: "json" };
import mwstData from "./tasks/mwst.json" with { type: "json" };
import finanzthemenData from "./tasks/finanzthemen.json" with { type: "json" };
import accountsData from "./tasks/accounts.json" with { type: "json" };
import { getAccountLedgerItems } from "../domain/ledger.js";
import { topicRoute, subtaskRoute } from "../domain/navigation.js";

// Einzige Quelle fuer Kontoarten und Kontometadaten: Die Task-JSONs nennen nur Kontonamen,
// die Typen werden hier aus der Konto-Metadaten-JSON abgeleitet.
const accountTypes = Object.freeze(Object.fromEntries(
  accountsData.accounts.map((account) => [account.name, account.type]),
));

function toAccountSide(accountName) {
  return Object.freeze({ account: accountName, type: accountTypes[accountName] });
}

function toBookingTask(task) {
  if (task.noBooking) {
    return Object.freeze({ id: task.id, scenario: task.scenario, noBooking: true, noBookingReason: task.noBooking.reason });
  }
  const bookings = task.bookings.map((booking) => Object.freeze({
    amount: booking.amount,
    debit: toAccountSide(booking.debit),
    credit: toAccountSide(booking.credit),
  }));
  if (bookings.length === 1) {
    return Object.freeze({ id: task.id, scenario: task.scenario, ...bookings[0] });
  }
  return Object.freeze({ id: task.id, scenario: task.scenario, bookings: Object.freeze(bookings) });
}

function toInvoiceTask(task) {
  return Object.freeze({
    ...toBookingTask(task),
    explanation: task.explanation,
    image: Object.freeze({
      src: `./assets/accounting/rechnungen/${task.image}`,
      alt: `Rechnung ${task.id.replace("RG-0", "")} zu ${task.scenario}`,
    }),
  });
}

function toAccountPlanTask(task) {
  return Object.freeze({
    ...task,
    correctType: accountTypes[task.correctAccount],
    options: Object.freeze(task.options.map((account) => toAccountSide(account))),
  });
}

function toChoiceSection(section) {
  return Object.freeze({
    title: section.title,
    lead: section.lead,
    nextButtonLabel: "Weiter",
    choiceOptions: Object.freeze(section.choiceOptions.map(Object.freeze)),
    tasks: Object.freeze(section.tasks.map(Object.freeze)),
  });
}

function toBookingSection(section, nextButtonLabel = "Weiter") {
  return Object.freeze({
    title: section.title,
    lead: section.lead,
    nextButtonLabel,
    tasks: Object.freeze(section.tasks.map(toBookingTask)),
  });
}

const accountPlanSearch = Object.freeze({
  title: kontenplanData.title,
  lead: kontenplanData.lead,
  nextButtonLabel: "Weiter",
  tasks: Object.freeze(kontenplanData.tasks.map(toAccountPlanTask)),
});

const balanceOnlyTasks = toBookingSection(buchungssaetzeData.balanceOnly);
const mixedTasks = toBookingSection(buchungssaetzeData.mixed);

const incomeStatementIntro = Object.freeze({
  title: buchungssaetzeData.incomeStatementIntro.title,
  body: buchungssaetzeData.incomeStatementIntro.body,
  nextButtonLabel: "Weiter",
});

const bookingTask = Object.freeze({
  title: buchungssaetzeData.title,
  balanceOnlyTasks,
  incomeStatementIntro,
  mixedTasks,
});

const invoiceBooking = Object.freeze({
  title: rechnungenData.title,
  lead: rechnungenData.lead,
  tasks: Object.freeze(rechnungenData.tasks.map(toInvoiceTask)),
});

// Die T-Konto-Einträge werden aus den Buchungsdaten abgeleitet: Jeder neue
// Buchungssatz mit dem konfigurierten Konto erscheint automatisch im T-Konto.
const tKontoBank = Object.freeze({
  title: tKontoData.title,
  accountName: tKontoData.account.name,
  accountNumber: tKontoData.account.number,
  lead: tKontoData.lead,
  items: Object.freeze(getAccountLedgerItems([...balanceOnlyTasks.tasks, ...mixedTasks.tasks], tKontoData.account.name)),
  nextRoute: tKontoData.next.route,
  nextLabel: tKontoData.next.label,
});

const mwstBookingsBasic = toBookingSection(mwstData.bookingsBasic);
const mwstBookingsAdvanced = toBookingSection(mwstData.bookingsAdvanced, "Weiter zum T-Konto");

const mwst = Object.freeze({
  title: mwstData.title,
  classification: toChoiceSection(mwstData.classification),
  bookingsBasic: mwstBookingsBasic,
  vorsteuerSplit: toChoiceSection(mwstData.vorsteuerSplit),
  bookingsAdvanced: mwstBookingsAdvanced,
  tKonto: Object.freeze({
    title: mwstData.tKonto.title,
    accountName: mwstData.tKonto.account.name,
    accountNumber: mwstData.tKonto.account.number,
    lead: mwstData.tKonto.lead,
    items: Object.freeze(getAccountLedgerItems([...mwstBookingsBasic.tasks, ...mwstBookingsAdvanced.tasks], mwstData.tKonto.account.name)),
  }),
});

// Inhaltsübersicht: die finanzwirtschaftlichen Themen aus dem Lehrmittel.
// Jedes Thema ist eine eigene Aufgabe und verlinkt auf seine Themen-Route.
const financeTopics = Object.freeze({
  section: finanzthemenData.section,
  title: finanzthemenData.title,
  lead: finanzthemenData.lead,
  topics: Object.freeze(finanzthemenData.topics.map((topic) => Object.freeze({
    nr: topic.nr,
    title: topic.title,
    route: topicRoute(topic.nr),
    subtasks: Object.freeze((topic.subtasks ?? []).map((subtask) => Object.freeze({
      nr: subtask.nr,
      title: subtask.title,
      route: subtaskRoute(topic.nr, subtask.nr),
    }))),
  }))),
});

// «Alte Aufgaben» bündelt die bisherigen Aufgaben 1–5 als eine Sammelaufgabe.
const legacyTasks = Object.freeze({
  id: "alte-aufgaben",
  title: "Alte Aufgaben",
  lead: "Alle bisherigen Aufgaben (1–5) zum Üben.",
  tasks: Object.freeze([
    Object.freeze({ nr: 1, title: accountPlanSearch.title, route: "spiel/kontenplan" }),
    Object.freeze({ nr: 2, title: bookingTask.title, route: "spiel/aktiv-passiv" }),
    Object.freeze({ nr: 3, title: invoiceBooking.title, route: "spiel/rechnungen" }),
    Object.freeze({ nr: 4, title: tKontoBank.title, route: "spiel/t-konto" }),
    Object.freeze({ nr: 5, title: mwst.title, route: "spiel/mwst/zuordnen" }),
  ]),
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
  financeTopics,
  legacyTasks,
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
