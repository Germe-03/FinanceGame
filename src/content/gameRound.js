const ACCOUNT_TYPES = Object.freeze({
  active: "active",
  passive: "passive",
  expense: "expense",
  revenue: "revenue",
});

export const gameRound = Object.freeze({
  title: "Aufgabe 1: Buchungssätze",
  subtitle: "Buchungssätze trainieren",
  task:
    "Du startest mit einfachen Geschäftsfällen aus Bilanzkonten. Danach kommen Aufwand und Ertrag dazu, damit Du den Schritt in die Erfolgsrechnung bewusst nachvollziehst.",
  balanceOnlyTasks: Object.freeze({
    title: "Nur Aktiv- und Passivkonten",
    lead: "Löse zuerst diese 20 Geschäftsfälle. Jeder Buchungssatz enthält ausschliesslich Aktiv- und Passivkonten.",
    nextButtonLabel: "Weiter",
    tasks: freezeTasks([
      bookingTask("AP-01", "Die Inhaberin zahlt privates Startkapital auf das Bankkonto der Firma ein.", "CHF 30'000.00", "Bank", ACCOUNT_TYPES.active, "Eigenkapital", ACCOUNT_TYPES.passive),
      bookingTask("AP-02", "Für die Kasse wird Bargeld vom Bankkonto abgehoben.", "CHF 2'000.00", "Kasse", ACCOUNT_TYPES.active, "Bank", ACCOUNT_TYPES.active),
      bookingTask("AP-03", "Bargeld aus der Ladenkasse wird am Abend auf das Bankkonto einbezahlt.", "CHF 1'450.00", "Bank", ACCOUNT_TYPES.active, "Kasse", ACCOUNT_TYPES.active),
      bookingTask("AP-04", "Die Firma kauft eine neue Schleifmaschine auf Rechnung.", "CHF 8'600.00", "Maschinen", ACCOUNT_TYPES.active, "Verbindlichkeiten LL", ACCOUNT_TYPES.passive),
      bookingTask("AP-05", "Die offene Rechnung für die Schleifmaschine wird per Bank bezahlt.", "CHF 8'600.00", "Verbindlichkeiten LL", ACCOUNT_TYPES.passive, "Bank", ACCOUNT_TYPES.active),
      bookingTask("AP-06", "Ein Kunde bezahlt eine bereits verbuchte Rechnung per Banküberweisung.", "CHF 3'280.00", "Bank", ACCOUNT_TYPES.active, "Forderungen LL", ACCOUNT_TYPES.active),
      bookingTask("AP-07", "Eine Kundin bezahlt eine alte offene Rechnung bar am Empfang.", "CHF 740.00", "Kasse", ACCOUNT_TYPES.active, "Forderungen LL", ACCOUNT_TYPES.active),
      bookingTask("AP-08", "Die Bank gewährt der Firma ein kurzfristiges Darlehen und schreibt den Betrag gut.", "CHF 15'000.00", "Bank", ACCOUNT_TYPES.active, "Bankdarlehen", ACCOUNT_TYPES.passive),
      bookingTask("AP-09", "Ein Teil des Bankdarlehens wird zurückbezahlt.", "CHF 5'000.00", "Bankdarlehen", ACCOUNT_TYPES.passive, "Bank", ACCOUNT_TYPES.active),
      bookingTask("AP-10", "Ein Lieferwagen wird gekauft; die Finanzierung erfolgt über ein langfristiges Darlehen.", "CHF 24'000.00", "Fahrzeuge", ACCOUNT_TYPES.active, "Darlehen", ACCOUNT_TYPES.passive),
      bookingTask("AP-11", "Für die Werkstatt werden langlebige Spezialwerkzeuge bar gekauft.", "CHF 1'180.00", "Werkzeuge", ACCOUNT_TYPES.active, "Kasse", ACCOUNT_TYPES.active),
      bookingTask("AP-12", "Ein Geschäftscomputer wird direkt per Bank bezahlt.", "CHF 2'350.00", "Informatikanlagen", ACCOUNT_TYPES.active, "Bank", ACCOUNT_TYPES.active),
      bookingTask("AP-13", "Ein Lieferant wandelt eine offene Rechnung in ein längerfristiges Darlehen um.", "CHF 6'400.00", "Verbindlichkeiten LL", ACCOUNT_TYPES.passive, "Darlehen", ACCOUNT_TYPES.passive),
      bookingTask("AP-14", "Ein Kunde bezahlt eine Anzahlung für einen späteren Auftrag auf das Bankkonto.", "CHF 4'500.00", "Bank", ACCOUNT_TYPES.active, "Erhaltene Anzahlungen", ACCOUNT_TYPES.passive),
      bookingTask("AP-15", "Eine erhaltene Kundenanzahlung wird zurückerstattet.", "CHF 1'200.00", "Erhaltene Anzahlungen", ACCOUNT_TYPES.passive, "Bank", ACCOUNT_TYPES.active),
      bookingTask("AP-16", "Material für das Lager wird auf Rechnung gekauft und als Vorrat erfasst.", "CHF 3'900.00", "Materialvorrat", ACCOUNT_TYPES.active, "Verbindlichkeiten LL", ACCOUNT_TYPES.passive),
      bookingTask("AP-17", "Eine Lieferantenrechnung wird über das Postkonto bezahlt.", "CHF 2'150.00", "Verbindlichkeiten LL", ACCOUNT_TYPES.passive, "Post", ACCOUNT_TYPES.active),
      bookingTask("AP-18", "Vom Bankkonto wird Geld auf das Postkonto übertragen.", "CHF 7'000.00", "Post", ACCOUNT_TYPES.active, "Bank", ACCOUNT_TYPES.active),
      bookingTask("AP-19", "Die Firma kauft ein kleines Werkstattlager und übernimmt dafür eine Hypothek.", "CHF 120'000.00", "Betriebsliegenschaft", ACCOUNT_TYPES.active, "Hypotheken", ACCOUNT_TYPES.passive),
      bookingTask("AP-20", "Ein Gesellschafter stellt der Firma ein zusätzliches Darlehen auf dem Bankkonto zur Verfügung.", "CHF 12'000.00", "Bank", ACCOUNT_TYPES.active, "Darlehen Gesellschafter", ACCOUNT_TYPES.passive),
    ]),
  }),
  incomeStatementIntro: Object.freeze({
    title: "Aufwand und Ertrag kommen dazu",
    body:
      "Bis jetzt hast Du nur Bilanzkonten bewegt. Ab jetzt kommen Geschäftsfälle dazu, die den Gewinn verändern: Aufwand vermindert den Erfolg, Ertrag erhöht ihn. Du buchst weiterhin nach Soll und Haben, kombinierst nun aber Aktiv-, Passiv-, Aufwand- und Ertragskonten.",
    nextButtonLabel: "Weiter",
  }),
  mixedTasks: Object.freeze({
    title: "Gemischte Buchungssätze",
    lead: "Jetzt folgen 40 Geschäftsfälle mit Bilanzkonten sowie Aufwand und Ertrag. Die Beispiele sind ohne MWST formuliert, damit der Fokus auf Soll und Haben bleibt.",
    tasks: freezeTasks([
      bookingTask("GE-01", "Die Monatsmiete für die Werkstatt wird per Bank bezahlt.", "CHF 2'800.00", "Mietaufwand", ACCOUNT_TYPES.expense, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-02", "Die Löhne der Mitarbeitenden werden vom Bankkonto ausbezahlt.", "CHF 18'500.00", "Lohnaufwand", ACCOUNT_TYPES.expense, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-03", "Kleinmaterial für einen Kundenauftrag wird bar gekauft.", "CHF 460.00", "Materialaufwand", ACCOUNT_TYPES.expense, "Kasse", ACCOUNT_TYPES.active),
      bookingTask("GE-04", "Ein Lieferant stellt Verbrauchsmaterial auf Rechnung.", "CHF 1'980.00", "Materialaufwand", ACCOUNT_TYPES.expense, "Verbindlichkeiten LL", ACCOUNT_TYPES.passive),
      bookingTask("GE-05", "Die offene Materialrechnung aus GE-04 wird per Bank bezahlt.", "CHF 1'980.00", "Verbindlichkeiten LL", ACCOUNT_TYPES.passive, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-06", "Eine Reparaturarbeit wird einem Kunden auf Rechnung gestellt.", "CHF 3'600.00", "Forderungen LL", ACCOUNT_TYPES.active, "Dienstleistungsertrag", ACCOUNT_TYPES.revenue),
      bookingTask("GE-07", "Ein kleiner Barverkauf von Ersatzteilen wird direkt in der Kasse erfasst.", "CHF 320.00", "Kasse", ACCOUNT_TYPES.active, "Warenertrag", ACCOUNT_TYPES.revenue),
      bookingTask("GE-08", "Ein Kunde bezahlt eine offene Dienstleistungsrechnung per Bank.", "CHF 3'600.00", "Bank", ACCOUNT_TYPES.active, "Forderungen LL", ACCOUNT_TYPES.active),
      bookingTask("GE-09", "Die Jahresversicherung für den Lieferwagen wird per Bank bezahlt.", "CHF 1'260.00", "Versicherungsaufwand", ACCOUNT_TYPES.expense, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-10", "Die Telefon- und Internetrechnung trifft ein und wird noch nicht bezahlt.", "CHF 215.00", "Kommunikationsaufwand", ACCOUNT_TYPES.expense, "Verbindlichkeiten LL", ACCOUNT_TYPES.passive),
      bookingTask("GE-11", "Die offene Telefon- und Internetrechnung wird per Bank bezahlt.", "CHF 215.00", "Verbindlichkeiten LL", ACCOUNT_TYPES.passive, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-12", "Büromaterial wird direkt per Bank bezahlt.", "CHF 390.00", "Büroaufwand", ACCOUNT_TYPES.expense, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-13", "Für eine Montagearbeit wird eine Rechnung an den Kunden erstellt.", "CHF 5'850.00", "Forderungen LL", ACCOUNT_TYPES.active, "Dienstleistungsertrag", ACCOUNT_TYPES.revenue),
      bookingTask("GE-14", "Der Kunde aus GE-13 bezahlt die Rechnung vollständig per Bank.", "CHF 5'850.00", "Bank", ACCOUNT_TYPES.active, "Forderungen LL", ACCOUNT_TYPES.active),
      bookingTask("GE-15", "Die Bank schreibt Zinsen auf dem Geschäftskonto gut.", "CHF 42.00", "Bank", ACCOUNT_TYPES.active, "Zinsertrag", ACCOUNT_TYPES.revenue),
      bookingTask("GE-16", "Darlehenszinsen werden vom Bankkonto belastet.", "CHF 310.00", "Zinsaufwand", ACCOUNT_TYPES.expense, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-17", "Die jährliche Abschreibung auf einer Maschine wird verbucht.", "CHF 1'700.00", "Abschreibungsaufwand", ACCOUNT_TYPES.expense, "Maschinen", ACCOUNT_TYPES.active),
      bookingTask("GE-18", "Eine externe Werkstatt stellt Unterhaltsarbeiten am Lieferwagen auf Rechnung.", "CHF 880.00", "Fahrzeugaufwand", ACCOUNT_TYPES.expense, "Verbindlichkeiten LL", ACCOUNT_TYPES.passive),
      bookingTask("GE-19", "Die Unterhaltsrechnung für den Lieferwagen wird per Bank bezahlt.", "CHF 880.00", "Verbindlichkeiten LL", ACCOUNT_TYPES.passive, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-20", "Eine lokale Werbekampagne wird per Bank bezahlt.", "CHF 1'100.00", "Werbeaufwand", ACCOUNT_TYPES.expense, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-21", "Ein neuer Auftraggeber bezahlt eine Anzahlung für ein Projekt.", "CHF 2'500.00", "Bank", ACCOUNT_TYPES.active, "Erhaltene Anzahlungen", ACCOUNT_TYPES.passive),
      bookingTask("GE-22", "Die Anzahlung aus GE-21 wird nach Abschluss des Projekts als Ertrag erfasst.", "CHF 2'500.00", "Erhaltene Anzahlungen", ACCOUNT_TYPES.passive, "Dienstleistungsertrag", ACCOUNT_TYPES.revenue),
      bookingTask("GE-23", "Treibstoff für den Lieferwagen wird mit der Firmenkarte bezahlt.", "CHF 165.00", "Fahrzeugaufwand", ACCOUNT_TYPES.expense, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-24", "Eine Vermittlungsprovision wird bar eingenommen.", "CHF 240.00", "Kasse", ACCOUNT_TYPES.active, "Provisionsertrag", ACCOUNT_TYPES.revenue),
      bookingTask("GE-25", "Ein Lagerraum wird einem Partnerbetrieb untervermietet und in Rechnung gestellt.", "CHF 700.00", "Forderungen LL", ACCOUNT_TYPES.active, "Mietertrag", ACCOUNT_TYPES.revenue),
      bookingTask("GE-26", "Der Partnerbetrieb bezahlt die Lagermiete per Bank.", "CHF 700.00", "Bank", ACCOUNT_TYPES.active, "Forderungen LL", ACCOUNT_TYPES.active),
      bookingTask("GE-27", "Ein Weiterbildungskurs für die Lernende wird per Bank bezahlt.", "CHF 540.00", "Weiterbildungsaufwand", ACCOUNT_TYPES.expense, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-28", "Ein Lieferant gewährt nachträglich einen Rabatt auf eine offene Rechnung.", "CHF 180.00", "Verbindlichkeiten LL", ACCOUNT_TYPES.passive, "Materialaufwand", ACCOUNT_TYPES.expense),
      bookingTask("GE-29", "Eine uneinbringliche Kundenforderung wird abgeschrieben.", "CHF 950.00", "Debitorenverlust", ACCOUNT_TYPES.expense, "Forderungen LL", ACCOUNT_TYPES.active),
      bookingTask("GE-30", "Ein spontaner Serviceauftrag wird sofort bar bezahlt.", "CHF 610.00", "Kasse", ACCOUNT_TYPES.active, "Dienstleistungsertrag", ACCOUNT_TYPES.revenue),
      bookingTask("GE-31", "Die Stromrechnung der Werkstatt wird per Bank bezahlt.", "CHF 430.00", "Energieaufwand", ACCOUNT_TYPES.expense, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-32", "Eine Softwarelizenz für die Auftragsplanung wird auf Rechnung gekauft.", "CHF 960.00", "Informatikaufwand", ACCOUNT_TYPES.expense, "Verbindlichkeiten LL", ACCOUNT_TYPES.passive),
      bookingTask("GE-33", "Die Softwarelizenz aus GE-32 wird per Bank bezahlt.", "CHF 960.00", "Verbindlichkeiten LL", ACCOUNT_TYPES.passive, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-34", "Die Bank belastet Kontoführungsgebühren.", "CHF 28.00", "Bankspesen", ACCOUNT_TYPES.expense, "Bank", ACCOUNT_TYPES.active),
      bookingTask("GE-35", "Neue Ware wird auf Rechnung eingekauft und direkt als Warenaufwand erfasst.", "CHF 2'750.00", "Warenaufwand", ACCOUNT_TYPES.expense, "Verbindlichkeiten LL", ACCOUNT_TYPES.passive),
      bookingTask("GE-36", "Ein Kunde kauft Ware auf Rechnung.", "CHF 4'200.00", "Forderungen LL", ACCOUNT_TYPES.active, "Warenertrag", ACCOUNT_TYPES.revenue),
      bookingTask("GE-37", "Der Kunde aus GE-36 bezahlt die Rechnung auf das Bankkonto.", "CHF 4'200.00", "Bank", ACCOUNT_TYPES.active, "Forderungen LL", ACCOUNT_TYPES.active),
      bookingTask("GE-38", "Ein Bankdarlehen wird auf das Geschäftskonto ausbezahlt.", "CHF 10'000.00", "Bank", ACCOUNT_TYPES.active, "Bankdarlehen", ACCOUNT_TYPES.passive),
      bookingTask("GE-39", "Für einen Kundenauftrag wird eine externe Spezialistin auf Rechnung beigezogen.", "CHF 1'450.00", "Fremdleistungen", ACCOUNT_TYPES.expense, "Verbindlichkeiten LL", ACCOUNT_TYPES.passive),
      bookingTask("GE-40", "Eine Beratungsleistung für einen Geschäftskunden wird direkt per Bank bezahlt.", "CHF 1'320.00", "Bank", ACCOUNT_TYPES.active, "Dienstleistungsertrag", ACCOUNT_TYPES.revenue),
    ]),
  }),
  referenceActions: Object.freeze([
    Object.freeze({
      id: "kmu-chart",
      label: "KMU-Kontenplan",
      href: "./assets/accounting/kmu-kontenplan/Schweizer-Kontenrahmen-KMU.pdf",
    }),
    Object.freeze({
      id: "or-law",
      label: "OR",
      href: "./assets/legal/or/or.pdf",
    }),
  ]),
  buddyAction: Object.freeze({
    label: "KI-Buddy",
    enabled: false,
    hint: "Der KI-Buddy wird später ergänzt.",
  }),
});

function bookingTask(id, scenario, amount, debitAccount, debitType, creditAccount, creditType) {
  return Object.freeze({
    id,
    scenario,
    amount,
    debit: Object.freeze({ account: debitAccount, type: debitType }),
    credit: Object.freeze({ account: creditAccount, type: creditType }),
  });
}

function freezeTasks(tasks) {
  return Object.freeze(tasks);
}