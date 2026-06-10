export const configurationModules = [
  {
    id: "write-booking-entries",
    label: "Buchungssätze selber schreiben",
    description: "Du entscheidest Soll und Haben selbst und erhältst danach Feedback.",
  },
  {
    id: "classify-invoices",
    label: "Rechnungen selber kontieren",
    description: "Du wählst Konto, Betrag und MWST-Behandlung selbst aus.",
  },
  {
    id: "book-payments",
    label: "Zahlungen selber verbuchen",
    description: "Du ordnest Zahlungseingänge und Zahlungsausgänge den offenen Posten zu.",
  },
  {
    id: "search-or-articles",
    label: "OR-Artikel selber suchen",
    description: "Du schlägst im Obligationenrecht nach und wählst den passenden Artikel.",
  },
  {
    id: "use-account-plan",
    label: "KMU-Kontenplan selber verwenden",
    description: "Du suchst passende Konten im KMU-Kontenplan statt sie direkt vorgeschlagen zu bekommen.",
  },
  {
    id: "review-closing",
    label: "Abschlusskontrolle selber durchführen",
    description: "Du prüfst am Ende, ob Buchungen, offene Posten und Nachweise zusammenpassen.",
  },
];

export const standardConfigurationModes = [
  {
    id: "finance-complete",
    title: "Finanzkomplett",
    description: "Du machst die Finanzbuchhaltung möglichst vollständig selbst.",
    defaults: {
      "write-booking-entries": true,
      "classify-invoices": true,
      "book-payments": true,
      "search-or-articles": true,
      "use-account-plan": true,
      "review-closing": true,
    },
  },
  {
    id: "finance-management",
    title: "Finanzmanagement",
    description: "Du steuerst die wichtigsten Finanzentscheide, Detailarbeit wird teilweise vorbereitet.",
    defaults: {
      "write-booking-entries": false,
      "classify-invoices": true,
      "book-payments": false,
      "search-or-articles": true,
      "use-account-plan": true,
      "review-closing": true,
    },
  },
  {
    id: "basic-finance",
    title: "Grundlagen Finanzen",
    description: "Du übst die wichtigsten Grundlagen mit mehr Führung durch das Spiel.",
    defaults: {
      "write-booking-entries": true,
      "classify-invoices": true,
      "book-payments": false,
      "search-or-articles": false,
      "use-account-plan": true,
      "review-closing": false,
    },
  },
];

export const configurationDifficulties = [
  {
    id: "beginner",
    title: "Beginner",
    description: "Beginner startet mit Aktiv- und Passivbuchungen; die Erfolgsrechnung kommt später dazu.",
    firstFocus: "Aktiv- und Passivbuchungen",
  },
  {
    id: "advanced",
    title: "Fortgeschritten",
    description: "Fortgeschritten kombiniert Bilanzkonten und Erfolgsrechnung früher, aber noch mit klaren Hinweisen.",
    firstFocus: "Bilanzkonten mit ersten Erfolgskonten",
  },
  {
    id: "expert",
    title: "Experte",
    description: "Experte arbeitet mit gemischten Geschäftsfällen, weniger Hinweisen und schnellerem Wechsel zwischen Kontenarten.",
    firstFocus: "Gemischte Geschäftsfälle",
  },
];