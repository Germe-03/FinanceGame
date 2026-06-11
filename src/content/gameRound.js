import tasksData from "./tasks.json" with { type: "json" };
import { getAccountLedgerItems } from "../domain/booking.js";
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

const accountPlanSearch = Object.freeze({
  title: "Aufgabe 1: Kontenplan-Suchspiel",
  lead: "Wähle zu jedem Geschäftsfall das Konto, das im Schweizer KMU-Kontenplan am besten passt. Es geht noch nicht um vollständige Buchungssätze.",
  nextButtonLabel: "Weiter",
  tasks: Object.freeze([
    accountPlanTask("KP-01", "Die Firma besitzt Guthaben auf dem Geschäftskonto bei der Bank.", "Bank", "active", ["Kasse", "Bank", "Forderungen LL", "Bankdarlehen"], "Bank ist ein Aktivkonto und zeigt das Guthaben auf dem Geschäftskonto. Kasse wäre Bargeld, Forderungen LL wären offene Kundenrechnungen, Bankdarlehen wäre eine Schuld gegenüber der Bank."),
    accountPlanTask("KP-02", "Im Laden liegt Bargeld in der Kasse.", "Kasse", "active", ["Bank", "Warenertrag", "Kasse", "Verbindlichkeiten LL"], "Kasse ist das Aktivkonto für Bargeld. Bank wäre Buchgeld, Warenertrag betrifft Verkäufe, Verbindlichkeiten LL wären offene Lieferantenrechnungen."),
    accountPlanTask("KP-03", "Ein Kunde hat eine Rechnung erhalten, aber noch nicht bezahlt.", "Forderungen LL", "active", ["Forderungen LL", "Bank", "Dienstleistungsertrag", "Kasse"], "Forderungen LL ist das Aktivkonto für offene Kundenrechnungen. Bank oder Kasse würden erst bei Zahlung passen; Dienstleistungsertrag beschreibt den Ertrag, nicht die offene Forderung."),
    accountPlanTask("KP-04", "Eine Lieferantenrechnung ist eingetroffen und noch offen.", "Verbindlichkeiten LL", "passive", ["Verbindlichkeiten LL", "Forderungen LL", "Bank", "Materialaufwand"], "Verbindlichkeiten LL ist das Passivkonto für offene Lieferantenrechnungen. Forderungen LL betrifft Kunden, Bank erst die Zahlung, Materialaufwand den Aufwandteil eines Einkaufs."),
    accountPlanTask("KP-05", "Die Bank gewährt der Firma ein Darlehen, das später zurückbezahlt werden muss.", "Bankdarlehen", "passive", ["Bank", "Darlehensforderungen", "Bankdarlehen", "Eigenkapital"], "Bankdarlehen ist eine Schuld und damit ein Passivkonto. Bank wäre das erhaltene Guthaben, Darlehensforderungen wären Ansprüche gegenüber Dritten, Eigenkapital stammt von Eigentümern."),
    accountPlanTask("KP-06", "Die Firma verkauft Handelswaren an Kunden und erzielt damit Umsatz.", "Warenertrag", "revenue", ["Warenaufwand", "Forderungen LL", "Warenertrag", "Produktionserlöse"], "Warenertrag ist das passende Ertragskonto für den Verkauf von Handelswaren. Warenaufwand betrifft den Einkauf, Forderungen LL die offene Rechnung, Produktionserlöse eher selbst hergestellte Leistungen."),
    accountPlanTask("KP-07", "Handelswaren werden eingekauft und direkt als Aufwand erfasst.", "Warenaufwand", "expense", ["Warenertrag", "Warenbestand", "Materialaufwand", "Warenaufwand"], "Warenaufwand ist passend, wenn eingekaufte Handelswaren direkt als Aufwand erfasst werden. Warenertrag wäre Verkauf, Warenbestand wäre Lageraktivierung, Materialaufwand eher Verbrauchsmaterial für Produktion."),
    accountPlanTask("KP-08", "Die Miete für Geschäftsräume wird verbucht.", "Raumaufwand", "expense", ["Bank", "Raumaufwand", "Mobiliar", "Sonstiger Betriebsaufwand"], "Raumaufwand ist das Aufwandkonto für Miete und Räume. Bank wäre nur das Zahlungsmittel, Mobiliar ein Anlagekonto, Sonstiger Betriebsaufwand zu ungenau für Miete."),
    accountPlanTask("KP-09", "Die Firma besitzt einen Lieferwagen, der für Kundenaufträge genutzt wird.", "Fahrzeuge", "active", ["Fahrzeugaufwand", "Maschinen", "Fahrzeuge", "Bankdarlehen"], "Fahrzeuge ist das Aktivkonto für firmeneigene Fahrzeuge. Fahrzeugaufwand betrifft laufende Kosten, Maschinen sind Produktionsanlagen, Bankdarlehen ist eine Schuld."),
    accountPlanTask("KP-10", "Die KMU kauft einen Laptop für CHF 1'400.00, der mehrere Jahre genutzt wird.", "Büromaschinen", "active", ["Informatikaufwand", "Büromaschinen", "Warenaufwand", "Maschinen"], "Büromaschinen passt, weil der Laptop mehrere Jahre genutzt wird und zum Anlagevermögen gehört. Informatikaufwand wäre eher für laufende IT-Kosten oder Kleinanschaffungen; Warenaufwand und Maschinen passen fachlich weniger."),
    accountPlanTask("KP-11", "Neue Bürotische und Stühle werden mehrere Jahre im Büro genutzt.", "Mobiliar", "active", ["Mobiliar", "Raumaufwand", "Büromaschinen", "Sonstiger Betriebsaufwand"], "Mobiliar ist das Aktivkonto für länger nutzbare Möbel. Raumaufwand wäre Miete, Büromaschinen technische Geräte, Sonstiger Betriebsaufwand wäre zu unspezifisch."),
    accountPlanTask("KP-12", "Eine Jahreslizenz für die Auftragsplanungssoftware wird bezahlt.", "Informatikaufwand", "expense", ["Büromaschinen", "Dienstleistungsertrag", "Bankdarlehen", "Informatikaufwand"], "Informatikaufwand passt für laufende Software- und IT-Kosten. Büromaschinen wäre ein aktivierter Gegenstand, Dienstleistungsertrag ein Ertrag, Bankdarlehen eine Schuld."),
    accountPlanTask("KP-13", "Die Inhaberin erhöht das dauerhaft in der Firma gebundene Kapital.", "Eigenkapital", "passive", ["Bank", "Darlehen", "Eigenkapital", "Warenertrag"], "Eigenkapital ist das Passivkonto für das Kapital der Eigentümerseite. Bank wäre nur das Zahlungsmittel, Darlehen eine fremde Schuld, Warenertrag ein Umsatzkonto."),
    accountPlanTask("KP-14", "Für den Lieferwagen fallen laufende Reparatur- und Servicekosten an.", "Fahrzeugaufwand", "expense", ["Fahrzeugaufwand", "Fahrzeuge", "Maschinen", "Bank"], "Fahrzeugaufwand passt für laufende Kosten rund um firmeneigene Fahrzeuge. Fahrzeuge wäre das Anlagekonto, Maschinen betreffen Produktionsanlagen, Bank nur das Zahlungsmittel."),
    accountPlanTask("KP-15", "Die Jahresprämie für die Betriebsversicherung wird als Aufwand erfasst.", "Versicherungsaufwand", "expense", ["Bank", "Versicherungsaufwand", "Raumaufwand", "Verbindlichkeiten LL"], "Versicherungsaufwand ist das Konto für Versicherungsprämien. Bank oder Verbindlichkeiten LL zeigen nur Zahlung oder offene Rechnung, Raumaufwand wäre Miete."),
    accountPlanTask("KP-16", "Die Firma bezahlt Zinskosten für ein aufgenommenes Darlehen.", "Finanzaufwand", "expense", ["Bankdarlehen", "Finanzaufwand", "Bank", "Finanzertrag"], "Finanzaufwand erfasst Zinskosten und ähnliche Finanzierungskosten. Bankdarlehen ist die Schuld selbst, Bank das Zahlungsmittel, Finanzertrag wäre Zinsertrag."),
    accountPlanTask("KP-17", "Die Bank schreibt der Firma einen Zinsertrag gut.", "Finanzertrag", "revenue", ["Finanzaufwand", "Bank", "Dienstleistungsertrag", "Finanzertrag"], "Finanzertrag passt für erhaltene Zinsen. Finanzaufwand wäre das Gegenteil, Bank zeigt nur das Guthaben, Dienstleistungsertrag betrifft verrechnete Kundenleistungen."),
    accountPlanTask("KP-18", "Handelswaren liegen am Jahresende noch im Lager und werden als Bestand geführt.", "Warenbestand", "active", ["Warenbestand", "Warenaufwand", "Warenertrag", "Materialaufwand"], "Warenbestand ist das Aktivkonto für vorhandene Handelswaren im Lager. Warenaufwand wäre Verbrauch oder Einkauf als Aufwand, Warenertrag der Verkauf."),
    accountPlanTask("KP-19", "Die Firma gewährt einem Partnerbetrieb ein langfristiges Darlehen.", "Darlehensforderungen", "active", ["Bankdarlehen", "Darlehensforderungen", "Bank", "Forderungen LL"], "Darlehensforderungen ist ein Aktivkonto für ausgeliehenes Geld, das zurückgefordert werden kann. Bankdarlehen wäre eine eigene Schuld, Forderungen LL normale Kundenrechnungen."),
    accountPlanTask("KP-20", "Auf dem PostFinance-Konto der Firma liegt ein Guthaben.", "Post", "active", ["Post", "Bank", "Kasse", "Forderungen LL"], "Post ist das Aktivkonto für Guthaben auf dem PostFinance-Konto. Bank wäre ein Bankkonto, Kasse Bargeld, Forderungen LL offene Kundenrechnungen."),
  ]),
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
  tasks: Object.freeze([
    invoiceTask("RG-01", "Papeterie Mueller AG verrechnet Verwaltungs- und Bueromaterial fuer das Buero.", "CHF 123.10", "Verwaltungsaufwand", "expense", "Verbindlichkeiten LL", "passive", "Das Verwaltungs- und Bueromaterial wird als Verwaltungsaufwand verbucht. Da die Rechnung noch offen ist, steht Verbindlichkeiten LL im Haben.", "rechnung_1.png"),
    invoiceTask("RG-02", "TechSupport Bern GmbH stellt eine Rechnung fuer Serverreparatur und Anfahrt.", "CHF 565.00", "Informatikaufwand", "expense", "Verbindlichkeiten LL", "passive", "Serverreparatur und IT-Unterstuetzung gehoeren hier in den Informatikaufwand. Die offene Rechnung wird als Verbindlichkeiten LL erfasst.", "rechnung_2.png"),
    invoiceTask("RG-03", "EKZ Elektrizitaetswerke verrechnen den Stromverbrauch fuer Mai 2024.", "CHF 372.00", "Energieaufwand", "expense", "Verbindlichkeiten LL", "passive", "Der Stromverbrauch wird auf Energieaufwand 6400 gebucht. Die Rechnung bleibt offen, deshalb steht Verbindlichkeiten LL im Haben.", "rechnung_3.png"),
    invoiceTask("RG-04", "Immobilien Keller AG verrechnet die Miete fuer das Geschaeftslokal im Juni 2024.", "CHF 1'800.00", "Raumaufwand", "expense", "Verbindlichkeiten LL", "passive", "Die Miete fuer das Geschaeftslokal gehoert in den Raumaufwand. Weil die Rechnung noch nicht bezahlt ist, steht Verbindlichkeiten LL im Haben.", "rechnung_4.png"),
    invoiceTask("RG-05", "Garage Schneider stellt die Inspektion des VW Transporters inklusive Material in Rechnung.", "CHF 415.00", "Fahrzeugaufwand", "expense", "Verbindlichkeiten LL", "passive", "Inspektion und Material fuer den Firmenwagen gehoeren in den Fahrzeugaufwand. Die offene Rechnung wird als Verbindlichkeiten LL erfasst.", "rechnung_5.png"),
  ]),
});

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

function accountPlanTask(id, scenario, correctAccount, correctType, optionAccounts, explanation) {
  return Object.freeze({
    id,
    scenario,
    correctAccount,
    correctType,
    options: Object.freeze(optionAccounts.map((account) => Object.freeze({ account, type: accountTypes[account] }))),
    explanation,
  });
}

function invoiceTask(id, scenario, amount, debitAccount, debitType, creditAccount, creditType, explanation, imageFile) {
  return Object.freeze({
    id,
    scenario,
    amount,
    image: Object.freeze({
      src: `./assets/accounting/rechnungen/${imageFile}`,
      alt: `Rechnung ${id.replace("RG-0", "")} zu ${scenario}`,
    }),
    debit: Object.freeze({ account: debitAccount, type: debitType }),
    credit: Object.freeze({ account: creditAccount, type: creditType }),
    explanation,
  });
}

