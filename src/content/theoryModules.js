// Jedes Modul verweist auf eine Markdown-Datei unter lernmodule/<id>.md.
export const theoryModules = Object.freeze([
  // Grundlagen
  { id: "finanzbuchhaltung",             name: "Finanzbuchhaltung" },
  { id: "betriebsbuchhaltung",           name: "Betriebsbuchhaltung" },
  { id: "konto-aufbau",                  name: "Kontoaufbau" },
  { id: "kontoarten",                    name: "Kontoarten" },
  { id: "buchungssaetze",                name: "Buchungssätze" },
  { id: "wb-konti",                      name: "WB-Konten & Minus-Konti" },
  // Abschluss
  { id: "bilanz",                        name: "Bilanz" },
  { id: "erfolgsrechnung",               name: "Erfolgsrechnung" },
  { id: "jahresabschluss",               name: "Jahresabschluss" },
  { id: "abschreibungen",                name: "Abschreibungen" },
  { id: "stille-reserven",               name: "Stille Reserven" },
  { id: "rechnungsabgrenzung",           name: "Rechnungsabgrenzung" },
  { id: "rueckstellungen",               name: "Rückstellungen" },
  { id: "periodenfremde-geschaeftsfaelle", name: "Periodenfremde Geschäftsfälle" },
  // Spezialthemen
  { id: "lohnabrechnung",                name: "Lohnabrechnung" },
  { id: "mehrwertsteuer",                name: "Mehrwertsteuer" },
  { id: "warenhandel",                   name: "Warenhandel" },
  { id: "wertschriften",                 name: "Wertschriften" },
  { id: "fremdwaehrungen",               name: "Fremdwährungen" },
  { id: "konto-privat",                  name: "Konto Privat" },
  { id: "dividendenausschuettung",       name: "Dividendenausschüttung" },
  { id: "kennzahlen",                    name: "Kennzahlen" },
  { id: "alle-konti",                    name: "Alle Konti erklärt" },
  // Rechtsformen
  { id: "einzelunternehmung",            name: "Einzelunternehmung" },
  { id: "kollektivgesellschaft",         name: "Kollektivgesellschaft" },
  { id: "kommanditgesellschaft",         name: "Kommanditgesellschaft" },
  { id: "gmbh",                          name: "GmbH" },
  { id: "aktiengesellschaft",            name: "Aktiengesellschaft (AG)" },
  { id: "gmbh-vs-ag",                    name: "GmbH vs. AG" },
  { id: "genossenschaft",                name: "Genossenschaft" },
  // Recht & Kontrolle
  { id: "revisionsarten",                name: "Revisionsarten" },
  { id: "or-arbeiten",                   name: "Arbeiten mit dem OR" },
]);
